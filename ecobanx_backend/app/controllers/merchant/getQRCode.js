const QRCode = require("qrcode");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { Transaction } = require("../../models/transactionModel");
const { Users } = require("../../models/usersModel");
const {
  createEvmWallet,
  createSolanaWallet,
  createTronWallet,
} = require("../../services/wallet/helpers/walletHelpers");
const { encrypt } = require("../../services/encryption/encryptData");
const { validateAddress } = require("../../utils/validateAddress");
const { DepositAddress } = require("../../models/depositAddressModel");

const getQRCode = async (req, reply) => {
  try {
    const {
      asset,
      network,
      // txnId,
    } = req.validatedData || req.body || {};

    const userId = req.user?.merchantId || req.user?._id || req.user?.id;

    const user = await Users.findById(userId).select("accountType").lean();

    if (user?.accountType && user.accountType !== "personal") {
      const validTypes = ["business", "superadmin"];
      if (!validTypes.includes(user.accountType)) {
        return reply.code(400).send({
          success: false,
          message: "Access denied.",
        });
      }
    }

    let assets;

    if (asset && network) {
      const coinSymbol = String(asset).toUpperCase().trim();
      const netSymbol = String(network).toUpperCase().trim();

      const networkDoc = await Network.findOne({
        networkSymbol: netSymbol,
        status: true,
      }).lean();

      if (!networkDoc) {
        return reply.code(404).send({
          success: false,
          message: "Network not found or inactive",
        });
      }

      const assetCheck = await Asset.findOne({
        assetSymbol: coinSymbol,
        "networks.networkId": networkDoc._id,
        status: true,
        depositStatus: true,
      }).lean();

      if (!assetCheck) {
        return reply.code(404).send({
          success: false,
          message: `Asset ${coinSymbol} not found for network ${netSymbol}`,
        });
      }

      assets = [
        {
          assetSymbol: assetCheck.assetSymbol,
          assetName: assetCheck.assetName,
          networkDoc,
          networkEntry: assetCheck.networks.find(
            (n) => String(n.networkId) === String(networkDoc._id)
          ),
        },
      ];
    } else {
      const networkDocs = await Network.find({ status: true }).lean();
      const networkMap = new Map(networkDocs.map((n) => [String(n._id), n]));

      assets = [];

      const allAssets = await Asset.find({
        status: true,
        depositStatus: true,
      })
        .populate({
          path: "networks.networkId",
          match: { status: true },
          select: "networkSymbol networkName networkType rpcUrl type decimal minDepositAmount maxDepositAmount",
        })
        .lean();

      for (const asset of allAssets) {
        for (const entry of asset.networks) {
          if (!entry.networkId || entry.networkId.status === false) continue;

          assets.push({
            assetSymbol: asset.assetSymbol,
            assetName: asset.assetName,
            networkDoc: entry.networkId,
            networkEntry: entry,
          });
        }
      }
    }

    const results = [];

    for (const item of assets) {
      const { assetSymbol, networkDoc, networkEntry } = item;

      // Check if an active address already exists for this user, asset, and network
      let existingDepositAddress = await DepositAddress.findOne({
        merchantId: userId,
        coin: assetSymbol,
        network: networkDoc.networkSymbol,
        isAddressLive: "true",
      }).lean();

      let address;
      let privateKey;
        // Create new wallet if no existing address found
        let wallet;

        switch (networkDoc.type) {
          case "EVM":
            wallet = createEvmWallet();
            break;
          case "SOL":
            wallet = createSolanaWallet();
            break;
          case "TRX":
            wallet = await createTronWallet();
            break;
          default:
            continue;
        }

        address = wallet.address;

        if (!validateAddress(address, networkDoc.type || networkDoc.networkSymbol)) {
          continue;
        }

        privateKey = encrypt(wallet.privateKey);

        let transactionId = null;

        // if (txnId) {
        //   const tx = await Transaction.findOne({ txnId, merchantId: userId })
        //     .select("_id")
        //     .lean();

        //   if (tx) {
        //     transactionId = tx._id;
        //   }
        // }

        // Save new deposit address
        await DepositAddress.create({
          merchantId: userId,
          transactionId,
          coin: assetSymbol,
          network: networkDoc.networkSymbol,
          networkId: networkDoc._id,
          isAddressLive: "true",
          address: address,
          encryptedPrivateKey: privateKey,
          walletIndex: 0,
          addressIndex: 0,
        });
      

      // Generate QR code from the address
      const qrCodeData = await QRCode.toDataURL(address, {
        errorCorrectionLevel: "M",
        width: 256,
        margin: 2,
      });

      results.push({
        assetSymbol,
        network: networkDoc.networkSymbol,
        address: address,
        qrcode: qrCodeData,
        // isNew: !existingDepositAddress, 
      });
    }

    return reply.code(200).send({
      success: true,
      data: {
        addresses: results,
      },
    });
  } catch (error) {
    console.error("getQRCode error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getQRCode };