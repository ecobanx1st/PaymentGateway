const { requestWithdrawValidator } = require("./withdraw.validator");
const {
  createApiKeyValidator,
  updateApiKeyValidator,
  updatePermissionsValidator,
} = require("./apiKey.validator");
const { getAuthorizedTokenValidator } = require("./getAuthorizedToken.validator");
const { getDepositAddressValidator } = require("./depositAddress.validator");
const { confirmTransactionValidator } = require("./confirmTransaction.validator");
const { basicInfoValidator } = require("./basicInfo.validator");
const { balancesValidator } = require("./balances.validator");
const { depositAddressesValidator } = require("./depositAddresses.validator");
const { createTransactionValidator, createInvoiceTransactionValidator } = require("./createTransaction.validator");
const { getTxInfoValidator } = require("./getTxInfo.validator");
const { getTxInfoMultiValidator } = require("./getTxInfoMulti.validator");
const { getWithdrawalHistoryValidator } = require("./getWithdrawalHistory.validator");
const { getWithdrawalInfoValidator } = require("./getWithdrawalInfo.validator");
const { createTransferValidator } = require("./createTransfer.validator");
const { transferTokenReceiverValidator } = require("./transferTokenReceiver.validator");
const { merchantassetvalidator } = require("./merchantassetvalidator");
const { getTransferTokenReceiverHistoryValidator } = require("./getTransferTokenReceiverHistory.validator");
const { usersDepositValidator } = require("./userDeposit.validator");
const { merchantWithdrawApprovalValidator, rejectMerchantWithdrawalValidator } = require("./merchantWithdrawApproval.validator");
const { generateQrCodeValidator } = require("./getQRCode.validator");

module.exports = {
  requestWithdrawValidator,
  createApiKeyValidator,
  updateApiKeyValidator,
  updatePermissionsValidator,
  getAuthorizedTokenValidator,
  getDepositAddressValidator,
  confirmTransactionValidator,
  basicInfoValidator,
  balancesValidator,
  depositAddressesValidator,
  createTransactionValidator,
  createInvoiceTransactionValidator,
  getTxInfoValidator,
  getTxInfoMultiValidator,
  getWithdrawalHistoryValidator,
  getWithdrawalInfoValidator,
  createTransferValidator,
  transferTokenReceiverValidator,
  getTransferTokenReceiverHistoryValidator,
  merchantassetvalidator,
  usersDepositValidator,
  merchantWithdrawApprovalValidator,
  rejectMerchantWithdrawalValidator,
  generateQrCodeValidator
};
