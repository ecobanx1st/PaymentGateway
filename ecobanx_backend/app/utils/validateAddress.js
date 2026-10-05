const { Web3 } = require("web3");
const tronWebModule = require("tronweb");
const TronWeb = tronWebModule.TronWeb || tronWebModule;
const { PublicKey } = require("@solana/web3.js");

const web3 = new Web3();

function validateAddress(address, network) {
  try {
    switch (network.toUpperCase()) {
      case "EVM":
      case "ETH":
      case "ETHEREUM":
      case "ERC20":
      case "BSC":
      case "BNB":
      case "BEP20":
      case "POLYGON":
      case "POL":
      case "MATIC":
      case "ARBITRUM":
      case "OPTIMISM":
      case "OP":
      case "BASE":
      case "AVALANCHE":
      case "AVAX":
        return web3.utils.isAddress(address);

      case "TRON":
      case "TRX":
        return TronWeb.isAddress(address);

      case "SOL":
      case "SOLANA":
        new PublicKey(address);
        return true;

      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  } catch {
    return false;
  }
}

module.exports = { validateAddress };
