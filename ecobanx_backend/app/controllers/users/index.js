const { generate2FA } = require('./generate2FA');
const { changePassword } = require('./changePassword');
const { profile } = require('./profile');
const { updateProfile } = require('./updateProfile');
const { enable2FA } = require('./enable2FA');
const { disable2FA } = require('./disable2FA');
const { supportTicketCreate } = require('./supportTicketCreate');
const { getSupportTicket, getTicketById, closeTicket } = require('./getSupportTicket');
const { sendMessage, markMessagesSeen } = require('./sendMessage');
const { getAllNotification } = require('./getAllNotification');
const { markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications } = require('./markNotificationRead');
const { getUserNetworks } = require('./network.controller');
const { getUserAssets } = require('./asset.controller');
const { createKyc, getuserKyc, editKyc } = require('./kyc.controller');
const createWalletAddress = require('../auth/createWalletAddress');
const { createKyb, getuserKyb, editKyb } = require('./kyb.controller');
const { supportCategory } = require('./supportCategory')
const { getDepositHistory, getDepositHistoryById } = require('./depositHistory.controller')

module.exports = {
  changePassword,
  profile,
  updateProfile,
  generate2FA,
  enable2FA,
  disable2FA,
  supportTicketCreate,
  getSupportTicket,
  getTicketById,
  closeTicket,
  sendMessage,
  markMessagesSeen,
  getAllNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  clearAllNotifications,
  getUserNetworks,
  getUserAssets,
  createKyc,
  getuserKyc,
  editKyc,
  createWalletAddress,
  createKyb,
  getuserKyb,
  editKyb,
  supportCategory,
  getDepositHistory,
  getDepositHistoryById
};
