const { Network } = require("../../models/Network");
const { Asset } = require("../../models/Asset");
const { DepositAddress } = require("../../models/depositAddressModel");
const { validateAddress } = require("../../utils/validateAddress");
const { generateDepositAddress } = require("./merchantWalletService");

const UNSUPPORTED_PAIR = "UNSUPPORTED_PAIR";
const ADDRESS_FAILED = "ADDRESS_FAILED";

const unsupportedPairError = (message) => {
  const err = new Error(message);
  err.code = UNSUPPORTED_PAIR;
  return err;
};

/**
 * API network -> DB network symbol
 *
 * ERC20   -> ETH
 * BEP20   -> BNB
 * TRC20   -> TRX
 * MATIC20 -> MATIC
 */
const API_NETWORK_TO_DB_NETWORK = {
  ERC20: "ETH",
  BEP20: "BNB",
  TRC20: "TRX",
  MATIC20: "MATIC",
};

/**
 * Convert API network to database network symbol.
 */
const resolveNetworkSymbol = (networkSymbol) => {
  const value = String(networkSymbol || "")
    .trim()
    .toUpperCase();

  return API_NETWORK_TO_DB_NETWORK[value] || value;
};

/**
 * Validate Asset + Network for DEPOSIT.
 *
 * Rules:
 *
 * 1. Network must exist
 * 2. Network must be active
 * 3. Network depositEnabled must be true
 * 4. Asset must exist
 * 5. Asset must be active
 * 6. Asset must contain this network
 * 7. Asset depositStatus must be true
 *
 * IMPORTANT:
 *
 * Asset status controls ALL networks.
 *
 * Network status controls that PARTICULAR network.
 */
const validateAssetNetwork = async (
  coinSymbol,
  networkSymbol
) => {
  const normalizedCoin = String(coinSymbol || "")
    .trim()
    .toUpperCase();

  const requestedNetwork = String(networkSymbol || "")
    .trim()
    .toUpperCase();

  const dbNetworkSymbol =
    resolveNetworkSymbol(requestedNetwork);

  console.log("========== validateAssetNetwork ==========");

  console.log({
    coinSymbol: normalizedCoin,
    requestedNetwork,
    dbNetworkSymbol,
  });

  /**
   * ---------------------------------------------------------
   * 1. Find active network
   * ---------------------------------------------------------
   */
  const networkDoc = await Network.findOne({
    networkSymbol: dbNetworkSymbol,
    status: true,
  }).lean();

  if (!networkDoc) {
    console.log("NETWORK NOT FOUND");

    throw unsupportedPairError(
      `Network ${dbNetworkSymbol} is not supported`
    );
  }

  console.log("NETWORK FOUND:", {
    id: networkDoc._id,
    networkName: networkDoc.networkName,
    networkSymbol: networkDoc.networkSymbol,
    status: networkDoc.status,
    depositEnabled: networkDoc.depositEnabled,
    withdrawEnabled: networkDoc.withdrawEnabled,
  });

  /**
   * ---------------------------------------------------------
   * 2. Check network deposit status
   * ---------------------------------------------------------
   *
   * This controls only this network.
   *
   * Example:
   *
   * TRX depositEnabled = false
   *
   * Then:
   * USDT + TRX ❌
   *
   * But:
   * USDT + ETH ✅
   * USDT + BNB ✅
   */
  if (networkDoc.depositEnabled !== true) {
    console.log("NETWORK DEPOSIT DISABLED");

    throw unsupportedPairError(
      `Deposits are disabled on ${dbNetworkSymbol} network`
    );
  }

  /**
   * ---------------------------------------------------------
   * 3. Find active asset containing this network
   * ---------------------------------------------------------
   */
  const asset = await Asset.findOne({
    assetSymbol: normalizedCoin,
    status: true,
    "networks.networkId": networkDoc._id,
  }).lean();

  if (!asset) {
    console.log("ASSET + NETWORK PAIR NOT FOUND");

    throw unsupportedPairError(
      `Asset ${normalizedCoin} is not supported on network ${dbNetworkSymbol}`
    );
  }

  console.log("ASSET FOUND:", {
    assetId: asset._id,
    assetName: asset.assetName,
    assetSymbol: asset.assetSymbol,
    status: asset.status,
    depositStatus: asset.depositStatus,
    withdrawStatus: asset.withdrawStatus,
  });

  /**
   * ---------------------------------------------------------
   * 4. Find exact network configuration inside Asset
   * ---------------------------------------------------------
   */
  const networkEntry = (asset.networks || []).find(
    (item) =>
      String(item.networkId) ===
      String(networkDoc._id)
  );

  if (!networkEntry) {
    console.log("ASSET NETWORK ENTRY NOT FOUND");

    throw unsupportedPairError(
      `Asset ${normalizedCoin} is not supported on network ${dbNetworkSymbol}`
    );
  }

  console.log("ASSET NETWORK ENTRY FOUND:", {
    networkId: networkEntry.networkId,
    contractAddress: networkEntry.contractAddress,
    decimal: networkEntry.decimal,
  });

  /**
   * ---------------------------------------------------------
   * 5. Check ASSET deposit status
   * ---------------------------------------------------------
   *
   * This is global for the asset.
   *
   * If:
   *
   * USDT.depositStatus = false
   *
   * Then:
   *
   * USDT + TRX ❌
   * USDT + ETH ❌
   * USDT + BNB ❌
   */
  if (asset.depositStatus !== true) {
    console.log("ASSET DEPOSIT DISABLED");

    throw unsupportedPairError(
      `Deposits are disabled for ${normalizedCoin}`
    );
  }

  /**
   * ---------------------------------------------------------
   * 6. Everything is enabled
   * ---------------------------------------------------------
   */
  console.log(
    "ASSET + NETWORK DEPOSIT VALIDATION SUCCESS"
  );

  return {
    asset,
    networkDoc,
    networkEntry,
  };
};

/**
 * Generate payment address.
 */
const getPaymentAddress = async ({
  merchantId,
  coin,
  networkSymbol,
  networkDoc,
}) => {
  let generated = null;

  const MAX_ATTEMPTS = 3;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      generated =
        await generateDepositAddress(
          merchantId,
          coin,
          networkSymbol,
          networkDoc
        );

      break;
    } catch (err) {
      if (
        err &&
        err.code === 11000 &&
        attempt < MAX_ATTEMPTS
      ) {
        continue;
      }

      throw err;
    }
  }

  if (!generated || !generated.address) {
    const err = new Error(
      "Deposit address generation returned no address"
    );

    err.code = ADDRESS_FAILED;

    throw err;
  }

  /**
   * Validate generated address.
   */
  const isValid = validateAddress(
    generated.address,
    networkDoc.type || networkSymbol
  );

  if (!isValid) {
    const err = new Error(
      `Generated deposit address is invalid for network ${networkSymbol}`
    );

    err.code = ADDRESS_FAILED;

    throw err;
  }

  return {
    address: generated.address,
    isNew: true,
    depositAddressId: generated.id,
  };
};

/**
 * Delete generated deposit address.
 */
const deleteGeneratedDepositAddress = async (
  depositAddressId
) => {
  if (!depositAddressId) {
    return;
  }

  try {
    await DepositAddress.deleteOne({
      _id: depositAddressId,
    });
  } catch (err) {
    console.error(
      "Failed to clean up deposit address:",
      err.message
    );
  }
};

module.exports = {
  validateAssetNetwork,
  getPaymentAddress,
  deleteGeneratedDepositAddress,
  UNSUPPORTED_PAIR,
  ADDRESS_FAILED,
  resolveNetworkSymbol,
};