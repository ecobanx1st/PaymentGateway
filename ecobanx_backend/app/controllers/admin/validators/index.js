const { createCategoryValidator, updateCategoryValidator } = require("./supportTicketCategoryValidator");
const {
  updateTicketStatusValidator,
  adminReplyValidator,

} = require("./supportTicketValidator");
const { addcommissionValidator } = require("./addcommissionValidator");
const { updatecommissionValidator } = require("./updatecommissionValidator");
const { deletecommissionValidator } = require("./deletecommissionValidator");
const {
  createNetworkValidator,
  updateNetworkValidator,
  deleteNetworkValidator,
  getNetworkDetailsValidator,
  getAllNetworksValidator,
} = require("./network.validator");
const {
  createAssetValidator,
  updateAssetValidator,
  deleteAssetValidator,
  getAssetDetailsValidator,
  getAllAssetsValidator,
} = require("./asset.validator");
const {
  getAllKycValidator,
  rejectKycValidator,
} = require("./kyc.validator");
const {
  getAllKybValidator,
  rejectKybValidator,
} = require("./kyb.validator");
const { blockusersValidator } = require("./blockusersValidator");

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  updateTicketStatusValidator,
  adminReplyValidator,
  addcommissionValidator,
  updatecommissionValidator,
  deletecommissionValidator,
  createNetworkValidator,
  updateNetworkValidator,
  deleteNetworkValidator,
  getNetworkDetailsValidator,
  getAllNetworksValidator,
  createAssetValidator,
  updateAssetValidator,
  deleteAssetValidator,
  getAssetDetailsValidator,
  getAllAssetsValidator,
  getAllKycValidator,
  rejectKycValidator,
  getAllKybValidator,
  rejectKybValidator,
  blockusersValidator
};
