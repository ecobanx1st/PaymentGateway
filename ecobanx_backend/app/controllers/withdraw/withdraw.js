const mongoose = require("mongoose");
const { WalletAddress } = require("../../models/walletAddressModel");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { Withdrawal } = require("../../models/withdrawalModel");
const { getOrCreateWallet, lockBalance } = require("../../services/wallet/walletService");
const { createLedgerEntry } = require("../../services/wallet/ledgerService");
const { createNotification } = require("../../services/notification/notificationService");

const withdraw = async (req, reply) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (sessErr) {
    console.error("withdraw session start error:", sessErr);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }

  try {
    const { assetSymbol, networkSymbol, amount, toAddress, receiverAddress } = req.validatedData;
    const userId = req.user._id || req.user.id;
    const destAddress = receiverAddress || toAddress;

    if (!destAddress) {
      await session.abortTransaction();
      return reply.code(400).send({ success: false, message: "Destination address is required" });
    }

    const network = await Network.findOne({ networkSymbol }).session(session).lean();
    if (!network) {
      await session.abortTransaction();
      return reply.code(404).send({ success: false, message: "Network not found" });
    }

    const asset = await Asset.findOne({ assetSymbol, "networks.networkId": network._id }).session(session).lean();
    if (!asset) {
      await session.abortTransaction();
      return reply.code(404).send({ success: false, message: "Asset not found" });
    }

    if (!asset.withdrawStatus) {
      await session.abortTransaction();
      return reply.code(400).send({ success: false, message: "Withdrawals are disabled for this asset" });
    }

    const walletAddress = await WalletAddress.findOne({
      userId,
      networkId: network._id,
      assetId: asset._id,
    }).session(session).lean();

    if (!walletAddress) {
      await session.abortTransaction();
      return reply.code(404).send({ success: false, message: "No wallet address found. Create one first." });
    }

    const wallet = await getOrCreateWallet(userId, network._id, asset._id);

    const withdrawFee = asset.withdrawFee || 0;
    // const totalAmount = amount + withdrawFee;
    const totalAmount = amount;

    const withdrawal = await Withdrawal.create([{
      merchantId: userId,
      userId,
      walletAddressId: walletAddress._id,
      walletId: wallet._id,
      networkId: network._id,
      assetId: asset._id,
      amount,
      fee: withdrawFee,
      withdrawFee,
      netAmount: amount - withdrawFee,
      totalAmount,
      toAddress: destAddress,
      fromAddress: walletAddress.address,
      receiverAddress: destAddress,
      status: "PENDING",
    }], { session });

    await lockBalance(userId, asset._id, totalAmount, {
      merchantId: userId,
      withdrawalId: withdrawal._id,
      assetSymbol,
      session,
    });

    await createLedgerEntry({
      merchantId: userId,
      withdrawalId: withdrawal._id,
      assetSymbol,
      type: "WITHDRAWAL_REQUEST",
      amount,
      balanceBefore: wallet.free + totalAmount,
      balanceAfter: wallet.free,
      lockedBefore: wallet.locked - totalAmount,
      lockedAfter: wallet.locked,
      description: `Withdrawal request for ${amount} ${assetSymbol}`,
      session,
    });

    if (withdrawFee > 0) {
      await createLedgerEntry({
        merchantId: userId,
        withdrawalId: withdrawal._id,
        assetSymbol,
        type: "WITHDRAWAL_FEE",
        amount: withdrawFee,
        balanceBefore: wallet.free,
        balanceAfter: wallet.free,
        lockedBefore: wallet.locked - withdrawFee,
        lockedAfter: wallet.locked,
        description: `Withdrawal fee for ${amount} ${assetSymbol}`,
        session,
      });
    }

    await session.commitTransaction();

    await createNotification({
      user_id: userId,
      role: "user",
      title: "Withdrawal Submitted",
      description: `Withdrawal of ${amount} ${assetSymbol} has been submitted and is pending approval.`,
      type: "withdraw",
      status: "info",
    });

    return reply.code(200).send({
      success: true,
      message: "Withdrawal request submitted successfully.",
      data: {
        withdrawId: withdrawal._id,
        status: "PENDING",
        amount,
        fee: withdrawFee,
        totalAmount,
        assetSymbol,
        networkSymbol,
        toAddress: destAddress,
      },
    });
  } catch (error) {
    try { if (session) await session.abortTransaction(); } catch (abortErr) {
      console.error("withdraw abort error:", abortErr);
    }
    console.error("Withdrawal request error:", error);
    if (error.message?.startsWith("Insufficient balance")) {
      return reply.code(400).send({ success: false, message: error.message });
    }
    return reply.code(500).send({ success: false, message: "Internal server error" });
  } finally {
    try { if (session) session.endSession(); } catch (endErr) {
      console.error("withdraw endSession error:", endErr);
    }
  }
};

module.exports = withdraw;
