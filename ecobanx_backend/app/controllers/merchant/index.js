const requestWithdraw = require("./requestWithdraw");
const { getWithdrawals, getWithdrawalById } = require("./getWithdrawals");
const { getPendingPayouts } = require("./getPendingPayouts");
const apiKeyController = require("./apiKey.controller");
const { getBasicInfo } = require("./getBasicInfo");
const { getBalances } = require("./getBalances");
const { getDepositAddress } = require("./getDepositAddress");
const { listDepositAddresses } = require("./listDepositAddresses");
const { getApiHistory } = require("./getApiHistory");
const { createTransaction, createInvoiceTransaction } = require("./createTransaction");
const { getTransactionInfo } = require("./getTransactionInfo");
const { getTransactionInfoMulti } = require("./getTransactionInfoMulti");
const { getWithdrawalHistory } = require("./getWithdrawalHistory");
const { getWithdrawalInfo } = require("./getWithdrawalInfo");
const { createTransfer } = require("./createTransfer");
const { confirmTransaction } = require("./confirmTransaction");
const { getIpnHistory } = require("./getIpnHistory");
const { transferTokenReceiver } = require("./transferToReceiver");
const { getTransferToReceiverHistory } = require("./getTransferTokenReceiverHistory");
const { getDashboard } = require("./getDashboard");
const { getAllTransactions } = require("./getAllTransactions");
const { getMerchantAssets } = require("./getMerchantAssets");
const { getMerchantSettings, createMerchantSettings, updateMerchantSettings } = require("./merchantsettings");
const { userDeposit } = require("./userDeposit");
const {
  supportedAssets,
  supportedNetworks,
} = require("./supportedAssets");
const { getQRCode } = require("./getQRCode");

module.exports = {
  requestWithdraw,
  getWithdrawals,
  getWithdrawalById,
  getPendingPayouts,
  getDashboard, getBasicInfo,
  getBalances,
  getDepositAddress,
  listDepositAddresses,
  getAllTransactions,
  getApiHistory,
  createTransaction,
  createInvoiceTransaction,
  getTransactionInfo,
  getTransactionInfoMulti,
  getWithdrawalHistory,
  createTransfer,
  getWithdrawalInfo,
  confirmTransaction,
  getIpnHistory,
  transferTokenReceiver,
  getTransferToReceiverHistory,
  getMerchantSettings,
  createMerchantSettings,
  updateMerchantSettings,
  getMerchantAssets,
  userDeposit,
  supportedAssets,
  supportedNetworks,
  getQRCode,
  ...apiKeyController
};

