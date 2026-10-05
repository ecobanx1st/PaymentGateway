const { Wallets } = require("../../models/walletModel");
const { createLedgerEntry } = require("./ledgerService");
const { getNetworkBalance } = require("./balanceService");

const createWallet = async (userId, assetId) => {
  const existing = await Wallets.findOne({ userId, assetId });
  if (existing) return existing;
  return Wallets.create({ userId, assetId, free: 0, locked: 0, total: 0 });
};

const getOrCreateWallet = async (userId, assetId, opts = {}) => {
  const { session } = opts;

  const findQuery = Wallets.findOneAndUpdate(
    { userId, assetId },
    { $setOnInsert: { userId, assetId, free: 0, locked: 0, total: 0 } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  const wallet = session ? await findQuery.session(session) : await findQuery;
  return wallet;
};

const lockBalance = async (userId, assetId, amount, opts = {}) => {
  const { merchantId, withdrawalId, assetSymbol, session } = opts;

  const findQuery = Wallets.findOneAndUpdate(
    { userId, assetId, free: { $gte: amount } },
    { $inc: { free: -amount, locked: amount } },
    { returnDocument: 'before' }
  );
  const wallet = session ? await findQuery.session(session) : await findQuery;

  if (!wallet) {
    const balance = await getNetworkBalance(userId, assetId);
    if (!balance.exists) throw new Error("Wallet not found");
    throw new Error(`Insufficient balance. Available: ${balance.free}, required: ${amount}`);
  }

  if (merchantId && assetSymbol) {
    await createLedgerEntry({
      merchantId, withdrawalId, assetSymbol,
      type: "BALANCE_LOCK", amount,
      balanceBefore: wallet.free, balanceAfter: wallet.free - amount,
      lockedBefore: wallet.locked, lockedAfter: wallet.locked + amount,
      description: `Balance locked for withdrawal ${withdrawalId || ""}`,
      session,
    });
  }
};

const unlockBalance = async (userId, assetId, amount, opts = {}) => {
  const { merchantId, withdrawalId, assetSymbol, session } = opts;

  const findQuery = Wallets.findOneAndUpdate(
    { userId, assetId, locked: { $gte: amount } },
    { $inc: { free: amount, locked: -amount } },
    { returnDocument: 'before' }
  );
  const wallet = session ? await findQuery.session(session) : await findQuery;

  if (!wallet) {
    const balance = await getNetworkBalance(userId, assetId);
    if (!balance.exists) return;
    throw new Error(`Insufficient locked balance. Locked: ${balance.locked}, required: ${amount}`);
  }

  if (merchantId && assetSymbol) {
    await createLedgerEntry({
      merchantId, withdrawalId, assetSymbol,
      type: "BALANCE_UNLOCK", amount,
      balanceBefore: wallet.free, balanceAfter: wallet.free + amount,
      lockedBefore: wallet.locked, lockedAfter: wallet.locked - amount,
      description: `Balance unlocked from withdrawal ${withdrawalId || ""}`,
      session,
    });
  }
};

const deductLockedBalance = async (userId, assetId, amount, opts = {}) => {
  const { merchantId, withdrawalId, assetSymbol, session } = opts;

  const findQuery = Wallets.findOneAndUpdate(
    { userId, assetId, locked: { $gte: amount } },
    { $inc: { locked: -amount, total: -amount } },
    { returnDocument: 'before' }
  );
  const wallet = session ? await findQuery.session(session) : await findQuery;

  if (!wallet) {
    const balance = await getNetworkBalance(userId, assetId);
    if (!balance.exists) throw new Error("Wallet not found");
    throw new Error(`Insufficient locked balance. Locked: ${balance.locked}, required: ${amount}`);
  }

  if (merchantId && assetSymbol) {
    await createLedgerEntry({
      merchantId, withdrawalId, assetSymbol,
      type: "WITHDRAWAL_SUCCESS", amount,
      balanceBefore: wallet.free, balanceAfter: wallet.free,
      lockedBefore: wallet.locked, lockedAfter: wallet.locked - amount,
      description: `Locked balance deducted for completed withdrawal ${withdrawalId || ""}`,
      session,
    });
  }
};

module.exports = { createWallet, getOrCreateWallet, lockBalance, unlockBalance, deductLockedBalance };
