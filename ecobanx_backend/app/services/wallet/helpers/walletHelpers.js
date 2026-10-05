const { Wallet } = require("ethers");
const { Keypair } = require("@solana/web3.js");
const tronWebModule = require("tronweb");
const TronWeb = tronWebModule.TronWeb || tronWebModule;
const { payments } = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");

const ECPair = ECPairFactory(tinysecp);

const createEvmWallet = () => {
  const evmWallet = Wallet.createRandom();

  return {
    address: evmWallet.address,
    privateKey: evmWallet.privateKey,
    publicKey: null,
    mnemonic: evmWallet.mnemonic?.phrase || null,
  };
};

const createSolanaWallet = () => {
  const solWallet = Keypair.generate();

  return {
    address: solWallet.publicKey.toBase58(),
    privateKey: Buffer.from(solWallet.secretKey).toString("hex"),
    publicKey: solWallet.publicKey.toBase58(),
    mnemonic: null,
  };
};

const createTronWallet = async () => {
  const tronWallet = await TronWeb.createAccount();

  return {
    address: tronWallet.address.base58,
    privateKey: tronWallet.privateKey,
    publicKey: tronWallet.publicKey || null,
    mnemonic: null,
  };
};

module.exports = { createEvmWallet, createSolanaWallet, createTronWallet };
