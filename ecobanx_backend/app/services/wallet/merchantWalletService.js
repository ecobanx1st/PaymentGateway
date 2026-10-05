const { mnemonicToSeedSync } = require("bip39");
const { HDKey } = require("@scure/bip32");
const { privateKeyToAccount } = require("viem/accounts");
const tronWebModule = require("tronweb");
const TronWeb = tronWebModule.TronWeb || tronWebModule;
const WalletCoreService = require("../../middleware/WalletCoreService");
const { MerchantWallet } = require("../../models/merchantWalletModel");
const { DepositAddress } = require("../../models/depositAddressModel");
const { encrypt } = require("../encryption/encryptData");
const { validateAddress } = require("../../utils/validateAddress");

const getMasterMnemonic = () => {
  const mnemonic = process.env.MASTER_MNEMONIC;
  if (!mnemonic) throw new Error("MASTER_MNEMONIC environment variable is required");
  return mnemonic;
};

const NORMALIZED_NETWORK_TYPES = {
  TRON: "TRON",
  TRX: "TRON",
  EVM: "EVM",
  ETH: "EVM",
  ETHEREUM: "EVM",
  ERC20: "EVM",
  SOL: "SOL",
  SOLANA: "SOL",
};

const normalizeNetworkType = (type) =>
  NORMALIZED_NETWORK_TYPES[String(type || "").trim().toUpperCase()] ||
  String(type || "").trim().toUpperCase() ||
  null;

const getNetworkType = (networkDoc, networkSymbol) => {
  if (networkDoc && typeof networkDoc.type === "string" && networkDoc.type.trim()) {
    return normalizeNetworkType(networkDoc.type);
  }
  return normalizeNetworkType(networkSymbol) || "EVM";
};

const getNextWalletIndex = async () => {
  const last = await MerchantWallet.findOne()
    .sort({ walletIndex: -1 })
    .select("walletIndex")
    .lean();
  return last ? last.walletIndex + 1 : 1;
};

const deriveChild = (walletIndex, addressIndex = 0) => {
  const mnemonic = getMasterMnemonic();
  const seed = mnemonicToSeedSync(mnemonic);
  const master = HDKey.fromMasterSeed(seed);
  return master.derive(`m/44'/60'/${walletIndex}'/0/${addressIndex}`);
};

const deriveEvm = (walletIndex, addressIndex = 0) => {
  const child = deriveChild(walletIndex, addressIndex);
  const privateKeyHex = Buffer.from(child.privateKey).toString("hex");
  const account = privateKeyToAccount("0x" + privateKeyHex);
  return {
    address: account.address,
    privateKeyHex,
    derivationPath: `m/44'/60'/${walletIndex}'/0/${addressIndex}`,
  };
};

const deriveTron = async (walletIndex, addressIndex = 0) => {
  const mnemonic = getMasterMnemonic();

  // Preferred: deterministic derivation from the master mnemonic via
  // TrustWallet Core, so every address stays recoverable.
  let wasm = null;
  try {
    wasm = WalletCoreService.wasm || (await WalletCoreService.init());
  } catch (error) {
    console.warn(
      "TrustWallet Core wasm init failed, falling back to TronWeb.createAccount for TRON:",
      error.message
    );
    wasm = null;
  }
  if (wasm) {
    try {
      const { HDWallet, AnyAddress, CoinType } = wasm;

      const derivationPath = `m/44'/195'/${walletIndex}'/0/${addressIndex}`;
      const wallet = HDWallet.createWithMnemonic(mnemonic, "");
      const privateKey = wallet.getKey(CoinType.tron, derivationPath);
      const publicKey = privateKey.getPublicKeySecp256k1(false);
      const address = AnyAddress.createWithPublicKey(publicKey, CoinType.tron).description();
      const privateKeyHex = Buffer.from(privateKey.data()).toString("hex");

      return { address, privateKeyHex, derivationPath };
    } catch (error) {
      console.warn(
        "TRON derivation via TrustWallet Core failed, falling back to TronWeb.createAccount:",
        error.message
      );
    }
  } else {
    console.warn("TrustWallet Core wasm unavailable, falling back to TronWeb.createAccount for TRON");
  }

  // Fallback: a fresh random TRON account. The private key is stored
  // encrypted with the DepositAddress, so the address stays usable.
  const tronWallet = await TronWeb.createAccount();

  return {
    address: tronWallet.address.base58,
    privateKeyHex: tronWallet.privateKey,
    derivationPath: "random (TronWeb.createAccount)",
  };
};

const deriveForNetworkType = async (type, walletIndex, addressIndex = 0) => {
  const networkType = normalizeNetworkType(type);
  if (networkType === "TRON") return deriveTron(walletIndex, addressIndex);
  if (networkType === "EVM") return deriveEvm(walletIndex, addressIndex);
  throw new Error(`Unsupported network type for address generation: ${type || "UNKNOWN"}`);
};

const getPrivateKeyHex = (walletIndex, addressIndex = 0) => {
  const child = deriveChild(walletIndex, addressIndex);
  return Buffer.from(child.privateKey).toString("hex");
};

const assignMerchantWallet = async (
  merchantId = null,
  coin = "ETH",
  network = "ERC20",
  networkType = "EVM"
) => {
  const index = await getNextWalletIndex();

  const derived = await deriveForNetworkType(networkType, index, 0);

  const walletData = {
    walletIndex: index,
    walletAddress: derived.address,
    coin: coin.toUpperCase(),
    network: network.toUpperCase(),
    encryptedPrivateKey: encrypt(derived.privateKeyHex),
    derivationPath: derived.derivationPath,
    status: "ACTIVE",
  };

  // merchantId is optional
  if (merchantId) {
    walletData.merchantId = merchantId;
  }

  await MerchantWallet.create(walletData);

  return {
    walletIndex: index,
    walletAddress: derived.address,
    coin: coin.toUpperCase(),
    network: network.toUpperCase(),
  };
};

const getMerchantWallet = async (merchantId, coin = "ETH", network = "ERC20", networkType = "EVM") => {
  const record = await MerchantWallet.findOne({
    merchantId,
    coin: coin.toUpperCase(),
    network: network.toUpperCase(),
  }).lean();

  if (!record) {
    return assignMerchantWallet(merchantId, coin, network, networkType);
  }

  // Backfill wallets created before network-aware generation:
  // a TRON-labelled merchant wallet holding an EVM address is stale data.
  const type = getNetworkType(null, record.network);
  if (type === "TRON" && !validateAddress(record.walletAddress, "TRON")) {
    const derived = await deriveForNetworkType("TRON", record.walletIndex, 0);
    await MerchantWallet.updateOne(
      { _id: record._id },
      {
        $set: {
          walletAddress: derived.address,
          derivationPath: derived.derivationPath,
          encryptedPrivateKey: encrypt(derived.privateKeyHex),
        },
      }
    );
    return {
      walletIndex: record.walletIndex,
      walletAddress: derived.address,
      coin: record.coin,
      network: record.network,
      status: record.status,
    };
  }

  return {
    walletIndex: record.walletIndex,
    walletAddress: record.walletAddress,
    coin: record.coin,
    network: record.network,
    status: record.status,
  };
};

const getMerchantWallets = async (merchantId) => {
  const records = await MerchantWallet.find({ merchantId, status: "ACTIVE" })
    .select("walletAddress coin network status")
    .sort({ createdAt: 1 })
    .lean();

  return records.map((r) => ({
    address: r.walletAddress,
    coin: r.coin,
    network: r.network,
    status: r.status,
  }));
};

const generateDepositAddress = async (merchantId, coin = "ETH", network = "ERC20", networkDoc = null) => {
  const networkSymbol = String(network).toUpperCase();
  const networkType = getNetworkType(networkDoc, networkSymbol);

  const personal = await getMerchantWallet(merchantId, coin, networkSymbol, networkType);

  const last = await DepositAddress.findOne({ merchantId })
    .sort({ addressIndex: -1 })
    .select("addressIndex")
    .lean();

  const addressIndex = last ? last.addressIndex + 1 : 1;

  const derived = await deriveForNetworkType(networkType, personal.walletIndex, addressIndex);

  // Fail safely instead of storing an address that does not match the selected network.
  if (!validateAddress(derived.address, networkType)) {
    throw new Error(`Generated deposit address is invalid for network ${networkSymbol}`);
  }

  const record = await DepositAddress.create({
    merchantId,
    coin: coin.toUpperCase(),
    network: networkSymbol,
    networkId: networkDoc?._id || null,
    address: derived.address,
    encryptedPrivateKey: encrypt(derived.privateKeyHex),
    walletIndex: personal.walletIndex,
    addressIndex,
  });

  return { id: record._id, address: derived.address, addressIndex, network: networkSymbol };
};

module.exports = { assignMerchantWallet, getMerchantWallet, getMerchantWallets, generateDepositAddress };