const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("./supportTicketCategoryController");

const {
  getAllTickets,
  getTicketById,
  adminReply,
  updateTicketStatus,
  markMessagesSeen,
} = require("./supportTicketAdminController");
const { getAllNotification, markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications } = require("./getAllNotification");
const {
  createNetwork,
  updateNetwork,
  deleteNetwork,
  hardDeleteNetwork,
  toggleNetworkStatus,
  getNetworkDetails,
  getAllNetworks,
} = require("./network.controller");
const {
  createAsset,
  updateAsset,
  deleteAsset,
  hardDeleteAsset,
  toggleAssetStatus,
  getAssetDetails,
  getAllAssets,

} = require("./asset.controller");
const { getAdminDashboard } = require("./getAdminDashboard");
const {
  getAllKyc,
  getSingleKyc,
  approveKyc,
  rejectKyc,
} = require("./kyc.controller");
const {
  getAllKyb,
  getKybDetails,
  approveKyb,
  rejectKyb,
} = require("./kyb.controller");


const {
  getAllWithdrawals,
  getWithdrawalDetail,
  approveWithdrawal,
  rejectWithdrawal,
} = require("./withdrawalController");
const { GetAllMerchantLists } = require("./GetAllMerchantLists");

const { getIpnHistory } = require("./ipnHistoryController");
const { blockusers } = require("./blockusers");
const { disable2FAUser } = require("./disable2FAUser");
const { GetAllDepositeHistory } = require("./GetAllDepositeHistory");
const getDepositHistoryById = require("./GetAllDepositeHistoryById");
const { getAllDepositAddress } = require("./getAllDepositAddress");
const { getContractAddress } = require("./getContractAddress");
const { getBothAddress } = require("./getBothAddress");

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllTickets,
  getTicketById,
  adminReply,
  updateTicketStatus,
  markMessagesSeen,
  getAllNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  clearAllNotifications,
  createNetwork,
  updateNetwork,
  deleteNetwork,
  hardDeleteNetwork,
  toggleNetworkStatus,
  getNetworkDetails,
  getAllNetworks,
  createAsset,
  updateAsset,
  deleteAsset,
  hardDeleteAsset,
  toggleAssetStatus,
  getAssetDetails,
  getAllAssets,
  getAllKyc,
  getSingleKyc,
  approveKyc,
  rejectKyc,
  getAllWithdrawals,
  getWithdrawalDetail,
  approveWithdrawal,
  rejectWithdrawal,
  getAllKyb,
  getKybDetails,
  approveKyb,
  rejectKyb,
  getIpnHistory,
  GetAllMerchantLists,
  blockusers,
  disable2FAUser,
  GetAllDepositeHistory,
  getDepositHistoryById,
  getAdminDashboard, 
  getAllDepositAddress, 
  getContractAddress,
  getBothAddress

};
