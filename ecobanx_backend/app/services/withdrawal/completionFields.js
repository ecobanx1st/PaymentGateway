const { Network } = require("../../models/Network");

// Build the $set / field update applied when an admin-wallet sweep succeeds.
// Fills tx hash + on-chain receipt fields (block number, gas fee) and the
// explorer link so withdrawal details show them straight from the DB.
const buildCompletionFields = async ({ sweepBody = {}, sweepTxHash = null, networkId = null } = {}) => {
  const data =
    sweepBody?.data && typeof sweepBody.data === "object" ? sweepBody.data : {};

  const blockNumber =
    Number(data.blockNumber ?? sweepBody.blockNumber) || null;

  const gasUsed = data.gasUsed ?? sweepBody.gasUsed ?? null;
  const gasPriceWei =
    data.effectiveGasPrice ?? sweepBody.effectiveGasPrice ?? null;

  let gasFee = null;
  try {
    if (gasUsed != null && gasPriceWei != null) {
      const feeWei = BigInt(gasUsed.toString()) * BigInt(gasPriceWei.toString());
      gasFee = Number(feeWei) / 1e18;
    }
  } catch {
    gasFee = null;
  }

  let explorerUrl = null;
  try {
    if (networkId && sweepTxHash) {
      const netDoc = await Network.findById(networkId)
        .select("explorerUrl")
        .lean();
      const base = netDoc?.explorerUrl
        ? String(netDoc.explorerUrl).replace(/\/+$/, "")
        : "";
      if (base) explorerUrl = `${base}/tx/${sweepTxHash}`;
    }
  } catch {
    explorerUrl = null;
  }

  const set = { status: "COMPLETED" };
  if (sweepTxHash) {
    set.txHash = sweepTxHash;
    set.transactionHash = sweepTxHash;
  }
  if (blockNumber != null) set.blockNumber = blockNumber;
  if (gasFee != null) set.gasFee = gasFee.toFixed(8);
  if (explorerUrl) set.explorerUrl = explorerUrl;
  return set;
};

module.exports = { buildCompletionFields };
