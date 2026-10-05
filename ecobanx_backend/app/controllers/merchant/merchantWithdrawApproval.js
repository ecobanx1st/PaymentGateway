const mongoose = require("mongoose");
const { moveEthToUser, moveErc20TokenToUser } = require("../../services/evmBalanceUpdate/evmBalanceUpdate");
const { Withdrawal } = require("../../models/withdrawalModel");
const { Asset } = require("../../models/Asset");
const { deductLockedBalance, unlockBalance } = require("../../services/wallet/walletService");
const { createNotification } = require("../../services/notification/notificationService");
const { sendIpnNotification } = 
require("../../services/ipn/ipnService");
const { buildCompletionFields } =
require("../../services/withdrawal/completionFields");

// Merchant may process only MERCHANT-level withdrawals.
// Legacy withdrawals created before approvalLevel existed are
// allowed for backward compatibility (approvalLevel = null).
const MERCHANT_APPROVABLE_LEVELS = [null, "MERCHANT"];

const merchantWithdrawApproval = async (req, reply) => {
  const merchantId = req.user?.merchantId || req.user?._id || req.user?.id;
  const withdrawalId =
    req.params?.id ||
    req.params?.withdrawalId ||
    req.validatedData?.withdrawalId ||
    req.body?.withdrawalId;
  const action = req.validatedData?.action || req.body?.action;
  const reason = req.validatedData?.reason || req.body?.reason;

  if (!withdrawalId || !action) {
    return reply.code(400).send({ success: false, message: "withdrawalId and action are required." });
  }

  if (action === "reject" && (!reason || !String(reason).trim())) {
    return reply.code(400).send({ success: false, message: "Rejection reason is required." });
  }

  console.log("========== WITHDRAW APPROVAL ==========");
  console.log("withdrawalId:", withdrawalId);
  console.log("merchantId from token:", merchantId);
  console.log("action:", action);
  console.log("========================================");

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (sessErr) {
    console.error("merchantWithdrawApproval session start error:", sessErr);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }

  try {
    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, merchantId }).session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      return reply.code(404).send({ success: false, message: "Withdrawal not found" });
    }

    if (withdrawal.approvalLevel === "ADMIN") {
      await session.abortTransaction();
      return reply.code(403).send({ success: false, message: "Only admin can process this withdrawal request." });
    }

    if (!MERCHANT_APPROVABLE_LEVELS.includes(withdrawal.approvalLevel)) {
      await session.abortTransaction();
      return reply.code(403).send({ success: false, message: "Only admin can process this withdrawal request." });
    }

    if (withdrawal.status !== "PENDING") {
      await session.abortTransaction();
      return reply.code(400).send({ success: false, message: "Withdrawal has already been processed." });
    }

    const asset = await Asset.findById(withdrawal.assetId).select("assetSymbol").lean();

    if (action === "approve") {
      // Resolve network-specific sweep config (same as admin approveWithdrawal).
      const fullAsset = await Asset.findById(withdrawal.assetId).lean();
      if (!fullAsset) {
        await session.abortTransaction();
        return reply.code(404).send({ success: false, message: "Asset not found" });
      }
      const assetNetwork =
        fullAsset?.networks?.find((item) => String(item?.networkId) === String(withdrawal.networkId)) ||
        fullAsset?.networks?.[0] ||
        null;
      const contractAddress = assetNetwork?.contractAddress || null;
      const networkDecimals = Number.isInteger(assetNetwork?.decimal) ? assetNetwork.decimal : 18;
      const decimals = Math.min(Math.max(networkDecimals, 0), 18);

      // Prefer stored netAmount (exact at creation); guard against bad values.
      let sweepAmountStr = withdrawal.netAmount != null ? String(withdrawal.netAmount).trim() : "";
      if (!sweepAmountStr || sweepAmountStr === "undefined" || sweepAmountStr === "null" || sweepAmountStr === "" || sweepAmountStr === "NaN" || Number(sweepAmountStr) !== Number(sweepAmountStr)) {
        sweepAmountStr = String(withdrawal.amount).trim();
      }

      const receiverAddress = withdrawal.receiverAddress || withdrawal.toAddress;
      if (!receiverAddress) {
        await session.abortTransaction();
        return reply.code(400).send({ success: false, message: "Withdrawal receiver address missing" });
      }

      // Atomic PENDING -> PROCESSING transition; prevents duplicate approval.
      const processing = await Withdrawal.findOneAndUpdate(
        {
          _id: withdrawal._id,
          status: "PENDING",
          approvalLevel: { $in: MERCHANT_APPROVABLE_LEVELS },
        },
        {
          $set: {
            status: "PROCESSING",
            approvedBy: merchantId,
            approvedAt: new Date(),
          },
        },
        { session, new: true }
      );

      if (!processing) {
        await session.abortTransaction();
        return reply.code(400).send({ success: false, message: "Withdrawal has already been processed." });
      }

      await session.commitTransaction();

      const merchantIdForTx = withdrawal.merchantId;
      const assetIdForTx = withdrawal.assetId;
      const totalAmountForTx = withdrawal.totalAmount;
      const amountForTx = withdrawal.amount;
      const assetSymbolForTx = asset?.assetSymbol || "";
      const withdrawalIdForTx = withdrawal._id;

      // Instant reply — approval initiated (do NOT wait for sweep).
      reply.code(200).send({
        success: true,
        message: "Withdrawal approval initiated",
        data: {
          withdrawId: withdrawal._id,
          status: "PROCESSING",
        },
      });

      // Background: ADMIN TO USER sweep — only on success deduct locked & notify.
      // Fire-and-forget — do not block reply, do not send second reply.
      setImmediate(async () => {
        let sweepTxHash = null;
        let sweepBody = null;
        try {
          let body;
          if (!contractAddress) {
            body = await moveEthToUser({
              toAddress: receiverAddress,
              amount: sweepAmountStr,
            });
            console.log("withdrawTransferERC20:", body);
          } else {
            body = await moveErc20TokenToUser({
              toAddress: receiverAddress,
              amount: sweepAmountStr,
              contractAddress,
              decimals,
            });
            console.log("withdrawTransfer:", body);
          }

          sweepBody = body;
          const explicitFail = body && (body.status === false || body.success === false);
          if (explicitFail) {
            throw new Error(body?.message || body?.error || "Admin wallet sweep returned failure");
          }
          sweepTxHash = body?.txHash || body?.transactionHash || body?.hash || body?.data?.txHash || body?.data?.transactionHash || null;
          console.log("Merchant approve sweep completed, updating wallet:", { withdrawId: withdrawalIdForTx, sweepTxHash });
        } catch (sweepError) {
          console.error("Admin wallet sweep failed (merchant approve background):", {
            message: sweepError.message,
          });
          const upstreamMsg = sweepError.message || "Admin wallet sweep failed";
          // Sweep never moved funds: mark FAILED and release locked balance.
          let failSession;
          try {
            failSession = await mongoose.startSession();
            failSession.startTransaction();
          } catch (sessErr) {
            console.error("merchantWithdrawApproval background failSession start error:", sessErr);
            return;
          }
          try {
            try {
            await Withdrawal.findByIdAndUpdate(withdrawalIdForTx, { $set: { status: "FAILED", failureReason: upstreamMsg } }, { session: failSession });
            } catch (error) {
              console.error("merchantWithdrawApproval: failed to update withdrawal:", error);
            }
            try {
            await unlockBalance(merchantIdForTx, assetIdForTx, totalAmountForTx, {
              merchantId: merchantIdForTx,
              withdrawalId: withdrawalIdForTx,
              assetSymbol: assetSymbolForTx,
              session: failSession,
            });
          } catch (error) {
            console.error("merchantWithdrawApproval: failed to unlock balance:", error);
          }
            await failSession.commitTransaction();
          } catch (markErr) {
            await failSession.abortTransaction();
            console.error("Failed to mark FAILED after sweep error:", markErr);
          } finally {
            failSession.endSession();
          }
          try {
            await createNotification({
              user_id: withdrawal.userId || withdrawal.merchantId,
              role: "user",
              title: "Withdrawal Failed",
              description: `Your withdrawal of ${amountForTx} ${assetSymbolForTx} failed: ${upstreamMsg}`,
              type: "withdraw",
              status: "failed",
              referenceId: withdrawalIdForTx,
            });
          } catch (notifErr) {
            console.error("Merchant approve: failed to create notification:", notifErr);
          }
          try {
            const failedDoc = await Withdrawal.findById(withdrawalIdForTx).lean();
            if (failedDoc?.ipnUrl) {
              await sendIpnNotification(failedDoc.ipnUrl, {
                merchant_id: String(failedDoc.merchantId),
                withdrawal_id: String(failedDoc._id),
                withdraw_id: failedDoc.withdrawId || null,
                transaction_id: String(failedDoc._id),
                amount: failedDoc.amount,
                netAmount: failedDoc.netAmount,
                totalAmount: failedDoc.totalAmount,
                asset: assetSymbolForTx,
                toAddress: failedDoc.receiverAddress || failedDoc.toAddress,
                status: "FAILED",
                failureReason: upstreamMsg,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (ipnErr) {
            console.error("Merchant approve FAILED IPN failed (non-blocking):", ipnErr.message);
          }
          return;
        }

        // Sweep succeeded → deduct locked balance & mark COMPLETED in transaction.
        let doneSession;
        try {
          doneSession = await mongoose.startSession();
          doneSession.startTransaction();
        } catch (sessErr) {
          console.error("merchantWithdrawApproval background doneSession start error:", sessErr);
          return;
        }
        try {
          const inTx = await Withdrawal.findById(withdrawalIdForTx).session(doneSession);
          if (!inTx) {
            await doneSession.abortTransaction();
            console.error("Withdrawal not found after sweep:", withdrawalIdForTx);
            return;
          }
          if (inTx.status !== "PROCESSING") {
            await doneSession.abortTransaction();
            console.log(`Withdrawal ${withdrawalIdForTx} status is ${inTx.status}, skipping COMPLETED update`);
            return;
          }

          inTx.status = "COMPLETED";
          if (sweepTxHash) {
            inTx.txHash = sweepTxHash;
            inTx.transactionHash = sweepTxHash;
          }
          Object.assign(
            inTx,
            await buildCompletionFields({
              sweepBody,
              sweepTxHash,
              networkId: inTx.networkId,
            })
          );
          
          try {
            await inTx.save({ session: doneSession });
            } catch (error) {
              console.error("merchantWithdrawApproval: failed to save withdrawal:", error);
              throw error;
            }
          try {
          await deductLockedBalance(merchantIdForTx, assetIdForTx, totalAmountForTx, {
            merchantId: merchantIdForTx,
            withdrawalId: withdrawalIdForTx,
            assetSymbol: assetSymbolForTx,
            session: doneSession,
          });
        } catch (error) {
          console.error("merchantWithdrawApproval: failed to deduct locked balance:", error);
          throw error;
        }
        try {
          await doneSession.commitTransaction();
        } catch (error) {
          console.error("merchantWithdrawApproval: failed to commit transaction:", error);
        }

          try {
            await createNotification({
              user_id: withdrawal.userId || withdrawal.merchantId,
              role: "user",
              title: "Withdrawal Approved",
              description: `Your withdrawal of ${amountForTx} ${assetSymbolForTx} has been approved and completed.${sweepTxHash ? ` Tx: ${sweepTxHash}` : ""}`,
              type: "withdraw",
              status: "success",
              referenceId: withdrawalIdForTx,
            });
          } catch (notifErr) {
            console.error("Withdrawal approved notification failed (non-blocking):", notifErr.message);
          }
          try {
            const completedDoc = await Withdrawal.findById(withdrawalIdForTx).lean();
            if (completedDoc?.ipnUrl) {
              await sendIpnNotification(completedDoc.ipnUrl, {
                merchant_id: String(completedDoc.merchantId),
                withdrawal_id: String(completedDoc._id),
                withdraw_id: completedDoc.withdrawId || null,
                transaction_id: String(completedDoc._id),
                amount: completedDoc.amount,
                netAmount: completedDoc.netAmount,
                totalAmount: completedDoc.totalAmount,
                asset: assetSymbolForTx,
                toAddress: completedDoc.receiverAddress || completedDoc.toAddress,
                status: "COMPLETED",
                txHash: sweepTxHash,
                transactionHash: sweepTxHash,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (ipnErr) {
            console.error("Withdrawal approved IPN failed (non-blocking):", ipnErr.message);
          }
        } catch (txErr) {
          await doneSession.abortTransaction();
          console.error("Merchant approve wallet update after sweep failed:", txErr);
          try {
            await Withdrawal.findByIdAndUpdate(withdrawalIdForTx, { $set: { status: "FAILED", failureReason: txErr.message } });
          } catch (markErr) {
            console.error("Merchant approve: failed to mark FAILED after sweep error:", markErr);
          }
          try {
            const txFailDoc = await Withdrawal.findById(withdrawalIdForTx).lean();
            if (txFailDoc?.ipnUrl) {
              await sendIpnNotification(txFailDoc.ipnUrl, {
                merchant_id: String(txFailDoc.merchantId),
                withdrawal_id: String(txFailDoc._id),
                withdraw_id: txFailDoc.withdrawId || null,
                transaction_id: String(txFailDoc._id),
                amount: txFailDoc.amount,
                netAmount: txFailDoc.netAmount,
                totalAmount: txFailDoc.totalAmount,
                asset: assetSymbolForTx,
                toAddress: txFailDoc.receiverAddress || txFailDoc.toAddress,
                status: "FAILED",
                failureReason: txErr.message,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (ipnErr) {
            console.error("Merchant approve tx FAILED IPN failed (non-blocking):", ipnErr.message);
          }
        } finally {
          doneSession.endSession();
        }
      });

      return reply; // Already sent above: return reply so Fastify does not send again
    }

    if (action !== "reject") {
      await session.abortTransaction();
      return reply.code(400).send({ success: false, message: "Invalid action. Use approve or reject." });
    }

    // Atomic PENDING -> REJECTED transition.
    const updated = await Withdrawal.findOneAndUpdate(
      {
        _id: withdrawal._id,
        status: "PENDING",
        approvalLevel: { $in: MERCHANT_APPROVABLE_LEVELS },
      },
      {
        $set: {
          status: "REJECTED",
          rejectionReason: reason,
          rejectedBy: merchantId,
          rejectedAt: new Date(),
        },
      },
      { session, new: true }
    );

    if (!updated) {
      await session.abortTransaction();
      return reply.code(400).send({ success: false, message: "Withdrawal has already been processed." });
    }
    try {
    await unlockBalance(withdrawal.merchantId, withdrawal.assetId, withdrawal.totalAmount, {
      merchantId: withdrawal.merchantId,
      withdrawalId: withdrawal._id,
      assetSymbol: asset?.assetSymbol || "",
      session,
    });
    } catch (error) {
      console.error("merchantWithdrawApproval: failed to unlock balance:", error);
      throw error;
    }

    try {
    await session.commitTransaction();
    } catch (error) {
      console.error("merchantWithdrawApproval: failed to commit transaction:", error);
    }
    try {
    await createNotification({
      user_id: withdrawal.userId || withdrawal.merchantId,
      role: "user",
      title: "Withdrawal Rejected",
      description: `Your withdrawal of ${withdrawal.amount} ${asset?.assetSymbol || ""} was rejected. Reason: ${reason}`,
      type: "withdraw",
      status: "failed",
      referenceId: withdrawal._id,
    });
    } catch (notifErr) {
      console.error("merchantWithdrawApproval: failed to create notification:", notifErr);
    }
    try {
      if (updated?.ipnUrl) {
        sendIpnNotification(updated.ipnUrl, {
          merchant_id: String(updated.merchantId),
          withdrawal_id: String(updated._id),
          withdraw_id: updated.withdrawId || null,
          transaction_id: String(updated._id),
          amount: updated.amount,
          netAmount: updated.netAmount,
          totalAmount: updated.totalAmount,
          asset: asset?.assetSymbol || "",
          toAddress: updated.receiverAddress || updated.toAddress,
          status: "REJECTED",
          rejectionReason: reason,
          timestamp: new Date().toISOString(),
        }).catch((ipnErr) => console.error("Withdrawal rejected IPN failed (non-blocking):", ipnErr.message));
      }
    } catch (ipnErr) {
      console.error("Withdrawal rejected IPN failed (non-blocking):", ipnErr.message);
    }

    return reply.code(200).send({
      success: true,
      message: "Withdrawal rejected successfully.",
      data: {
        withdrawId: withdrawal._id,
        status: "REJECTED",
        rejectionReason: reason,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Merchant withdrawal approval error:", error);
    if (error.message?.startsWith("Insufficient locked balance")) {
      return reply.code(400).send({ success: false, message: error.message });
    }
    if (
      error.code === 112 ||
      error.codeName === "WriteConflict" ||
      error.errorLabels?.includes?.("TransientTransactionError")
    ) {
      const current = await Withdrawal.findOne({ _id: withdrawalId, merchantId }).lean();
      if (!current) {
        return reply.code(404).send({ success: false, message: "Withdrawal not found" });
      }
      if (current.status !== "PENDING") {
        return reply.code(400).send({ success: false, message: "Withdrawal has already been processed." });
      }
    }
    return reply.code(500).send({ success: false, message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

module.exports = { merchantWithdrawApproval };
