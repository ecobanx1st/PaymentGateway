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
const { emitPaymentConfirmed } = require("../../socket/paymentSocketHandler");


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

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const exactAddressFilter = (value) => ({
  $regex: `^${escapeRegExp(value)}$`,
  $options: "i",
});

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
    console.log(req.validatedData, 'req.validatedData');


    const [isWalletAddress, isDepositAddress] = await Promise.all([
      WalletAddress.findOne({ address: exactAddressFilter(address) }).select("privateKey userId address").lean(),
      DepositAddress.findOne({ address: exactAddressFilter(address) }).select("encryptedPrivateKey merchantId address").lean(),
    ]);
    console.log(isWalletAddress, 'isWalletAddress');
    console.log(isDepositAddress, 'isDepositAddress');

    let coinMismatch = false;
    let networkMismatch = false;
    let mismatchReason = "";

    const markAddressDepositsFailed = async () => {
      try {
        await DepositHistory.updateMany(
          { address: exactAddressFilter(address), status: "pending" },
          { $set: { status: "failed", updatedAt: new Date() } }
        );
      } catch (markErr) {
        console.error("transferTokenReceiver: failed to mark deposit failed:", markErr.message);
      }
    };

    if (!isWalletAddress) {
    const checkAddresInTransaction = await Transaction.findOne({ address: exactAddressFilter(address) }).lean();
    console.log("🚀 ~ transferTokenReceiver ~ checkAddresInTransaction:", checkAddresInTransaction)
    if (checkAddresInTransaction && checkAddresInTransaction.receivedAmount > 0 ) {
      console.log("Deposit Address already exists in transaction");
      return reply.code(400).send({
        success: false,
        message: "Address already exists in transaction",
      });
    }

    if(coin && Object.keys(coin).length > 0){
      const checkCoin = Object.values(coin)[0]?.symbol;
      if( checkAddresInTransaction && checkAddresInTransaction.currency2 !== checkCoin ) {
        console.log(`Deposit Skipped Selected coin ${checkAddresInTransaction.currency2} But recieving amount from ${checkCoin}`);
        await markAddressDepositsFailed();
        coinMismatch = true;
        mismatchReason = `Coin mismatch: expected ${checkAddresInTransaction.currency2}, received ${checkCoin}`;
      } } else {
      if(coin && Object.keys(coin).length === 0){
        if(checkAddresInTransaction && checkAddresInTransaction.currency2 !== network ) {
          console.log(`Deposit Skipped Selected coin ${checkAddresInTransaction.currency2} But recieving amount from ${network}`);
          await markAddressDepositsFailed();
          coinMismatch = true;
          mismatchReason = `Coin mismatch: expected ${checkAddresInTransaction.currency2}, received ${network}`;
        }
    }}

     if (checkAddresInTransaction && checkAddresInTransaction.network !== network) {
      console.log(`Deposit Skipped Selected Network ${checkAddresInTransaction.network} But recieving amount from ${network}`);
      await markAddressDepositsFailed();
      networkMismatch = true;
      mismatchReason = `Network mismatch: expected ${checkAddresInTransaction.network}, received ${network}`;
    }

    const checkAddressInDepositHistory = await DepositHistory.findOne({ address: exactAddressFilter(address) }).sort({ createdAt: -1 }).select("address status type").lean();
    console.log("🚀 ~ transferTokenReceiver ~ checkAddressInDepositHistory:", checkAddressInDepositHistory);

    const isReusableDeposit = !!isWalletAddress;
    // If we have a mismatch, we still want to process but mark as failed
    // Don't return early - continue to create deposit record and emit socket
    if (checkAddressInDepositHistory && checkAddressInDepositHistory.status !== "pending" && !isReusableDeposit && !coinMismatch && !networkMismatch) {
       console.log(
        `Deposit Address already exists in deposit history. Status: ${checkAddressInDepositHistory.status}`
      );
      return reply.code(400).send({
        success: false,
        message: "Address already exists in deposit history",
      });
    }
    }

    // tx hashes are case-insensitive; normalize so the dup check can't be bypassed
    const normalizedTxId = typeof txId === "string" ? txId.trim().toLowerCase() : txId;
    
    if (address.toLowerCase() === from.toLowerCase()) {
      return reply.code(400).send({
        success: false,
        message: "Invalid From Address",
      });
    }


    const tokenInfo = Object.values(coin || {})[0] || {};

    let assetSymbol;
    const addressCheck = isWalletAddress?.address || isDepositAddress?.address;
    const privateKey = isWalletAddress?.privateKey || isDepositAddress?.encryptedPrivateKey;
    const currentUserId = isWalletAddress?.userId || isDepositAddress?.merchantId;
    const notificationTitle = isWalletAddress ? "Deposit Amount Received" : "Deposit From Merchant API Received";
    const depositType = isWalletAddress ? "deposit" : "payIn";
console.log(addressCheck, 'addressCheck');
console.log(privateKey ? '<present>' : '<missing>', 'privateKey');
console.log(currentUserId, 'currentUserId');
console.log(notificationTitle, 'notificationTitle');
console.log(depositType, 'depositType');


    if (tokenInfo.symbol) {
      assetSymbol = tokenInfo.symbol;
    } else {
      assetSymbol = network;
    }

    const symbol = tokenInfo.symbol || null;

    const existingDeposit = await DepositHistory.findOne({ txId: normalizedTxId }).lean();

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
    const depositAmountStr = formatDepositAmount(amount, networkDecimal);

    if (depositAmountStr === null) {
      return reply.code(400).send({
        success: false,
        message: "Invalid deposit amount",
      });
    }

    // $inc needs a Number; formatDepositAmount returns a string
    const depositAmount = Number(depositAmountStr);

    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
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


      if (!addressCheck) {
        return reply.code(404).send({
          success: false,
          message: "Address not found",
        });
      }

      if (!privateKey) {
        return reply.code(404).send({
          success: false,
          message: "Wallet private key not found",
        });
      }

       const transaction = await Transaction.findOne({ merchantId: currentUserId, address: exactAddressFilter(address) })
          .lean();
      //  console.log("🚀 ~ transferTokenReceiver ~ transaction:", transaction)

      let depositRecord;
      const pendingDeposit = !isWalletAddress
        ? await DepositHistory.findOne({
            address: exactAddressFilter(address),
            status: "pending",
          }).sort({ createdAt: -1 })
        : null;

      const buttonType =
        pendingDeposit?.buttonType || transaction?.buttonType || null;
      const normalizedButtonType = ["simple", "advanced"].includes(
        String(buttonType || "").toLowerCase()
      )
        ? String(buttonType).toLowerCase()
        : null;
      const saveButtonType = normalizedButtonType;

      const hasMismatch = coinMismatch || networkMismatch;
      const depositStatus = hasMismatch ? "failed" : "confirmed";

      if (pendingDeposit) {
        try {
          depositRecord = await DepositHistory.findOneAndUpdate(
            { _id: pendingDeposit._id, status: "pending" },
            {
              $set: {
                merchantId: pendingDeposit.merchantId || currentUserId,
                receivedAmount: depositAmount,
                txId: normalizedTxId,
                from,
                contractAddress,
                network,
                symbol: symbol || assetCheck.assetSymbol,
                decimal: networkDecimal,
                status: depositStatus,
                ...(hasMismatch && { mismatchReason }),
                ...(saveButtonType && { buttonType: saveButtonType }),
                updatedAt: new Date(),
              },
            },
            { new: true }
          );
        } catch (updateErr) {
          if (updateErr?.code === 11000) {
            const existing = await DepositHistory.findOne({ txId: normalizedTxId }).lean();
            return reply.code(200).send({
              success: true,
              alreadyProcessed: true,
              message: "Deposit already processed",
              data: existing,
            });
          }
          // throw updateErr;
        }
        if (!depositRecord) {
          // Lost the race: another webhook claimed it first.
          const existing = await DepositHistory.findOne({ txId: normalizedTxId }).lean();
          return reply.code(200).send({
            success: true,
            alreadyProcessed: true,
            message: "Deposit already processed",
            data: existing,
          });
        }
      } else {
        try {
          depositRecord = await DepositHistory.create({
            userId: currentUserId,
            address,
            amount: transaction?.amount ?? depositAmount ?? 0,
            receivedAmount: depositAmount,
            txId: normalizedTxId,
            from,
            contractAddress,
            network,
            symbol: symbol || assetCheck.assetSymbol,
            decimal: networkDecimal,
            status: depositStatus,
            type: depositType,
            ...(hasMismatch && { mismatchReason }),
            ...(saveButtonType && { buttonType: saveButtonType }),
          });
        } catch (createErr) {
          if (createErr?.code === 11000) {
            const existing = await DepositHistory.findOne({ txId: normalizedTxId }).lean();
            return reply.code(200).send({
              success: true,
              alreadyProcessed: true,
              message: "Deposit already processed",
              data: existing,
            });
          }
          // throw createErr;
        }
      }

      const wallet = await getOrCreateWallet(
        currentUserId,
        assetCheck._id
      );

      // Backfill wallet link so deposit details show Wallet Id.
      try {
        await DepositHistory.updateOne(
          { _id: depositRecord._id, walletId: null },
          { $set: { walletId: wallet._id } }
        );
        depositRecord.walletId = wallet._id;
      } catch (walletLinkErr) {
        console.error("Failed to link wallet to deposit:", walletLinkErr.message);
      }


      const isMismatch = coinMismatch || networkMismatch;
      if (!isMismatch) {
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
      }

      // Only create notification for successful deposits
      if (!hasMismatch) {
        try {
          await createNotification({
            user_id: currentUserId,
            admin_id: null,
            role: "user",
            title: notificationTitle,
            description: `Your deposit address ${depositAddress} has been created for ${depositAmount} ${depositAssetSymbol} on ${depositNetworkName}.`,
            type: depositType,
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
      }

      try {
        await Transaction.findOneAndUpdate(
          { merchantId: currentUserId, address: exactAddressFilter(address) },
          { $set: { status: depositStatus, receivedAmount: depositAmount, txnHash: normalizedTxId, ...(hasMismatch && { mismatchReason }), ...(saveButtonType && { buttonType: saveButtonType }) } }
        );
      } catch (txErr) {
        console.error("transferTokenReceiver: failed to update tx status:", txErr);
      }

      if (transaction?.txnId) {
        try {
          await emitPaymentConfirmed(transaction.txnId, {
            txnId: transaction.txnId,
            status: depositStatus,
            receivedAmount: depositAmount,
            txnHash: normalizedTxId,
            address,
            asset: assetCheck.assetSymbol,
            network,
            ...(hasMismatch && { mismatchReason }),
          });
        } catch (socketErr) {
          console.error("transferTokenReceiver: failed to emit payment_confirmed:", socketErr.message);
        }
      }

      try {
        if (transaction?.ipnUrl) {
          const ipnPayload = {
            merchant_id: transaction.merchantId,
            transaction_id: depositRecord._id,
            txn_id: transaction.txnId,
            amount: transaction.amount || 0,
            currency1: assetCheck.assetSymbol,
            currency2: assetCheck.assetSymbol,
            network,
            address,
            from,
            transactionHash: depositRecord.txId,
            type: depositType,
            buttonType: saveButtonType || undefined,
            status: depositStatus,
            received_amount: depositAmount,
            ...(hasMismatch && { mismatchReason }),
            timestamp: new Date().toISOString(),
          };
          try {
            await sendIpnNotification(transaction.ipnUrl, ipnPayload);
          } catch (ipnErr) {
            console.error("transferTokenReceiver: failed to send IPN:", ipnErr);
          }
        }
      } catch (ipnError) {
        console.error("IPN notification error:", ipnError.message);
      }
      console.log(contractAddress, 'contract');
      try {
        const sweepPayload = contractAddress
          ? {
              usrAddress: addressCheck,
              usrPrivateKey: decrypt(privateKey),
              amount: depositAmount,
              contractAddress: contractAddress,
            }
          : {
              usrAddress: addressCheck,
              usrPrivateKey: decrypt(privateKey),
              amount: depositAmount,
            };
        const sweepPromise = contractAddress
          ? moveErc20TokenToAdmin(sweepPayload)
          : moveEthToAdmin(sweepPayload);
        sweepPromise
          .then(async (sweepResult) => {
            const failed = sweepResult && (sweepResult.status === false || sweepResult.success === false);
            if (failed) {
              console.error("Admin wallet sweep returned failure:", sweepResult?.message);
              try {
                await DepositHistory.updateOne(
                  { _id: depositRecord._id },
                  { $set: { status: "pending" } }
                );
              } catch (updateErr) {
                console.error("Failed to mark deposit sweep-pending:", updateErr.message);
              }
            }
          })
          .catch(async (sweepError) => {
            console.error("Admin wallet sweep error:", {
              message: sweepError.message,
            });
            try {
              await DepositHistory.updateOne(
                { _id: depositRecord._id },
                { $set: { status: "pending" } }
              );
            } catch (updateErr) {
              console.error("Failed to mark deposit sweep-pending:", updateErr.message);
            }
          });
      } catch (sweepError) {
        console.error("Admin wallet sweep error:", {
          message: sweepError.message,
        });

        try {
          await DepositHistory.updateOne(
            { _id: depositRecord._id },
            { $set: { status: "pending" } }
          );
        } catch (updateErr) {
          console.error("Failed to mark deposit sweep-pending:", updateErr.message);
        }

        return reply.code(201).send({
          success: true,
          sweepPending: true,
          message: "Deposit credited, admin sweep pending - retry sweep by txId",
          data: {
            ...depositRecord.toObject(),
            amount: depositAmount,
          },
        });
}
      
      // Update deposit address payment status to confirmed
      if (isDepositAddress) {
        await DepositAddress.findOneAndUpdate(
          { address: exactAddressFilter(address) },
          { paymentStatus: "confirmed" }
        );
      }

      return reply.code(201).send({
        success: true,
        message: "Deposit processed successfully",
        data: {
          ...depositRecord.toObject(),
          amount: depositAmount,
          buttonType: saveButtonType || depositRecord.buttonType || null,
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
