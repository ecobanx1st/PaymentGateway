const { createSupportTicketValidator, sendMessageValidator } = require("./createSupportTicketValidator");
const { getUserNetworksValidator } = require("./network.validator");
const { getUserAssetsValidator } = require("./asset.validator");
const { createKycValidator, editKycValidator } = require("./kyc.validator");
const { createWalletAddressValidator } = require("./wallet.validator");
const { createKybValidator, editKybValidator } = require("./kyb.validator");
const { getBalancesValidator } = require("./getBalanceValidator");
const { getDepositHistoryValidator } = require("./depositHistory.validator");
const { updateProfileValidator } = require("./updateProfileValidator");

module.exports = {
  createSupportTicketValidator,
  sendMessageValidator,
  getUserNetworksValidator,
  getUserAssetsValidator,
  createKycValidator,
  editKycValidator,
  createWalletAddressValidator,
  createKybValidator,
  editKybValidator,
  getBalancesValidator,
  getDepositHistoryValidator,
  updateProfileValidator
};
