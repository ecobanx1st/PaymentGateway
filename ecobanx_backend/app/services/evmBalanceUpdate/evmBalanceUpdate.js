// ============================================================
// eth-cron.js
// Imported by your backend as a module.
// The backend owns HTTP + listening. This file owns:
//   - blockchain operations (deposit sweep, withdraw, send)
//   - tx scanning (txDetail / txHashList / decode)
//   - crons (block scanner, failed webhook retry)
//   - shared state (depositAddress, contractAddress, admin)
// ============================================================

// import package (CommonJS — backend uses require, no ESM directory imports)
const Web3Module = require("web3");
const Web3 = Web3Module.Web3 || Web3Module.default || Web3Module;
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// import config
const config = require("./config");
const network = require("./config/network.json");
const { getBothAddressData } = require("./addressService");
const { getContractAddressData } = require("./contractAddressService");
const contract = require("./config/contract.json");
const address = require("./config/address.json");
const { walletServSign } = require("./config/JWT");
const erc20MinAbi = require("./config/erc20MinAbi.json");
// NOTE: transferToReceiver is required lazily inside
// invokeTransferTokenReceiver (it requires this module back for the
// sweep fns, so a top-level require would capture an empty export).

// Config dir anchored to this module (cwd-independent: same files as standalone service)
const CONFIG_DIR = path.join(__dirname, "config");

// import lib
const isEmpty = require("./lib/isEmpty");
const { decrypt } = require("./lib/cryptoJS");

const { hset, hgetall, hdel, redisConnection } = require("./redis");

// ethereumjs-tx is optional/legacy: only sendEth uses it, everything else
// signs via web3.eth.accounts. Guard so a missing package never breaks boot.
let Tx = null;
try {
  Tx = require("ethereumjs-tx").Transaction;
} catch (err) {
  console.log("eth-cron: ethereumjs-tx not installed, sendEth uses web3 signing fallback");
}
const { Transaction } = require("@ethereumjs/tx");
const web3 = config.WEB3_PROVIDER ? new Web3(config.WEB3_PROVIDER) : new Web3();

// Public-RPC gasPrice lags the market → broadcasts priced at exactly the
// fetched value sit pending for minutes (or revert with "max fee per gas
// less than block base fee"). Bump every signing price by 50% so sweeps
// confirm fast. Single place to tune. Accepts BigInt/number/string.
const GAS_PRICE_BUMP_MULT = 3n;
const GAS_PRICE_BUMP_DIV = 2n;
const bumpGasPrice = (gasPrice) =>
  (BigInt(gasPrice.toString()) * GAS_PRICE_BUMP_MULT) / GAS_PRICE_BUMP_DIV;

// web3 v4: toWei(decimalStr) returns a DECIMAL STRING, and toHex(str)
// UTF-8-encodes it (ASCII garbage, e.g. "0x3639..." for "6978...").
// Route through BigInt for a proper hex value.
const toWeiHex = (amountEth) =>
  web3.utils.toHex(BigInt(web3.utils.toWei(amountEth.toString(), "ether")));

// ============================================================
// SHARED STATE
// ============================================================
let depositAddress = [];
console.log("depo".depositAddress);

let contractAddress = {};
let adminAddress = config.ADMIN.ADDRESS;
let adminPrivateKey = config.ADMIN.PRIVATEKEY;
let checkContract = false;
let checkUsrDeposit = false;
let runCron = true;
let failWebhookCron = true;
let isBlockCronRunning = false;
const sweepQueues = new Map();

// ============================================================
// STATE GETTERS (so backend can read them safely)
// ============================================================
function getDepositAddress() {
  console.log("depositAddress", depositAddress);
  return depositAddress;
}
function getContractAddress() {
  return contractAddress;
}
function getAdminAddress() {
  return adminAddress;
}

// ============================================================
// Function: enqueueSweep
// ============================================================
function enqueueSweep(key, task) {
  const k = String(key || "").toLowerCase();
  const prev = sweepQueues.get(k) || Promise.resolve();
  const next = prev.then(task);
  const tracked = next.catch(() => {});
  sweepQueues.set(k, tracked);
  const cleanup = () => {
    if (sweepQueues.get(k) === tracked) sweepQueues.delete(k);
  };
  next.then(cleanup, cleanup);
  return next;
}

// ============================================================
// Function: convert
// ============================================================
function convert(n) {
  try {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n
      .toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0
      ? sign +
          "0." +
          "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
          lead +
          decimal
      : sign +
          lead +
          (+pow >= decimal.length
            ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
            : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
  } catch (err) {
    return 0;
  }
}

// ============================================================
// Function: moveEthToAdmin  (ETH deposit sweep)
// input:  reqBody = { usrAddress, usrPrivateKey, amount }
// output: { status, txHash?, message? }
// ============================================================
const moveEthToAdmin = async (reqBody) => {
  try {
    // Never log private keys: same fields minus the secret.
    console.log("------reqBody currency", { ...reqBody, usrPrivateKey: reqBody?.usrPrivateKey ? "<redacted>" : undefined });

    // reqBody.usrPrivateKey = decrypt(decrypt(reqBody.usrPrivateKey)?.split("+")[0])
    reqBody.usrPrivateKey = reqBody.usrPrivateKey;
    if (reqBody.usrPrivateKey.substring(0, 2) == "0x") {
      reqBody.usrPrivateKey = reqBody.usrPrivateKey.substring(2);
    }
    let transferValue = reqBody.amount;
    console.log("------transferValue", transferValue);
    let getBal = await web3.eth.getBalance(reqBody.usrAddress);
    let curBal = web3.utils.fromWei(getBal, "ether");

    if (curBal < transferValue) {
      transferValue = curBal;
    }
    console.log("------transferValue--2", transferValue);
    // +50% headroom so the sweep confirms fast (was +10%, still stalled).
    let getGasPrice = bumpGasPrice(await web3.eth.getGasPrice());

    let txCount = await web3.eth.getTransactionCount(
      reqBody.usrAddress,
      "pending"
    );
    console.log(txCount, "txCounttxCount");
    let gasLimit = await web3.eth.estimateGas({
      from: reqBody.usrAddress,
      nonce: txCount,
      to: adminAddress,
    });
    gasLimit = web3.utils.toHex(gasLimit);

    let fee = web3.utils.toHex(getGasPrice) * gasLimit;
    fee = web3.utils.fromWei(fee.toString(), "ether");
    console.log("transferValue: ", transferValue);
    console.log("fee: ", fee);
    if (transferValue >= fee) {
      transferValue = (transferValue - fee - 0.00000000000000001).toFixed(18);
      transferValue = toWeiHex(transferValue);
      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gas: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: adminAddress,
        from: reqBody.usrAddress.toString(),
        value: transferValue,
      };
      console.log("------txObject", txObject);
      const signedTransaction = await web3.eth.accounts.signTransaction(
        txObject,
        reqBody.usrPrivateKey
      );
      console.log(signedTransaction, "sendTransaction");
      // let bufferPrivateKey = Buffer.from(reqBody.usrPrivateKey, "hex");
      // const tx = new Tx(txObject, { chain: config.WEB3_CHAIN });
      // tx.sign(bufferPrivateKey);
      // const serializedTx = tx.serialize();
      // const raw1 = "0x" + serializedTx.toString("hex");
      // let transactionData = await web3.eth.sendSignedTransaction(raw1);
      let transactionData = await web3.eth.sendSignedTransaction(
        signedTransaction?.rawTransaction
      );
      console.log(transactionData, "transactionData");
      if (transactionData) {
        console.log("----transactionData", transactionData);
        return { txHash: transactionData?.transactionHash, status: true };
      }
      return { status: false };
    }

    return { status: false, message: "Insufficient balance for fee" };
  } catch (err) {
    console.log(err, "ETH DEPOSIT ERROR");
    return { status: false, message: "Error On Server" };
  }
};

// ============================================================
// Function: moveErc20TokenToAdmin  (ERC20 deposit sweep)
// input:  reqBody = { usrAddress, usrPrivateKey, amount,
//                     contractAddress, walletAddress? }
// output: { status, data?, message? }
// ============================================================
const moveErc20TokenToAdmin = async (reqBody) => {
  try {
    // Never log private keys: same fields minus the secret.
    console.log("reqBody: ", { ...reqBody, usrPrivateKey: reqBody?.usrPrivateKey ? "<redacted>" : undefined });

    // reqBody.usrPrivateKey = decrypt(decrypt(reqBody.usrPrivateKey)?.split("+")[0])
    reqBody.usrPrivateKey = reqBody.usrPrivateKey;
    if (reqBody.usrPrivateKey.substring(0, 2) == "0x") {
      reqBody.usrPrivateKey = reqBody.usrPrivateKey.substring(2);
    }

    let transferValue = reqBody.amount;

    const destAddress =
      reqBody?.walletAddress ||
      reqBody?.toAddress ||
      reqBody?.toaddress ||
      adminAddress;

    if (!destAddress || !web3.utils.isAddress(destAddress)) {
      return {
        status: false,
        message:
          "Missing/invalid destination address (walletAddress) and adminAddress not configured",
      };
    }

    console.log("-----transferValue", transferValue);

    let contract = new web3.eth.Contract(erc20MinAbi, reqBody.contractAddress);
    let conDecimal = await contract.methods.decimals().call();
    let conBal = await contract.methods.balanceOf(reqBody.usrAddress).call();
    let curBal = parseInt(conBal) / 10 ** parseInt(conDecimal);

    console.log("-----curBal-----", curBal);

    if (curBal < transferValue) {
      transferValue = curBal;
    }

    console.log("-----transferValue-----2", transferValue);

    if (parseFloat(transferValue) > 0) {
      let getBal = await web3.eth.getBalance(reqBody.usrAddress);
      let bal = web3.utils.fromWei(getBal, "ether");
      let getGasPrice = bumpGasPrice(await web3.eth.getGasPrice());
      let txCount = await web3.eth.getTransactionCount(
        reqBody?.usrAddress,
        "pending"
      );

      let gaslimit = await web3.utils.toHex(100000);
      let fee = web3.utils.toHex(getGasPrice) * gaslimit;
      fee = web3.utils.fromWei(fee.toString(), "ether");
      console.log("-----fee", parseFloat(fee), parseFloat(bal));

      if (parseFloat(fee) > parseFloat(bal)) {
        let { status, message, data } = await gasFeeSendToUsr({
          usrAddress: reqBody?.usrAddress,
          fee: fee,
        });
        console.log(status, "----statusstatus");
        if (status) {
          let sentTokenData = await sendToken({
            toAddress: destAddress,
            fromAddress: reqBody?.usrAddress,
            contractAddress: reqBody?.contractAddress,
            privateKey: reqBody?.usrPrivateKey,
            txCount,
            gaslimit,
            getGasPrice,
            amount: transferValue,
            muldecimal: 10 ** parseInt(conDecimal),
            contract,
          });

          if (sentTokenData && sentTokenData?.status) {
            return { status: true, data: sentTokenData?.data };
          } else {
            return { status: false, message: sentTokenData?.message };
          }
        }
      } else {
        console.log("--------------send token hit", destAddress);
        let sentTokenData = await sendToken({
          toAddress: destAddress,
          fromAddress: reqBody?.usrAddress,
          contractAddress: reqBody?.contractAddress,
          privateKey: reqBody?.usrPrivateKey,
          txCount,
          gaslimit,
          getGasPrice,
          amount: transferValue,
          muldecimal: 10 ** parseInt(conDecimal),
          contract,
        });
        console.log("----sentTokenData.status", sentTokenData?.status);
        if (sentTokenData && sentTokenData?.status) {
          return { status: true, data: sentTokenData?.data };
        } else {
          return { status: false, message: sentTokenData?.message };
        }
      }
    } else {
      return { status: false, message: "There is No Token Deposit" };
    }
  } catch (err) {
    console.log(err, "---------ERC 20 DEPOSIT ERROR");
    return { status: false, message: "Error On Server" };
  }
};

// ============================================================
// Function: moveEthToUser  (ETH withdraw admin -> user)
// input:  reqBody = { toAddress, amount }
// output: { status, data?, message?, balance? }
// ============================================================
const moveEthToUser = async (reqBody) => {
  try {
    console.log(reqBody, "reqBody withdraw");
    console.log("Provider:", config.WEB3_PROVIDER);
    console.log("Chain ID:", await web3.eth.getChainId());
    const { toAddress, amount } = reqBody;

    let privateKey = process.env.ADMINPRIVATEKEY;
    const fromAddress = process.env.ADMINADDRESS;

    if (!privateKey) {
      return {
        status: false,
        message: "Admin private key not configured",
      };
    }

    if (privateKey.startsWith("0x")) {
      privateKey = privateKey.slice(2);
    }

    // Get balance
    const balanceWei = await web3.eth.getBalance(fromAddress);

    // Get gas price (+50% headroom so it confirms fast)
    const gasPrice = bumpGasPrice(await web3.eth.getGasPrice());

    // Gas limit for native ETH transfer
    const gasLimit = 21000;

    // Convert amount to Wei
    const amountWei = web3.utils.toWei(amount.toString(), "ether");

    // Calculate gas fee
    const gasFeeWei = BigInt(gasPrice.toString()) * BigInt(gasLimit);

    // Check balance
    const totalRequiredWei = BigInt(amountWei.toString()) + gasFeeWei;

    if (BigInt(balanceWei.toString()) < totalRequiredWei) {
      return {
        status: false,
        message: "Insufficient ETH balance",
        balance: web3.utils.fromWei(balanceWei.toString(), "ether"),
      };
    }

    // Create account
    const account = web3.eth.accounts.privateKeyToAccount("0x" + privateKey);

    // Base fee can rise between the gas-price fetch and inclusion
    // ("max fee per gas less than block base fee"). Retry once with a
    // fresh price + headroom and a fresh nonce (the rejected tx never
    // mines, so the nonce is not consumed).
    let lastErr = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const liveGasPrice =
          attempt === 0
            ? gasPrice
            : bumpGasPrice(await web3.eth.getGasPrice());
        if (attempt > 0) {
          console.log("moveEthToUser: retrying with bumped gas price:", liveGasPrice.toString());
        }

        // Get nonce (fresh every attempt)
        const nonce = await web3.eth.getTransactionCount(fromAddress, "pending");

        // Sign transaction
        const signedTx = await account.signTransaction({
          from: fromAddress,
          to: toAddress,
          value: amountWei.toString(),
          gas: gasLimit,
          gasPrice: liveGasPrice.toString(),
          nonce,
          chainId: 11155111, // Sepolia
        });

        console.log("Sending transaction...");

        // Send transaction
        const transactionData = await web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        console.log("Transaction successful:", transactionData);

        return {
          status: true,
          data: transactionData,
          message: "ETH withdrawal successful",
        };
      } catch (attemptErr) {
        lastErr = attemptErr;
        const msg = attemptErr?.message || "";
        const underpriced = /max fee per gas|base fee|underpriced|fee too low/i.test(msg);
        if (!underpriced || attempt >= 1) throw attemptErr;
        console.log("moveEthToUser: underpriced, will retry:", msg);
      }
    }
    throw lastErr;
  } catch (err) {
    console.error("ETH WITHDRAW ERROR:", err);

    return {
      status: false,
      message: err.message || "Error On Server",
    };
  }
};

// ============================================================
// Function: moveErc20TokenToUser  (ERC20 withdraw admin -> user)
// input:  reqBody = { toAddress, contractAddress, decimals, amount }
// output: { status, data?, message? }
// ============================================================
const moveErc20TokenToUser = async (reqBody) => {
  try {
    console.log(
      reqBody,
      "erc20-token-move-to-user----------reqBodyreqBodyreqBody--------------"
    );
    let privateKey = process.env.ADMINPRIVATEKEY;
    const fromAddress = process.env.ADMINADDRESS;
    // let privateKey = reqBody.privateKey;
    // let fromAddress = reqBody.fromAddress;
    let toAddress = reqBody.toAddress;
    let contractAddress = reqBody.contractAddress;
    let decimals = reqBody.decimals;
    let amount = reqBody.amount;
    console.log("--------------fromAddress", fromAddress);
    let getBal = await web3.eth.getBalance(fromAddress);
    console.log("getBal: ", getBal);
    let bal = web3.utils.fromWei(getBal, "ether");
    console.log("bal: ", bal);
    let getGasPrice = bumpGasPrice(await web3.eth.getGasPrice());
    console.log("-----bal", parseFloat(bal));
    let gaslimit = await web3.utils.toHex(100000);
    let fee = web3.utils.toHex(getGasPrice) * gaslimit;
    fee = web3.utils.fromWei(fee.toString(), "ether");
    console.log("-----fee", parseFloat(fee), parseFloat(bal));

    // if (parseFloat(fee) > parseFloat(bal)) {
    //   let { status, message, data } = await gasFeeSendToUsr({
    //     usrAddress: walletAddress,
    //     fee: fee,
    //   });
    //   if(status)
    // }

    if (privateKey.substring(0, 2) == "0x") {
      privateKey = privateKey.substring(2);
    } else {
      privateKey = privateKey;
    }
    let muldecimal = 10 ** parseFloat(decimals);

    let contract = new web3.eth.Contract(erc20MinAbi, contractAddress);
    let tokenBalance = await contract.methods.balanceOf(fromAddress).call();
    console.log("tokenBalance: ", tokenBalance);
    // web3 v4 returns BigInt from .call(); Number() first — BigInt / Number
    // throws, and this keeps the original float-division semantics.
    tokenBalance = Number(tokenBalance) / muldecimal;
    console.log(tokenBalance, "---tokenBalance");
    console.log(decimals, "---decimals");
    console.log(contractAddress, "---contractAddress");
    console.log(
      parseFloat(tokenBalance) >= parseFloat(amount),
      "parseFloat(tokenBalance) >= parseFloat(amount)"
    );
    if (parseFloat(tokenBalance) >= parseFloat(amount)) {
      let getBalance = await web3.eth.getBalance(fromAddress);
      let balance = web3.utils.fromWei(getBalance, "ether");
      let getGasPrice = bumpGasPrice(await web3.eth.getGasPrice());
      let txCount = await web3.eth.getTransactionCount(fromAddress, "pending");

      let gaslimit = await web3.utils.toHex(100000);
      let fee = web3.utils.toHex(getGasPrice) * gaslimit;
      fee = web3.utils.fromWei(fee.toString(), "ether");
      console.log("---------------balance", balance);
      console.log("---------------fee", fee);
      console.log(
        parseFloat(balance) > parseFloat(fee),
        "parseFloat(balance) > parseFloat(fee)"
      );
      if (parseFloat(balance) > parseFloat(fee)) {
        let sentTokenData = await sendToken({
          toAddress,
          fromAddress,
          contractAddress,
          privateKey,
          txCount,
          gaslimit,
          getGasPrice,
          amount,
          muldecimal,
          contract,
        });

        if (sentTokenData && sentTokenData.status) {
          return { status: true, data: sentTokenData.data };
        } else {
          return { status: false, message: sentTokenData.message };
        }
      } else {
        let { status, message, data } = await gasFeeSendToUsr({
          usrAddress: fromAddress,
          fee: fee,
        });
        if (status) {
          let sentTokenData = await sendToken({
            toAddress,
            fromAddress,
            contractAddress,
            privateKey,
            txCount,
            gaslimit,
            getGasPrice,
            amount,
            muldecimal,
            contract,
          });

          if (sentTokenData && sentTokenData.status) {
            return { status: true, data: sentTokenData.data };
          } else {
            return { status: false, message: sentTokenData.message };
          }
        } else {
          return { status: false, message: "Insuffient gas fee" };
        }
      }
    } else {
      return { status: false, message: "Insuffient Token Balance" };
    }
  } catch (err) {
    console.log(err, "---------ERC 20 Withdraw ERROR");
    return { status: false, message: "Error On Server" };
  }
};

// ============================================================
// Function: newContractInfo  (add a contract dynamically)
// input:  reqBody = { contractAddress }
// output: { status, message?, result? }
// ============================================================
async function newContractInfo(reqBody) {
  try {
    if (isEmpty(reqBody.contractAddress)) {
      return { status: false, message: "ADDRESS_REQ" };
    }
    // if (isEmpty(reqBody.coin)) {
    //   return { status: false, message: "COIN_REQ" };
    // }

    let contract = new web3.eth.Contract(erc20MinAbi, reqBody.contractAddress);
    // web3 v4 returns BigInt from .call(); normalize to Number — a BigInt
    // here would crash JSON.stringify (contract.json write, API replies).
    let decimal = Number(await contract.methods.decimals().call());
    let symbol = await contract.methods.symbol().call();
    contractAddress[reqBody.contractAddress.toLowerCase()] = { decimal, symbol };
    fs.writeFileSync(path.join(CONFIG_DIR, "contract.json"), JSON.stringify(contractAddress));
    return {
      status: true,
      message: "Success",
      result: { decimal },
    };
  } catch (err) {
    console.log(err, "err");
    return { status: false };
  }
}

// ============================================================
// Function: gasFeeSendToUsr
// ============================================================
const gasFeeSendToUsr = async ({ usrAddress, fee }) => {
  try {
    console.log("----------------gasFeeSendToUsr---------------");
    let getBal = await web3.eth.getBalance(adminAddress);
    let bal = web3.utils.fromWei(getBal, "ether");
    console.log("----------bal", bal);
    console.log("----------fee", fee);
    if (bal < fee) {
      console.log("no balance");
      return { status: false, message: "Insuffient ETH balance" };
    }

    let getGasPrice = bumpGasPrice(await web3.eth.getGasPrice());
    let txCount = await web3.eth.getTransactionCount(adminAddress, "pending");
    let gaslimit = await web3.utils.toHex(21000);

    fee = toWeiHex(fee);

    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gas: web3.utils.toHex(gaslimit),
      gasPrice: web3.utils.toHex(getGasPrice),
      to: usrAddress.toString(),
      from: adminAddress.toString(),
      value: fee,
    };

    console.log(txObject, "txObject");

    // Queued per admin address; lock released once the node accepts the tx.
    const queuedGas = await enqueueSweep(adminAddress, async () => {
      const liveTx = await web3.eth.getTransactionCount(
        adminAddress,
        "pending"
      );
      txObject.nonce = web3.utils.toHex(liveTx);
      const signedTransaction = await web3.eth.accounts.signTransaction(
        txObject,
        adminPrivateKey
      );
      console.log(signedTransaction, "sendTransaction");

      // let bufferPrivateKey = Buffer.from(adminPrivateKey, "hex");
      // const tx = new Tx(txObject, { chain: config.WEB3_CHAIN });
      // tx.sign(bufferPrivateKey);
      // const serializedTx = tx.serialize();
      // const raw1 = "0x" + serializedTx.toString("hex");
      const promi = web3.eth.sendSignedTransaction(
        signedTransaction?.rawTransaction
      );
      const acceptedHash = await new Promise((resolve, reject) => {
        promi.once("transactionHash", resolve);
        promi.once("error", reject);
      });
      return { acceptedHash, promi };
    });
    queuedGas.promi.catch(() => {});
    let transactionData = await queuedGas.promi;
    console.log(transactionData, "transactionData");
    return {
      status: true,
      data: transactionData?.transactionHash,
      message: "Withdraw successfully",
    };
  } catch (err) {
    console.log("----ERC_20 SEND ETH ERROR :", err);
    return { status: false };
  }
};

// ============================================================
// Function: sendEth  (ONLY SEND ETH)
// ============================================================
const sendEth = async ({ fromAddress, toAddress, privateKey, amount }) => {
  try {
    // console.log(fromAddress,toAddress,privateKey,amount,'--------*fromAddress,toAddress,privateKey,amount*')
    let getBalance = await web3.eth.getBalance(fromAddress);
    let balance = web3.utils.fromWei(getBalance, "ether");
    let getGasPrice = bumpGasPrice(await web3.eth.getGasPrice());
    let txCount = await web3.eth.getTransactionCount(fromAddress, "pending");

    let gaslimit = await web3.utils.toHex(21000);
    console.log(balance, "------balance");
    console.log(amount, "------amount");
    if (parseFloat(balance) > parseFloat(amount)) {
      amount = toWeiHex(amount);

      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(gaslimit),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: toAddress.toString(),
        from: fromAddress.toString(),
        value: amount,
      };

      let raw1;
      if (Tx) {
        var bufferPrivateKey = Buffer.from(privateKey, "hex");
        // console.log("------bufferPrivateKey", bufferPrivateKey)
        const tx = new Tx(txObject, { chain: config.WEB3_CHAIN });
        // const tx = new Tx(txObject, { chain: "mainnet" });
        tx.sign(bufferPrivateKey);
        const serializedTx = tx.serialize();
        raw1 = "0x" + serializedTx.toString("hex");
      } else {
        // ethereumjs-tx not installed: identical outcome via web3 signing
        const account = web3.eth.accounts.privateKeyToAccount(
          privateKey.startsWith("0x") ? privateKey : "0x" + privateKey
        );
        const signed = await account.signTransaction({
          ...txObject,
          gas: txObject.gasLimit,
        });
        raw1 = signed.rawTransaction;
      }
      let transactionData = await web3.eth.sendSignedTransaction(raw1);

      return {
        status: true,
        data: transactionData,
        message: "Withdraw successfully",
      };
    } else {
      console.log("no balance");
      return { status: false, message: "Insuffient ETH balance" };
    }
  } catch (err) {
    console.log("----ERC_20 SEND ETH ERROR :", err);
    return { status: false };
  }
};

// ============================================================
// Function: sendToken  (ONLY SEND ERC20)
// ============================================================
const sendToken = async ({
  toAddress,
  fromAddress,
  contractAddress,
  privateKey,
  txCount,
  gaslimit,
  getGasPrice,
  amount,
  muldecimal,
  contract,
}) => {
  try {
    console.log("----------------sendToken--------------", fromAddress, toAddress);
    if (!toAddress || !web3.utils.isAddress(toAddress)) {
      console.log("SEND ERC 20 Token: invalid toAddress:", toAddress);
      return { status: false, message: "Invalid destination address" };
    }
    amount = parseFloat(amount) * muldecimal;
    amount = parseInt(amount).toString();
    amount = convert(amount);
    console.log("-----------amount", amount);
    console.log("-----------contractAddress", contractAddress);
    console.log("-----------adminAddress", adminAddress);
    console.log("-----------fromAddress", fromAddress);
    console.log("-----------toAddress", toAddress);
    let data = contract.methods.transfer(toAddress, amount).encodeABI();
    // Queued per deposit address (see sweepQueues); fresh pending nonce
    // inside the lock so overlapping sweeps never share one. Lock is
    // released once the node accepts the tx; mining is awaited after.
    const queuedToken = await enqueueSweep(fromAddress, async () => {
      const liveTx = await web3.eth.getTransactionCount(fromAddress, "pending");
      let transactionObject = {
        gas: web3.utils.toHex(gaslimit),
        gasPrice: web3.utils.toHex(getGasPrice),
        data: data,
        nonce: liveTx,
        from: fromAddress,
        to: contractAddress,
      };

      console.log(
        transactionObject,
        "transactionObjecttransactionObjecttransactionObject"
      );

      const signedTransaction = await web3.eth.accounts.signTransaction(
        transactionObject,
        privateKey
      );
      console.log(signedTransaction, "sendTransaction");

      // const tx = new Tx(transactionObject, { chain: config.WEB3_CHAIN });
      // let bufferPrivateKey = Buffer.from(privateKey, "hex");
      // tx.sign(bufferPrivateKey);
      // const serializedTx = tx.serialize();
      // const raw1 = "0x" + serializedTx.toString("hex");
      const promi = web3.eth.sendSignedTransaction(
        signedTransaction?.rawTransaction
      );
      const acceptedHash = await new Promise((resolve, reject) => {
        promi.once("transactionHash", resolve);
        promi.once("error", reject);
      });
      return { acceptedHash, promi };
    });
    queuedToken.promi.catch(() => {});
    let txHash = await queuedToken.promi;
    console.log(txHash, "-------txHash");
    return { status: true, data: txHash };
  } catch (err) {
    console.log("SEND ERC 20 Token:", err);
    return { status: false, message: "Error On Occured" };
  }
};

// ============================================================
// CRON: block scanner (start/stop controllable)
// ============================================================
let blockCronTask = null;
let warnedBlockSource = false;

function startBlockCron() {
  if (blockCronTask) return blockCronTask;

  blockCronTask = cron.schedule("*/1 * * * * *", async () => {
    // runCron=true until initialCall finishes loading addresses/contracts.
    if (runCron) {
      return;
    }
    // No block source configured at all: nothing to scan with.
    if (!config.ETH.URL && !config.WEB3_PROVIDER) {
      if (!warnedBlockSource) {
        warnedBlockSource = true;
        console.error(
          "eth-cron block scanner: neither ETH.URL nor WEB3_PROVIDER is set, skipping block scans"
        );
      }
      return;
    }
    // Self-heal (same rule as evm-track/app.js initialCall): if the stored
    // block is missing/corrupt ({} / NaN), reseed from the chain tip so one
    // bad state file can't wedge the scanner with "NaN" validator errors.
    if (!network || network.block == null || !Number.isFinite(Number(network.block))) {
      try {
        const latest = await web3.eth.getBlockNumber();
        network.block = Number(latest) - 6;
        fs.writeFileSync(
          path.join(CONFIG_DIR, "network.json"),
          JSON.stringify(network)
        );
        console.log("eth-cron block scanner: reseeded empty block from tip:", network);
      } catch (seedErr) {
        console.error(
          "eth-cron block scanner: cannot reseed block:",
          seedErr?.message
        );
        return;
      }
    }
    // Same block must not be scanned by two overlapping ticks.
    if (isBlockCronRunning) {
      return;
    }
    isBlockCronRunning = true;
    // console.log('---------in cron')
    try {
      let txHashs = null;
      if (config.ETH.URL) {
        // Primary path (same as evm-track/app.js): Etherscan-compatible
        // proxy API listing of the tracked block.
        const resp = await axios.get(config.ETH.URL, {
          params: {
            chainid: config.ETH.CHAINID,
            module: "proxy",
            action: "eth_getBlockByNumber",
            tag: `0x${network.block.toString(16)}`,
            boolean: "true",
            apikey: config.ETH.KEY,
          },
        });
        // console.log("---resp", resp);
        txHashs = resp.data.result;
      } else {
        // Fallback path (evm-track/app.js commented web3-native scan):
        // hydrated block straight from the RPC provider, no API key needed.
        // Downloaded tx objects carry the same to/from/value/input/hash
        // fields txDetail/txHashList consume.
        if (!warnedBlockSource) {
          warnedBlockSource = true;
          console.log(
            "eth-cron block scanner: ETH.URL not set, scanning via WEB3_PROVIDER"
          );
        }
        txHashs = await web3.eth.getBlock(Number(network.block), true);
      }
      // console.log("🚀 ~ txHashs:", txHashs)
      // runCron = true;
      console.log("---network", network, txHashs?.transactions?.length);
      if (txHashs != null && !isEmpty(txHashs.hash)) {
        if (txHashs.transactions != null && txHashs.transactions.length > 0) {
          await txHashList(txHashs.transactions, 0);
        }
        network["block"] = network["block"] + 1;
        fs.writeFileSync(path.join(CONFIG_DIR, "network.json"), JSON.stringify(network));
        // } else {
        //   console.log("Block data incomplete, not incrementing block:", network.block);
      }
    } catch (err) {
      console.log("---network", network, err);
      // if (err?.message == 'Maximum call stack size exceeded') {
      //   if (bnbKey != config.BNB.KEY) {
      //     bnbKey = config.BNB.KEY
      //   } else if (bnbKey != config.BNB.ALTERNATE_KEY) {
      //     bnbKey = config.BNB.ALTERNATE_KEY
      //   }
      // }
    } finally {
      isBlockCronRunning = false;
    }
  });

  return blockCronTask;
}

function stopBlockCron() {
  if (blockCronTask) {
    blockCronTask.stop();
    blockCronTask = null;
  }
}

// ============================================================
// Function: invokeTransferTokenReceiver (in-process deposit notify)
// Replaces axios.post(`${ORIGINALURL}/merchant/transfer_token_receiver`).
// Calls the backend controller directly with the same payload.
// Lazy require: transferToReceiver requires this module (sweep fns),
// so a top-level require would capture an incomplete circular export.
// Outcome mapping mirrors the old HTTP semantics:
//   2xx or 409/4xx -> success (4xx = already-processed/validation, no retry)
//   500 / no reply -> throw with .response.status so txDetail requeues it
// ============================================================
const invokeTransferTokenReceiver = async (payload) => {
  // NB: file is transferToReceiver.js but the export is transferTokenReceiver.
  const {
    transferTokenReceiver,
  } = require("../../controllers/merchant/transferToReceiver");
  const {
    transferTokenReceiverValidator,
  } = require("../../controllers/merchant/validators/transferTokenReceiver.validator");

  // Same validation the HTTP route applies (zodValidate), incl. network
  // upper-casing and amount coercion the controller depends on.
  const parsed = transferTokenReceiverValidator.safeParse(payload);
  if (!parsed.success) {
    return {
      statusCode: 400,
      payload: { success: false, issues: parsed.error.issues },
    };
  }

  let statusCode = null;
  let body = null;
  // Minimal Fastify reply surface: the controller only uses code().send().
  const reply = {
    code: (c) => {
      statusCode = c;
      return {
        send: (p) => {
          body = p;
          return p;
        },
      };
    },
  };

  await transferTokenReceiver({ body: payload, validatedData: parsed.data }, reply);

  if (statusCode === null) {
    const err = new Error("transferTokenReceiver did not reply");
    err.response = { status: 500, data: null };
    throw err;
  }
  if (statusCode >= 500) {
    const err = new Error(
      body?.message || `transferTokenReceiver failed (${statusCode})`
    );
    err.response = { status: statusCode, data: body };
    throw err;
  }
  return { statusCode, payload: body };
};

// ============================================================
// Function: txHashList
// ============================================================
async function txHashList(txHashs, index) {
  if (index >= txHashs.length) return;
  // One empty entry must not abort the rest of the block scan.
  if (isEmpty(txHashs[index])) {
    await txHashList(txHashs, index + 1);
    return;
  }
  await txDetail(txHashs[index]);
  await txHashList(txHashs, index + 1);
}

// ============================================================
// Function: txDetail
// ============================================================
async function txDetail(txData) {
  // console.log('-------1', txData != null)
  // console.log('-------2', txData.to != null)
  // console.log('-------3', txData.from.toLowerCase() != adminAddress)
  try {
    // let txData = await web3.eth.getTransaction(txId);
    if (
      txData != null &&
      txData?.to != null &&
      txData?.from?.toLowerCase() != adminAddress?.toLowerCase()
    ) {
      let amount;
      let symbol;

      // console.log(txData?.to == "0xa0d60cdef8b74dc11335303aa36a71413934ebe3" ? txData?.to : "Not Found");
      const contract = txData?.to?.toLowerCase();
      let contractInfo = contractAddress[txData?.to?.toLowerCase()];
      // console.log(contractInfo,"contractInfo");

      if (checkContract == true && !isEmpty(contractInfo)) {
        let decodeData = decodeInputData(txData?.input);
        // console.log(decodeData,"decodeData");
        // amount = formatTokenAmount(
        //   BigInt(decodeData.amount),
        //   contractInfo.decimal
        // );

        // symbol = contractInfo.symbol;

        // console.log(amount, 'amount');
        if (
          decodeData?.status == true &&
          depositAddress?.includes(decodeData?.address?.toLowerCase())
        ) {
          const rawAmount = BigInt(decodeData?.amount);
          const decimals = Number(contractInfo?.decimal);

          console.log("rawAmount:", rawAmount, "decimals:", decimals);

          const amount = formatTokenAmount(rawAmount, decimals);

          // console.log("amount:", amount);
          //
          // console.log(amount,'wei');

          // const eth = web3.utils.fromWei(wei.toString(), 'ether');
          const checksumAddress = web3.utils.toChecksumAddress(
            decodeData?.address
          );
          const checksumContractAddress = web3.utils.toChecksumAddress(
            txData?.to
          );

          console.log("-----------------------token call");
          console.log({
            address: checksumAddress,
            amount: amount,
            coin: {
              [contract]: contractInfo,
            },
            txId: txData?.hash,
            from: txData?.from,
            contractAddress: checksumContractAddress,
          });
          // In-process deposit notify (was axios.post to
          // `${ORIGINALURL}/merchant/transfer_token_receiver`).
          // Idempotent backend returns 200 alreadyProcessed on replay.
          // Any 4xx = do NOT retry (would double-credit / loop forever).
          const tokenResult = await invokeTransferTokenReceiver({
            address: checksumAddress,
            amount: amount,
            coin: {
              [contract]: contractInfo,
            },
            txId: txData?.hash,
            from: txData?.from,
            contractAddress: checksumContractAddress,
            network: config.WEB3_CHAIN,
          });
          if (
            tokenResult.statusCode === 409 ||
            (tokenResult.statusCode >= 400 && tokenResult.statusCode < 500)
          ) {
            console.log(
              `Token ${txData?.hash} already processed (${tokenResult.statusCode}), treating as success:`,
              tokenResult.payload?.message ||
                JSON.stringify(tokenResult.payload)?.slice(0, 300)
            );
          }

          console.log("Token sent to Ecobanx DB");

          // webhookCall({
          //   address: decodeData?.address,
          //   amount: decodeData.amount,
          //   coin: contractInfo,
          //   txId: txData.hash,
          //   from: txData.from,
          // });
        }
      } else if (
        checkUsrDeposit == true &&
        depositAddress.includes(txData?.to?.toLowerCase())
      ) {
        console.log(
          "-----------------------coin call",
          txData?.from,
          adminAddress?.toLowerCase()
        );
        if (txData?.from?.toLowerCase() != adminAddress?.toLowerCase()) {
          const wei = BigInt(txData?.value);
          const eth = web3.utils.fromWei(wei.toString(), "ether");

          const checksumAddress = web3.utils.toChecksumAddress(txData?.to);

          // console.log(checksumAddress,"checksums");
          // const sentAddress = txData?.to.toUpperCase();

          console.log({
            address: checksumAddress,
            amount: eth,
            coin: config.WEB3_CHAIN,
            txId: txData?.hash,
            from: txData?.from,
            contractAddress: txData?.to?.toLowerCase(),
            network: config.WEB3_CHAIN,
          });
          // In-process deposit notify (was axios.post to
          // `${ORIGINALURL}/merchant/transfer_token_receiver`).
          const coinResult = await invokeTransferTokenReceiver({
            address: checksumAddress,
            amount: eth,
            coin: {},
            txId: txData?.hash,
            from: txData?.from,
            network: config.WEB3_CHAIN,
          });
          if (
            coinResult.statusCode === 409 ||
            (coinResult.statusCode >= 400 && coinResult.statusCode < 500)
          ) {
            console.log(
              `Coin ${txData?.hash} already processed (${coinResult.statusCode}), treating as success:`,
              coinResult.payload?.message ||
                JSON.stringify(coinResult.payload)?.slice(0, 300)
            );
          }
          console.log("Coin sent to Ecobanx DB");
        }
        // webhookCall({
        //   address: txData.to,
        //   amount: txData.value,
        //   coin: "ETH",
        //   txId: txData.hash,
        //   from: txData.from,
        // });
      }
    }
    return true;
  } catch (err) {
    const status = err?.response?.status;
    // 4xx (validation / already-processed) must NOT be requeued -
    // retrying them caused the double-credit / 409 loop.
    // Only 5xx / network errors are retryable.
    if (status >= 400 && status < 500) {
      console.log(
        `-----txDetail non-retryable ${status} for ${txData?.hash}:`,
        err?.response?.data || err.message
      );
      return true;
    }
    console.log(
      "-----err txDetail --- ",
      txData?.hash,
      " ---- ",
      err?.message || err
    );
    try {
      if (txData?.hash) {
        await hset(
          "ethTrxDetailError",
          String(txData.hash),
          JSON.stringify({
            txHash: txData.hash,
            error: err?.message || String(err),
          })
        );
      }
    } catch (hsetErr) {
      console.log("hset ethTrxDetailError failed:", hsetErr?.message);
    }
    return false;
  }
}

// ============================================================
// Function: decodeInputData
// ============================================================
function decodeInputData(input) {
  try {
    const functionSignature = "transfer(address,uint256)";
    const functionSelector = input.slice(0, 10);
    const parameters = input.slice(10);
    if (functionSelector === web3.utils.sha3(functionSignature).slice(0, 10)) {
      const addressParam = "0x" + parameters.slice(24, 64);
      // web3 v4 removed utils.toBN — native BigInt gives the identical uint256 string.
      const uint256Param = BigInt("0x" + parameters.slice(64)).toString();

      return {
        status: true,
        address: addressParam,
        amount: uint256Param,
      };
    } else {
      return {
        status: false,
      };
    }
  } catch (error) {
    return {
      status: false,
    };
  }
}

// ============================================================
// Function: formatTokenAmount
// ============================================================
function formatTokenAmount(rawAmount, decimals) {
  const amount = rawAmount.toString();

  if (decimals === 0) {
    return amount;
  }

  const padded = amount.padStart(decimals + 1, "0");

  const position = padded.length - decimals;

  const whole = padded.slice(0, position);
  const fraction = padded.slice(position).replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole;
}

// ============================================================
// Function: webhookCall
// ============================================================
async function webhookCall(reqBody) {
  try {
    let auth = walletServSign({
      id: config.SERVICE.WALLET.ETH_ID,
    });
    if (!auth.status) {
      return false;
    }
    console.log("----webhoolcall", reqBody);
    let respData = await axios({
      method: "post",
      headers: {
        Authorization: auth.token,
        "Accept-Encoding": "gzip,deflate,compress",
      },
      url: `${config.SERVICE.WALLET.ETH_URL}/api/wallet/eth-deposit-webhook`,
      data: reqBody,
    });
    return true;
  } catch (err) {
    hset("ethWebhookFailer", reqBody.txId, JSON.stringify(reqBody));
    return false;
  }
}

// ============================================================
// CRON: failed webhook / tx retry (start/stop controllable)
// ============================================================
let failWebhookCronTask = null;

function startFailWebhookCron() {
  if (failWebhookCronTask) return failWebhookCronTask;

  failWebhookCronTask = cron.schedule("* * * * *", async () => {
    console.log("----failer webhook cron");
    if (failWebhookCron) {
      return;
    }
    failWebhookCron = true;
    try {
      let records = await hgetall("ethWebhookFailer");
      for (const key in records) {
        if (records != null) {
          let item = JSON.parse(records[key]);
          if (item) {
            let respStatus = await webhookCall(item);
            console.log("----failer webhook cron --respStatus", respStatus);

            if (respStatus) {
              await hdel("ethWebhookFailer", key);
            }
          }
        }
      }
    } catch (err) {}

    try {
      let records = await hgetall("ethTrxDetailError");
      if (records != null) {
        for (const txId in records) {
          // Key is the tx hash (see txDetail catch). Re-fetch full tx then retry.
          try {
            const txData = await web3.eth.getTransaction(txId);
            if (!txData) {
              await hdel("ethTrxDetailError", txId);
              continue;
            }
            let txStatus = await txDetail(txData);
            if (txStatus) {
              await hdel("ethTrxDetailError", txId);
            }
          } catch (retryErr) {
            console.log(
              `ethTrxDetailError retry failed for ${txId}:`,
              retryErr?.message
            );
          }
        }
      }
    } catch (err) {}

    failWebhookCron = false;
  });

  return failWebhookCronTask;
}

function stopFailWebhookCron() {
  if (failWebhookCronTask) {
    failWebhookCronTask.stop();
    failWebhookCronTask = null;
  }
}

// ============================================================
// Function: getInfo  (replacement for the /Info route)
// ============================================================
async function getInfo() {
  return { status: true, depositAddress, contractAddress, adminAddress };
}

// ============================================================
// Function: manualTrx  (replacement for the /manual-trx route)
// input:  txid
// output: { status, txData? }
// ============================================================
async function manualTrx(txid) {
  try {
    let txData = await web3.eth.getTransaction(txid);
    if (txData) {
      txDetail(txData);
    }
    return { status: true, txData };
  } catch (err) {
    return { status: false };
  }
}

// ============================================================
// Function: getCoinBalance  (replacement for /get-coin-bal)
// ============================================================
async function getCoinBalance() {
  try {
    let getBal = await web3.eth.getBalance(adminAddress);
    let curBal = web3.utils.fromWei(getBal, "ether");
    return {
      status: true,
      message: "Success",
      result: {
        status: true,
        balance: curBal,
      },
    };
  } catch (err) {
    return { status: false };
  }
}

// ============================================================
// Function: getTokenBalance  (replacement for /get-token-bal)
// input:  { contractAddress }
// ============================================================
async function getTokenBalance(reqBody) {
  try {
    let contract = new web3.eth.Contract(erc20MinAbi, reqBody.contractAddress);
    let conDecimal = await contract.methods.decimals().call();
    let conBal = await contract.methods.balanceOf(adminAddress).call();
    let curBal = parseInt(conBal) / 10 ** parseInt(conDecimal);
    return {
      status: true,
      message: "Success",
      result: {
        status: true,
        balance: curBal,
      },
    };
  } catch (err) {
    console.log("err:------ ", err);
    return { status: false };
  }
}

// ============================================================
// Function: getLatestBlock  (replacement for /getLatestBlock)
// ============================================================
async function getLatestBlock() {
  const latest = await web3.eth.getBlockNumber();
  return { status: true, data: latest };
}

// ============================================================
// Function: getnewaddress  (replacement for /getnewaddress)
// ============================================================
async function getnewaddress() {
  console.log("getnewaddress");
  try {
    let account = await web3.eth.accounts.create();
    depositAddress.push(account.address.toLowerCase());
    console.log("getnewaddress", depositAddress);
    fs.writeFileSync(path.join(CONFIG_DIR, "address.json"), JSON.stringify(address));
    return { status: true, data: account };
  } catch (err) {
    console.log(err, "err");
    return { status: false };
  }
}

// ============================================================
// Function: storeAddress  (replacement for /storeAddress)
// input:  { address, add }
// ============================================================
async function storeAddress(reqBody) {
  console.log("storeAddress", reqBody);
  try {
    if (isEmpty(reqBody?.address)) {
      return { status: false, message: "Please Enter Address" };
    }
    console.log("🚀 ~ reqBody.add:", reqBody?.address);
    const _list = Array.isArray(reqBody?.address)
      ? reqBody.address
      : [reqBody?.address];
    if (reqBody?.add === true) {
      console.log("added");
      _list?.forEach((address) => {
        if (!depositAddress?.includes(address?.toLowerCase())) {
          depositAddress.push(address?.toLowerCase());
          fs.writeFileSync(
            path.join(CONFIG_DIR, "address.json"),
            JSON.stringify(depositAddress, null, 2)
          );
        }
        console.log("🚀 ~ depositAddress:", depositAddress);
      });
      return { status: true, data: depositAddress };
    } else {
      _list?.forEach((address) => {
        if (depositAddress?.includes(address?.toLowerCase())) {
          depositAddress = depositAddress.filter(
            (item) => item !== address?.toLowerCase()
          );
          fs.writeFileSync(
            path.join(CONFIG_DIR, "address.json"),
            JSON.stringify(depositAddress, null, 2)
          );
        }
        console.log("🚀 ~ depositAddress:", depositAddress);
      });
      return { status: true, data: depositAddress };
    }
  } catch (error) {
    console.log(error, "err");
    return { status: false };
  }
}

// ============================================================
// Function: initialCall
// ============================================================
const initialCall = async () => {
  console.log("initialCall");
  if (config.ORIGINALURL) {
    console.log(
      "---------in call",
      `${config.SERVICE.WALLET.ETH_URL}/api/wallet/eth-deposit-info`
    );
  }
  console.log(
    "---------WEB3_PROVIDER set:",
    !!config.WEB3_PROVIDER,
    "ORIGINALURL:",
    config.ORIGINALURL
  );
  if (!config.WEB3_PROVIDER) {
    console.error(
      "FATAL: WEB3_PROVIDER is undefined. Check local.env is loaded (see config/index.js --env file log)."
    );
  }
  // Same-process mode: ORIGINALURL is how this module syncs addresses /
  // contracts from the backend API. When it is not set, skip the HTTP sync
  // (requesting "undefined/..." would only throw ERR_INVALID_URL) and
  // hydrate from this module's local config files so the crons still
  // watch known state. Set ORIGINALURL=<backend>/Ecobanx to sync live.
  if (!config.ORIGINALURL) {
    console.error(
      "eth-cron initialCall: ORIGINALURL is not set, skipping backend sync; using local config files"
    );
    try {
      console.log("check local");
      const fileData = fs.readFileSync(
        path.join(CONFIG_DIR, "address.json"),
        "utf-8"
      );
      const local = JSON.parse(fileData);
      if (Array.isArray(local) && local.length > 0) {
        depositAddress = local.map((a) => String(a).toLowerCase());
      }
    } catch (e) {
      console.error(
        "eth-cron initialCall: cannot read local address.json:",
        e?.message
      );
    }
    try {
      console.log("check local contract");
      const cData = fs.readFileSync(
        path.join(CONFIG_DIR, "contract.json"),
        "utf-8"
      );
      const localContracts = JSON.parse(cData);
      if (localContracts && Object.keys(localContracts).length > 0) {
        contractAddress = Object.fromEntries(
          Object.entries(localContracts).map(([addr, info]) => [
            addr.toLowerCase(),
            info,
          ])
        );
      }
    } catch (e) {
      console.error(
        "eth-cron initialCall: cannot read local contract.json:",
        e?.message
      );
    }
    adminAddress = config.ADMIN.ADDRESS;
    adminPrivateKey = config.ADMIN.PRIVATEKEY;
    if (depositAddress.length > 0) checkUsrDeposit = true;
    if (Object.keys(contractAddress).length > 0) checkContract = true;
    return true;
  }
  try {
    console.log("check network");
    if (network && isEmpty(network.block)) {
      try {
        const latest = await web3.eth.getBlockNumber();
        network["block"] = latest - 6;
        fs.writeFileSync(path.join(CONFIG_DIR, "network.json"), JSON.stringify(network));
      } catch (blockErr) {
        console.error(
          "getBlockNumber failed (provider/network issue), continuing without block init:",
          blockErr?.message
        );
      }
    }
    // let auth = walletServSign({
    //   id: config.SERVICE.WALLET.ETH_ID,
    // });
    // console.log('auth: ', auth);
    // if (!auth.status) {
    //   return false;
    // }
    // var addressed = [];
    // console.log("getAllAddress");
    // await axios
    //   .post(`${config.ORIGINALURL}/admin/getBothAddress`)
    //   .then((res) => {
    //     // if (res?.data?.result?.length > 0) {
    //     //   addressed = res?.data?.result
    //     // }
    //     if (res?.data?.getAlladdress?.length > 0) {
    //       // console.log(res?.data?.getAlladdress,"data");

    //       const addresses = res?.data?.getAlladdress;
    //       console.log("addresses", addresses);
    //       addressed = addresses.map((item) => item.address.toLowerCase());

    //       //   fs.writeFileSync('./config/address.json', JSON.stringify(addresses, null, 2));
    //       // const fileData = fs.readFileSync('./config/address.json', 'utf-8');
    //       // depositAddress = JSON.parse(fileData);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("eth-cron initialCall: getBothAddress failed:", err?.message);
    //   });
    console.log("getAllAddress from service");

const addresses = await getBothAddressData();

console.log("addresses", addresses);

var addressed = addresses
  .map((item) => item.address)
  .filter(Boolean)
  .map((address) => address.toLowerCase());

console.log("addressed", addressed);

    // let data = JSON.stringify({
    //   'type': 'evm'
    // });

    // let config = {
    //   method: 'post',
    //   url: 'https://gptex.io/goldparkapi/wallet/getUserAddress',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   data: data
    // };

    // await axios.request(config)
    //   .then((response) => {
    //     console.log(JSON.stringify(response.data));
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    let respData = await axios({
      method: "post",
      // headers: {
      //   Authorization: auth.token,
      //   "Accept-Encoding": "gzip,deflate,compress",
      // },
      data: {
        networkSymbol: "ETH",
      },

      url: `${config.ORIGINALURL}/admin/getContractAddress`,
    });
    if (respData && respData.data && respData.data.success == true) {
      let respResult = respData.data.data;
      if (respResult) {
        // console.log(respResult,"respResult");

        // if (respResult.contractList && !isEmpty(respResult.contractList)) {
        checkContract = true;
        contractAddress = Object.fromEntries(
          respResult.flatMap((item) =>
            Object.entries(item).map(([address, info]) => [
              address.toLowerCase(),
              info,
            ])
          )
        );
        // contractAddress[reqBody.contractAddress.toLowerCase()] = { decimal, symbol };
        fs.writeFileSync(
          path.join(CONFIG_DIR, "contract.json"),
          JSON.stringify(contractAddress)
        );
        // }

        // if (
        //   respResult.depositAddress &&
        //   Array.isArray(respResult.depositAddress) &&
        //   respResult.depositAddress.length > 0
        // ) {
        if (addressed?.length > 0) {
          fs.writeFileSync(
            path.join(CONFIG_DIR, "address.json"),
            JSON.stringify(addressed, null, 2)
          );
          const fileData = fs.readFileSync(path.join(CONFIG_DIR, "address.json"), "utf-8");
          depositAddress = JSON.parse(fileData);
          console.log("depositAddress.....", depositAddress);
        } else {
          depositAddress = addressed;
          console.log("depositAddress..****.", depositAddress);
        }
        checkUsrDeposit = true;

        // }

        adminAddress = config.ADMIN.ADDRESS;
        adminPrivateKey = config.ADMIN.PRIVATEKEY;
        // if (adminPrivateKey.substring(0, 2) == "0x") {
        //   adminPrivateKey = adminPrivateKey.substring(2);
        // }
      }
    }
  } catch (err) {
    console.log("------------err on incall", err);
    return true;
  }
  return true;
};

// ============================================================
// Function: startCron  (convenience - init + start both crons)
// ============================================================
async function startCron() {
  const status = await initialCall();
  console.log("----------config", config);
  console.log("--status", status);
  console.log("----network", network);
  console.log("----depositAddress", depositAddress);
  console.log("----contractAddress", contractAddress);
  console.log("----adminAddress", adminAddress);
  // let redisStatus = await redisConnection();
  if (status) {
    if (checkUsrDeposit || checkContract) {
      runCron = false;
      failWebhookCron = false;
    }
    startBlockCron();
    startFailWebhookCron();
  }
  return status;
}

// ============================================================
// EXPORTS (CommonJS — same function names/signatures as before)
// ============================================================
module.exports = {
  // default-export bundle alias kept for `ethCron.default` interop
  default: null, // replaced below with the bundle itself
  // shared state getters
  getDepositAddress,
  getContractAddress,
  getAdminAddress,
  web3,

  // core deposit / withdraw ops
  moveEthToAdmin,
  moveErc20TokenToAdmin,
  moveEthToUser,
  moveErc20TokenToUser,
  gasFeeSendToUsr,
  sendEth,
  sendToken,

  // tx scanning / processing
  txDetail,
  txHashList,
  decodeInputData,
  formatTokenAmount,
  webhookCall,

  // helpers replacing old HTTP routes
  newContractInfo,
  getInfo,
  manualTrx,
  getCoinBalance,
  getTokenBalance,
  getLatestBlock,
  getnewaddress,
  storeAddress,

  // lifecycle
  initialCall,
  startCron,
  startBlockCron,
  stopBlockCron,
  startFailWebhookCron,
  stopFailWebhookCron,

  // utils
  convert,
  enqueueSweep,

  // in-process deposit notify (direct transferToReceiver call)
  invokeTransferTokenReceiver,
};

// `import ethCron from "./eth-cron"` equivalent: default === the bundle
module.exports.default = module.exports;