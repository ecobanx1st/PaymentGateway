const { Wallets } = require("../../models/walletModel");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");

const getBalance = async (userId, assetSymbol) => {
  try {
  const asset = await Asset.findOne({ assetSymbol }).lean();

  if (!asset) {
    throw new Error("Asset not found");
  }
  const networkIds = Array.isArray(asset.networks)
    ? asset.networks.map((networkConfig) => networkConfig.networkId)
    : asset.networkIds || [];

  const networks = await Network.find({
    _id: { $in: networkIds },
  }).lean();

  const wallets = await Wallets.findOne({
    userId,
    assetId: asset._id,
  }).lean();
  // console.log("🚀 ~ getBalance ~ wallets:", wallets)

  // const walletMap = new Map(
  //   wallets.map((wallet) => [wallet.networkId.toString(), wallet])
  // );

  let totalFree = 0;
  let totalLocked = 0;
  let total = 0;

  // const networkBalances = networks.map((network) => {
  //   const wallet = walletMap.get(network._id.toString());

    const free = wallets?.free || 0;
    const locked = wallets?.locked || 0;
    const balance = wallets?.total || 0;

    totalFree += free;
    totalLocked += locked;
    total += balance;

    // return {
    //   networkId: network._id,
    //   networkName: network.networkName,
    //   networkSymbol: network.networkSymbol,
    //   free,
    //   locked,
    //   total: balance,
    // };
  // console.log({
  //     free: totalFree,
  //     locked: totalLocked,
  //     total,
  //   },'*********')

  return {
    assetId: asset._id,
    assetName: asset.assetName,
    assetSymbol: asset.assetSymbol,

    totalBalance: {
      free: totalFree,
      locked: totalLocked,
      total,
    },
  };
  } catch (err) {
    console.error("getBalance error:", err);
    throw err;
  }
};

const getNetworkBalance = async (userId, assetId) => {
  try {
  const wallet = await Wallets.findOne({ userId, assetId }).lean();
  if (!wallet) {
    return { free: 0, locked: 0, total: 0, exists: false };
  }
  return { free: wallet.free, locked: wallet.locked, total: wallet.total, exists: true, walletId: wallet._id };
  } catch (err) {
    console.error("getNetworkBalance error:", err);
    throw err;
  }
};

const hasSufficientBalance = async (userId, assetId, requiredAmount) => {
  try {
  const balance = await getNetworkBalance(userId, networkId, assetId);
  return balance.free >= requiredAmount;
  } catch (err) {
    console.error("hasSufficientBalance error:", err);
    throw err;
  }
};

module.exports = { getBalance, getNetworkBalance, hasSufficientBalance };