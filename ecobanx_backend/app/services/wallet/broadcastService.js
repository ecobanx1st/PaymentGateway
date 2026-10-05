const { ethers } = require("ethers");
const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} = require("@solana/web3.js");
const TronWeb = require("tronweb");
const { payments } = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");
const axios = require("axios");

const ECPair = ECPairFactory(tinysecp);

const broadcastEvm = async ({ rpcUrl, privateKey, toAddress, amount }) => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(String(amount)),
  });
  return tx.hash;
};

const broadcastSol = async ({ rpcUrl, privateKey, toAddress, amount }) => {
  const connection = new Connection(rpcUrl, "confirmed");
  const secretKey = Buffer.from(privateKey, "hex");
  const signer = Keypair.fromSecretKey(secretKey);

  const lamports = Math.round(amount * LAMPORTS_PER_SOL);
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: signer.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports,
    })
  );

  const signature = await connection.sendTransaction(tx, [signer]);
  return signature;
};

const broadcastTron = async ({ rpcUrl, privateKey, toAddress, amount }) => {
  const tronWeb = new TronWeb({
    fullNode: rpcUrl,
    solidityNode: rpcUrl,
    privateKey,
  });

  const sunAmount = tronWeb.toSun(amount);
  const tx = await tronWeb.trx.sendTransaction(toAddress, sunAmount);
  return tx.txid;
};

const broadcastTransaction = async ({ network, privateKey, fromAddress, toAddress, amount }) => {
  const rpcUrl = network.rpcUrl;

  switch (network.type) {
    case "EVM":
      return broadcastEvm({ rpcUrl, privateKey, toAddress, amount });

    case "SOL":
      return broadcastSol({ rpcUrl, privateKey, toAddress, amount });

    case "TRON":
      return broadcastTron({ rpcUrl, privateKey, toAddress, amount });

    default:
      throw new Error(`Unsupported network type: ${network.type}`);
  }
};

module.exports = { broadcastTransaction };
