const { DepositHistory } = require("../../models/depositHistoryModel");
const { WalletAddress } = require("../../models/walletAddressModel");
const { DepositAddress } = require("../../models/depositAddressModel")
const { Asset } = require("../../models/Asset");
const { Wallets } = require("../../models/walletModel");
const { Users } = require("../../models/usersModel");
const { moveEthToAdmin, moveErc20TokenToAdmin } = require("../../services/evmBalanceUpdate/evmBalanceUpdate");
const { createNotification } = require("../../services/notification/notificationService");
const { getOrCreateWallet } = require("../../services/wallet/walletService");
const { findApiKeyByValue } = require("../../services/merchantApiKey.service");
const { decrypt } = require("../../services/encryption/encryptData");
const { validateAddress } = require("../../utils/validateAddress");
const { checkEvmAddress, checkTronAddress, checkSolanaAddress } = require("../../utils/checkContractAddress");
const { sendIpnNotification } = require("../../services/ipn/ipnService");
const { Transaction } = require("../../models/transactionModel");


const formatDepositAmount = (value, decimals = 18) => {
  if (value === null || value === undefined) {
    return null;
  }

  const amount = String(value).trim();

  if (!/^\d+(\.\d+)?$/.test(amount)) {
    return null;
  }

  const decimalPlaces = Number(decimals);

  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
    return null;
  }

  const [integerPart, fractionalPart = ""] = amount.split(".");

  if (fractionalPart.length > decimalPlaces) {
    return null;
  }

  const cleanFraction = fractionalPart.replace(/0+$/, "");

  return cleanFraction
    ? `${integerPart}.${cleanFraction}`
    : integerPart;
};

const validateAddressForNetwork = async (address, networkDoc) => {
  const networkType = networkDoc?.type || "";

  if (networkType === "EVM") {
    const result = await checkEvmAddress(
      address,
      networkDoc?.networkSymbol || networkType,
      networkDoc?.rpcUrl
    );

    return result.valid;
  }

  if (networkType === "TRON" || networkType === "TRX") {
    const result = await checkTronAddress(address, networkDoc?.rpcUrl);

    return result.valid;
  }

  if (networkType === "SOL" || networkType === "SOLANA") {
    const result = await checkSolanaAddress(address, networkDoc?.rpcUrl);

    return result.valid;
  }

  return true;
};

const transferTokenReceiver = async (req, reply) => {
  try {
    const {
      address,
      amount,
      coin,
      txId,
      from,
      contractAddress,
      network,
      apiKey,
    } = req.validatedData || req.body || {};


    const [fromWalletAddress, fromDepositAddress] = await Promise.all([
      WalletAddress.findOne({ address: from }).select("_id").lean(),
      DepositAddress.findOne({ address: from }).select("_id").lean(),
    ]);

    if (fromWalletAddress || fromDepositAddress) {
      return reply.code(400).send({
        success: false,
        message: "Invalid From Address",
      });
    }


    const tokenInfo = Object.values(coin || {})[0] || {};

    let assetSymbol;
    const addressCheck = await WalletAddress.findOne({ address })
      .select("userId address networkType +privateKey")
      .lean();

    if (tokenInfo.symbol) {
      assetSymbol = tokenInfo.symbol;
    } else {
      assetSymbol = network;
    }

    const symbol = tokenInfo.symbol || null;


    const depositHistoryAddress = await DepositHistory.findOne({
      address,
    })
      .select("_id ")
      .lean();

    const existingDeposit = await DepositHistory.findOne({ txId }).lean();

    if (existingDeposit) {
      return reply.code(409).send({
        success: false,
        message: "A deposit with the same txId already exists",
      });
    }


    const assetCheck = await Asset.findOne({
      assetSymbol,
      status: true,
    })
      .populate({
        path: "networks.networkId",
        match: { status: true },
        select: "networkSymbol networkName chainId status type rpcUrl",
      })
      .lean();

    if (!assetCheck) {
      return reply.code(404).send({
        success: false,
        message: "Active asset not found",
      });
    }


    const networkEntry = assetCheck.networks.find(
      (item) =>
        item.networkId &&
        item.networkId.networkSymbol === network
    );

    if (!networkEntry) {
      return reply.code(404).send({
        success: false,
        message: `${network} network is not configured for ${assetSymbol}`,
      });
    }

    const networkType = networkEntry.networkId?.type || networkEntry.networkId?.networkSymbol || network;

    if (!validateAddress(address, networkType)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid address for the selected network",
      });
    }
    if (!validateAddress(from, networkType)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid from address Format",
      });
    }


    if (contractAddress) {
      const isContractValid = await validateAddressForNetwork(
        contractAddress,
        networkEntry.networkId
      );

      if (!isContractValid) {
        return reply.code(400).send({
          success: false,
          message: "Invalid contract address for the selected network",
        });
      }
    }

    const networkDecimal = networkEntry.decimal ?? 18;
    const depositAmount = formatDepositAmount(amount, networkDecimal);

    if (depositAmount === null) {
      return reply.code(400).send({
        success: false,
        message: "Invalid deposit amount",
      });
    }

    const minDeposit = Number(networkEntry.minDepositAmount ?? 0);
    const maxDeposit = Number(networkEntry.maxDepositAmount ?? 0);

    if (depositAmount < minDeposit) {
      return reply.code(400).send({
        success: false,
        message: `Minimum deposit amount is ${minDeposit} ${assetSymbol} on ${network}`,
      });
    }

    if (maxDeposit > 0 && depositAmount > maxDeposit) {
      return reply.code(400).send({
        success: false,
        message: `Maximum deposit amount is ${maxDeposit} ${assetSymbol} on ${network}`,
      });
    }

    const networkId = networkEntry.networkId._id || networkEntry.networkId.id;

    const depositAddress = address;
    const depositAssetSymbol = assetCheck.assetSymbol || assetSymbol || "asset";
    const depositAssetName = assetCheck.assetName || depositAssetSymbol;
    const depositNetworkName =
      networkEntry.networkId?.networkName || depositAssetName;


    if (depositHistoryAddress) {

      if (!addressCheck) {
        return reply.code(404).send({
          success: false,
          message: "Address not found",
        });
      }

      const wallet = await getOrCreateWallet(
        addressCheck.userId,
        assetCheck._id
      );


      await Wallets.findByIdAndUpdate(
        wallet._id,
        {
          $inc: {
            free: depositAmount,
            total: depositAmount,
          },
        },
        { new: true }
      );

      if (!addressCheck.privateKey) {
        return reply.code(404).send({
          success: false,
          message: "Wallet private key not found",
        });
      }
      console.log(contractAddress, 'contract');

      try {
        let sweepResult;
        if (contractAddress) {
          sweepResult = await moveErc20TokenToAdmin({
            usrAddress: addressCheck.address,
            usrPrivateKey: decrypt(addressCheck.privateKey),
            amount: depositAmount,
            contractAddress: contractAddress,
          });
        } else {
          sweepResult = await moveEthToAdmin({
            usrAddress: addressCheck.address,
            usrPrivateKey: decrypt(addressCheck.privateKey),
            amount: depositAmount,
          });
        }
        const sweepFailed = sweepResult && (sweepResult.status === false || sweepResult.success === false);
        if (sweepFailed) {
          throw new Error(sweepResult?.message || "Admin wallet sweep returned failure");
        }

      } catch (sweepError) {
        console.error("Admin wallet sweep error:", {
          message: sweepError.message,
        });

        return reply.code(502).send({
          success: false,
          message: "Admin wallet sweep failed",
        });
      }
      const depositRecord = await DepositHistory.create({
        userId: addressCheck.userId,
        address,
        amount: depositAmount,
        txId,
        from,
        contractAddress,
        network,
        symbol,
        decimal: networkDecimal,
        type: "deposit",
      });

      try {
        await createNotification({
          user_id: addressCheck.userId,
          admin_id: null,
          role: "user",
          title: "Deposit Amount Received",
          description: `Your deposit address ${depositAddress} has been created for ${depositAmount} ${depositAssetSymbol} on ${depositNetworkName}.`,
          type: "deposit",
          category: "TRANSACTION",
          status: "info",
          isRead: false,
          seen: false,
          createdBy: null,
        });
      } catch (notificationError) {
        console.error(
          "Deposit notification creation error:",
          notificationError
        );
      }
      try {
        const transaction = await Transaction.findOne({ merchantId: addressCheck.userId })
          .select("ipnUrl merchantId txnId")
          .lean();

        if (transaction?.ipnUrl) {
          const ipnPayload = {
            merchant_id: transaction.merchantId,
            transaction_id: depositRecord._id,
            txn_id: transaction.txnId,
            amount: depositAmount,
            currency1: assetCheck.assetSymbol,
            currency2: assetCheck.assetSymbol,
            network,
            address,
            from,
            transactionHash: depositRecord.txId,
            type: "payIn",
            status: "confirmed",
            received_amount: depositAmount,
            timestamp: new Date().toISOString(),
          };

          await sendIpnNotification(transaction.ipnUrl, ipnPayload);
        }
      } catch (ipnError) {
        console.error("IPN notification error:", ipnError.message);
      }

      return reply.code(201).send({
        success: true,
        message: "Deposit processed successfully",
        data: {
          ...depositRecord.toObject(),
          amount: depositAmount,
          asset: {
            id: assetCheck._id,
            name: depositAssetName,
            symbol: depositAssetSymbol,
          },
          network: {
            id: networkId,
            name: depositNetworkName,
            symbol: networkEntry.networkId?.networkSymbol || network,
            chainId: networkEntry.networkId?.chainId || null,
          },
          depositAddress: depositAddress,
        },
      });
    }

    const data = await WalletAddress.findOne({ address }).lean();
    const merchantId = data.userId;

    const merchant = await Users.findById(merchantId)
      .select("_id fullName email")
      .lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "Merchant not found",
      });
    }

    const merchantWallet = await getOrCreateWallet(
      merchantId,
      assetCheck._id
    );

    if (!merchantWallet) {
      return reply.code(404).send({
        success: false,
        message: "Merchant wallet not found",
      });
    }

    const depositRecord = await DepositHistory.create({
      merchantId,
      userId: merchantId,
      walletId: merchantWallet._id,
      address,
      amount: depositAmount,
      txId,
      from,
      contractAddress,
      network,
      symbol,
      decimal: networkDecimal,
      type: "payIn",
    });

    const updatedWallet = await Wallets.findByIdAndUpdate(
      merchantWallet._id,
      {
        $inc: {
          free: depositAmount,
          total: depositAmount,
        },
      },
      { new: true }
    );

    if (!updatedWallet) {
      throw new Error("Merchant wallet balance update failed");
    }

    try {
      await createNotification({
        user_id: merchantId,
        admin_id: null,
        role: "user",
        title: "Deposit Received",
        description: `A deposit of ${depositAmount} ${depositAssetSymbol} was received on ${depositNetworkName}.`,
        type: "deposit",
        category: "TRANSACTION",
        status: "success",
        isRead: false,
        seen: false,
        createdBy: null,
      });
    } catch (notificationError) {
      console.error(
        "Deposit notification creation error:",
        notificationError
      );
    }
    

    return reply.code(201).send({
      success: true,
      message: "Deposit processed successfully",
      data: {
        ...depositRecord.toObject(),
        amount: depositAmount,
        asset: {
          id: assetCheck._id,
          name: depositAssetName,
          symbol: depositAssetSymbol,
        },
        network: {
          id: networkId,
          name: depositNetworkName,
          symbol: networkEntry.networkId?.networkSymbol || network,
          chainId: networkEntry.networkId?.chainId || null,
        },
        depositAddress: depositAddress,
      },
    });
  } catch (error) {
    console.error("transferTokenReceiver error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  transferTokenReceiver,
};
