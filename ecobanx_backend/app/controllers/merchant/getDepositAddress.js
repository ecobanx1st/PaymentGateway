const { Transaction } = require("../../models/transactionModel");
const { Network } = require("../../models/Network");
const { Asset } = require("../../models/Asset");
const { validateAddress } = require("../../utils/validateAddress");
const { WalletAddress } = require("../../models/walletAddressModel");
const { Users } = require("../../models/usersModel");
const { KYC } = require("../../models/kycModel");
const { KYB } = require("../../models/kybModel");
const {
  createEvmWallet,
  createSolanaWallet,
  createTronWallet,
} = require("../../services/wallet/helpers/walletHelpers");
const { encrypt } = require("../../services/encryption/encryptData");

const getDepositAddress = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId;
    const {
      cmd,
      coin,
      network,
      txnId,
      buyerEmail,
      buyerFirstname,
      buyerLastname,
    } = req.validatedData || req.body || {};

    if (cmd !== "get_deposit_address") {
      return reply.code(400).send({ success: false, message: "Invalid cmd" });
    }

    if (!coin) {
      return reply.code(400).send({
        success: false,
        message: "Missing required field: coin",
      });
    }

    if (!network) {
      return reply.code(400).send({
        success: false,
        message: "Missing required field: network",
      });
    }
    const user = await Users.findOne({ _id: merchantId }).lean();
    if (user.accountType !== "business") {
     
        return reply.code(400).send({
          success: false,
          message: "Access denied.",
        });
    
      
    }

    if (user.accountType === "business") {
      const kyb = await KYB.findOne({
        userId: merchantId,
      }).lean();

      if (!kyb) {
        return reply.code(400).send({
          success: false,
          message:
            "Please complete your KYB verification before creating a wallet address.",
        });
      }

      if (kyb.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is pending admin approval. Please wait until your KYB is approved.",
        });
      }

      if (kyb.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification was rejected. Please resubmit your KYB for approval.",
        });
      }

      if (kyb.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is not approved yet. Please wait for admin approval.",
        });
      }
    }

    const coinSymbol = String(coin).toUpperCase().trim();
    const networkSymbol = String(network).toUpperCase().trim();

    const networkDoc = await Network.findOne({
      networkSymbol,
      status: true,
    }).lean();

    if (!networkDoc) {
      return reply.code(404).send({
        success: false,
        message: "Network not found",
      });
    }

    const asset = await Asset.findOne({
      assetSymbol: coinSymbol,
      "networks.networkId": networkDoc._id,
      status: true,
    }).lean();

    if (!asset) {
      return reply.code(404).send({
        success: false,
        message: `Asset ${coinSymbol} not found for this network`,
      });
    }

    if (!asset.depositStatus) {
      return reply.code(400).send({
        success: false,
        message: `Deposits are disabled for asset ${coinSymbol}`,
      });
    }

    const existingAddress = await WalletAddress.findOne({
      userId: merchantId,
      networkId: networkDoc._id,
      coin: coinSymbol,
    })
      .select("address")
      .lean();

    if (existingAddress && validateAddress(existingAddress.address, networkDoc.type || networkSymbol)) {
      return reply.code(200).send({
        success: true,
        result: {
          [coinSymbol]: {
            address: existingAddress.address,
            network: networkSymbol,
          },
        },
      });
    }

    const reusableAddress = await WalletAddress.findOne({
      userId: merchantId,
      networkType: networkDoc.type,
    })
      .select("address")
      .lean();

    if (reusableAddress && validateAddress(reusableAddress.address, networkDoc.type || networkSymbol)) {
      return reply.code(200).send({
        success: true,
        result: {
          [coinSymbol]: {
            address: reusableAddress.address,
            network: networkSymbol,
          },
        },
      });
    }

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
        return reply.code(400).send({
          success: false,
          message: `Unsupported network type: ${networkDoc.type}`,
        });
    }

    const depositAddress = await WalletAddress.create({
      userId: merchantId,
      address: wallet.address,
      hexAddress: wallet.hexAddress || null,
      publicKey: wallet.publicKey || null,
      privateKey: encrypt(wallet.privateKey),
      networkType: networkDoc.type,
    });

    if (!validateAddress(depositAddress.address, networkDoc.type || networkSymbol)) {
      await WalletAddress.deleteOne({ _id: depositAddress._id });
      return reply.code(500).send({
        success: false,
        message: `Generated deposit address is invalid for network ${networkSymbol}`,
      });
    }

    if (txnId) {
      await Transaction.updateOne(
        { txnId: txnId, merchantId },
        { address: depositAddress.address, network: networkSymbol }
      );
    }

    return reply.code(200).send({
      success: true,
      result: {
        [coinSymbol]: {
          address: depositAddress.address,
          network: networkSymbol,
        },
      },
    });
  } catch (error) {
    console.error("getDepositAddress error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getDepositAddress };
