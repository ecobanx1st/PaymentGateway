const web3Module = require("web3");
const Web3 = web3Module.Web3 || web3Module;
const tronWebModule = require("tronweb");
const TronWeb = tronWebModule.TronWeb || tronWebModule;
const { PublicKey, Connection } = require("@solana/web3.js");

// ============================================================
// NETWORK GROUPS
// ============================================================

const EVM_NETWORKS = new Set([
  "EVM",

  "ETH",
  "ETHEREUM",
  "ERC20",

  "BSC",
  "BNB",
  "BEP20",

  "POLYGON",
  "POL",
  "MATIC",

  "ARBITRUM",
  "ARBITRUM_ONE",

  "OPTIMISM",
  "OP",

  "BASE",

  "AVALANCHE",
  "AVAX",

  "FANTOM",
  "CRONOS",
  "CELO",
  "GNOSIS",
  "LINEA",
  "SCROLL",
  "ZKSYNC",
  "MANTLE",
]);

const TRON_NETWORKS = new Set([
  "TRON",
  "TRX",
  "TRC20",
]);

const SOLANA_NETWORKS = new Set([
  "SOL",
  "SOLANA",
]);

// ============================================================
// WEB3 PROVIDER CACHE
// ============================================================

const web3Cache = new Map();

function getWeb3(network, rpcUrl) {
  const normalizedNetwork = network.toUpperCase();

  const resolvedRpcUrl = rpcUrl;

  if (!resolvedRpcUrl) {
    throw new Error(
      `RPC URL not configured for ${normalizedNetwork}`
    );
  }

  const cacheKey = `${normalizedNetwork}:${resolvedRpcUrl}`;

  if (!web3Cache.has(cacheKey)) {
    web3Cache.set(
      cacheKey,
      new Web3(resolvedRpcUrl)
    );
  }

  return web3Cache.get(cacheKey);
}

async function checkEvmAddress(address, network, rpcUrl) {
  try {
    const web3 = getWeb3(network, rpcUrl);

    // Validate address
    if (!web3.utils.isAddress(address)) {
      return {
        valid: false,
        isContract: false,
        message: "Invalid EVM address",
      };
    }

    const checksumAddress = web3.utils.toChecksumAddress(address);

    // Get deployed bytecode
    const code = await web3.eth.getCode(checksumAddress);

    const isContract =
      code &&
      code !== "0x" &&
      code !== "0x0";

    return {
      valid: isContract === true ? true : false,
      // isContract,
      // address: checksumAddress,
      // type: isContract ? "CONTRACT" : "EOA",
      // message: isContract
      //   ? "Contract address"
      //   : "Wallet address",
    };
  } catch (error) {
    console.log("🚀 ~ checkEvmAddress ~ error:", error)
    return {
      valid: false,
      // isContract: null,
      // type: null,
      // message: error.message || "Unable to check contract address",
    };
  }
}

// ============================================================
// TRON ADDRESS + CONTRACT CHECK
// ============================================================

async function checkTronAddress(address, rpcUrl) {
  if (!TronWeb.isAddress(address)) {
    return {
      valid: false,
      isContract: false,
      type: null,
      message: "Invalid TRON address",
    };
  }

  const tronWeb = new TronWeb({
    fullHost:
      rpcUrl ||
      "https://api.trongrid.io",
  });

  try {
    const contract =
      await tronWeb.trx.getContract(address);

    const isContract =
      !!contract &&
      !!contract.contract_address;

    return {
      valid: true,
      isContract,
      type: isContract
        ? "CONTRACT"
        : "EOA",
      message: isContract
        ? "Valid TRON contract address"
        : "Valid TRON wallet address",
    };
  } catch {
    return {
      valid: true,
      isContract: false,
      type: "EOA",
      message: "Valid TRON address",
    };
  }
}

// ============================================================
// SOLANA ADDRESS + PROGRAM CHECK
// ============================================================

async function checkSolanaAddress(address, rpcUrl) {
  try {
    const publicKey = new PublicKey(address);

    const connection = new Connection(
      rpcUrl ||
        process.env.SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com"
    );

    const accountInfo =
      await connection.getAccountInfo(publicKey);

    const isProgram =
      !!accountInfo &&
      accountInfo.executable === true;

    return {
      valid: true,
      isContract: isProgram,
      type: isProgram
        ? "PROGRAM"
        : "ACCOUNT",
      message: isProgram
        ? "Valid Solana program address"
        : "Valid Solana account address",
    };
  } catch {
    return {
      valid: false,
      isContract: false,
      type: null,
      message: "Invalid Solana address",
    };
  }
}

// ============================================================
// MAIN VALIDATOR
// ============================================================

async function validateAddress(address, network, rpcUrl) {
  try {
    if (!address || !network) {
      return {
        valid: false,
        isContract: false,
        type: null,
        message: "Address and network are required",
      };
    }

    const normalizedNetwork =
      network.toUpperCase();

    // -------------------------
    // EVM
    // -------------------------

    if (EVM_NETWORKS.has(normalizedNetwork)) {
      return await checkEvmAddress(
        address,
        normalizedNetwork,
        rpcUrl
      );
    }

    // -------------------------
    // TRON
    // -------------------------

    if (TRON_NETWORKS.has(normalizedNetwork)) {
      return await checkTronAddress(address, rpcUrl);
    }

    // -------------------------
    // SOLANA
    // -------------------------

    if (SOLANA_NETWORKS.has(normalizedNetwork)) {
      return await checkSolanaAddress(address, rpcUrl);
    }

    return {
      valid: false,
      isContract: false,
      type: null,
      message: `Unsupported network: ${network}`,
    };
  } catch (error) {
    return {
      valid: false,
      isContract: false,
      type: null,
      message: error.message,
    };
  }
}

module.exports = {
  validateAddress,
  checkEvmAddress,
  checkTronAddress,
  checkSolanaAddress,
};