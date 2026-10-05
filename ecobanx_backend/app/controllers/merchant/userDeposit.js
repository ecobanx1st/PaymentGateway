const mongoose = require("mongoose");
const { DepositAddress } = require("../../models/depositAddressModel");
const { DepositHistory } = require("../../models/depositHistoryModel");
const { Wallets } = require("../../models/walletModel");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { Users } = require("../../models/usersModel");
const { Buyer } = require("../../models/buyerSchema");
const { getOrCreateWallet } = require("../../services/wallet/walletService");
const { createNotification } = require("../../services/notification/notificationService");

const MAX_RETRIES = 3;

const TRANSACTION_UNSUPPORTED_CODE = 20;

const roundToPrecision = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const executeInTransaction = async (ctx, session) => {
  const normalizedTx = String(ctx.txHash || "").trim().toLowerCase();
  const existingDeposit = await DepositHistory.findOne({ txId: normalizedTx })
    .session(session)
    .lean();

  if (existingDeposit) {
    return { duplicate: true };
  }

  const wallet = await getOrCreateWallet(ctx.userId, ctx.assetId, { session });

  const updatedWallet = await Wallets.findOneAndUpdate(
    { _id: wallet._id },
    { $inc: { free: ctx.amount, total: ctx.amount } },
    { returnDocument: "after" }
  ).session(session);

  if (!updatedWallet) {
    throw new Error("Balance update failed");
  }

  let depositRecord;
  try {
    [depositRecord] = await DepositHistory.create(
      [ctx.buildHistory(wallet._id)],
      { session }
    );
  } catch (createErr) {
    if (createErr?.code === 11000) {
      try { await session.abortTransaction(); } catch {}
      return { duplicate: true };
    }
    throw createErr;
  }

  await session.commitTransaction();

  return { wallet: updatedWallet, depositRecord };
};

const executeWithoutTransaction = async (ctx) => {
  const normalizedTx = String(ctx.txHash || "").trim().toLowerCase();
  const existingDeposit = await DepositHistory.findOne({ txId: normalizedTx }).lean();

  if (existingDeposit) {
    return { duplicate: true };
  }

  const wallet = await getOrCreateWallet(ctx.userId, ctx.assetId);

  let depositRecord;
  try {
    [depositRecord] = await DepositHistory.create([ctx.buildHistory(wallet._id)]);
  } catch (createErr) {
    if (createErr?.code === 11000) {
      return { duplicate: true };
    }
    throw createErr;
  }

  const updatedWallet = await Wallets.findOneAndUpdate(
    { _id: wallet._id },
    { $inc: { free: ctx.amount, total: ctx.amount } },
    { returnDocument: "after" }
  );

  if (!updatedWallet) {
    throw new Error("Balance update failed");
  }

  return { wallet: updatedWallet, depositRecord };
};

const userDeposit = async (req, reply) => {
  try {
    const {
      buyerEmail,
      coin,
      network,
      amount,
      address,
      txHash,
      from,
      contractAddress,
    } = req.validatedData;

    const merchantId = req.user?._id || req.user?.id;

    if (!merchantId) {
      return reply.code(400).send({
        success: false,
        message: "Merchant ID is required",
      });
    }

    const merchant = await Users.findById(merchantId).select("_id fullName email").lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "Merchant not found",
      });
    }

    // -----------------------------------------------------------
    // END USER
    // -----------------------------------------------------------

    const endUser = await Users.findOne({ email: buyerEmail })
      .select("_id fullName email")
      .lean();

    if (!endUser) {
      return reply.code(404).send({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------------------------------------
    // MERCHANT ISOLATION — buyer must belong to this merchant
    // -----------------------------------------------------------

    const buyer = await Buyer.findOne({ merchantId, email: buyerEmail })
      .select("_id")
      .lean();

    if (!buyer) {
      return reply.code(404).send({
        success: false,
        message: "User does not belong to this merchant",
      });
    }

    // -----------------------------------------------------------
    // ASSET VALIDATION
    // -----------------------------------------------------------

    const asset = await Asset.findOne({ assetSymbol: coin, status: true }).lean();

    if (!asset) {
      return reply.code(404).send({
        success: false,
        message: "Asset not found or inactive",
      });
    }

    if (!asset.depositStatus) {
      return reply.code(400).send({
        success: false,
        message: `Deposits are disabled for asset ${coin}`,
      });
    }

    // -----------------------------------------------------------
    // NETWORK VALIDATION
    // -----------------------------------------------------------

    const networkDoc = await Network.findOne({
      networkSymbol: network,
      status: true,
    }).lean();

    if (!networkDoc) {
      return reply.code(404).send({
        success: false,
        message: "Network not found or inactive",
      });
    }

    if (!networkDoc.depositEnabled) {
      return reply.code(400).send({
        success: false,
        message: `Deposits are disabled on the ${network} network`,
      });
    }

    const networkEntry = asset.networks?.find(
      (item) => String(item.networkId) === String(networkDoc._id)
    );

    if (!networkEntry) {
      return reply.code(404).send({
        success: false,
        message: `${coin} is not supported on the ${network} network`,
      });
    }

    // -----------------------------------------------------------
    // AMOUNT VALIDATION (respect asset decimal precision)
    // -----------------------------------------------------------

    const decimal = Number(networkEntry.decimal ?? 18);
    const depositAmount = roundToPrecision(amount, decimal);

    if (!(depositAmount > 0)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid deposit amount",
      });
    }

    // -----------------------------------------------------------
    // DEPOSIT ADDRESS — must already belong to this merchant
    // (addresses are generated during checkout / get_deposit_address)
    // -----------------------------------------------------------

    const depositAddress = await DepositAddress.findOne({
      merchantId,
      coin,
      network,
      address,
    })
      .select("address")
      .lean();

    if (!depositAddress) {
      return reply.code(404).send({
        success: false,
        message: "Deposit address not found for this merchant",
      });
    }

    // -----------------------------------------------------------
    // ATOMIC: duplicate check + wallet + balance + deposit history
    // -----------------------------------------------------------

    const ctx = {
      userId: endUser._id,
      assetId: asset._id,
      txHash,
      amount: depositAmount,
      from,
      contractAddress: contractAddress || null,
      network,
      coin,
      decimal,
      merchantId,
      buildHistory: (walletId) => ({
        merchantId,
        userId: endUser._id,
        walletId,
        address,
        amount: depositAmount,
        txId: String(txHash || "").trim().toLowerCase(),
        from,
        contractAddress: contractAddress || null,
        network,
        symbol: coin,
        decimal,
        status: "confirmed",
        type: "deposit",
      }),
    };

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      let session = null;
      let usedTransaction = false;

      try {
        session = await mongoose.startSession();
        session.startTransaction();
        usedTransaction = true;
      } catch (startError) {
        if (startError.code !== TRANSACTION_UNSUPPORTED_CODE) {
          throw startError;
        }
        session = null;
      }

      try {
        let result;

        if (usedTransaction) {
          try {
            result = await executeInTransaction(ctx, session);
          } catch (txError) {
            // Standalone MongoDB: transactions are not supported, the
            // failure surfaces here (code 20) at the first sessioned
            // operation, which is a read — nothing has been written yet.
            if (
              txError.code === TRANSACTION_UNSUPPORTED_CODE ||
              txError.codeName === "IllegalOperation"
            ) {
              if (session) {
                try {
                  await session.abortTransaction();
                } catch {
                  // session already unusable
                }
              }
              result = await executeWithoutTransaction(ctx);
            } else {
              throw txError;
            }
          }
        } else {
          result = await executeWithoutTransaction(ctx);
        }

        if (result.duplicate) {
          return reply.code(409).send({
            success: false,
            message: "A deposit with the same txHash already exists",
          });
        }

        try {
          await createNotification({
            user_id: merchantId,
            admin_id: null,
            role: "user",
            title: "Deposit Received",
            description: `A deposit of ${depositAmount} ${coin} from ${buyerEmail} was received on the ${network} network.`,
            type: "deposit",
            category: "TRANSACTION",
            status: "success",
            isRead: false,
            seen: false,
            createdBy: null,
          });
        } catch (notificationError) {
          console.error("User deposit notification creation error:", notificationError);
        }

        return reply.code(201).send({
          success: true,
          message: "User deposit processed successfully",
          data: {
            walletId: result.wallet._id,
            depositAddress: address,
            asset: coin,
            network,
            amount: depositAmount,
            balance: result.wallet.total,
            transactionId: result.depositRecord._id,
            txHash,
          },
        });
      } catch (error) {
        if (session) {
          try {
            await session.abortTransaction();
          } catch {
            // session already ended
          }
        }

        const isTransient =
          error.code === 112 ||
          error.errorLabels?.includes("TransientTransactionError");

        if (isTransient && attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
          continue;
        }

        throw error;
      } finally {
        if (session) {
          session.endSession();
        }
      }
    }
  } catch (error) {
    console.error("userDeposit error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  userDeposit,
};