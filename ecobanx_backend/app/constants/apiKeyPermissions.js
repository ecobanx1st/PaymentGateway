const API_KEY_PERMISSIONS = [
  "basicInfo",
  "getBalance",
  "deposit",
  "withdraw",
  "getTransaction",
  "getDepositHistory",
  "getWithdrawHistory",
  "convertCoins",
  "createTransaction",
];

const DEFAULT_API_KEY_PERMISSIONS = API_KEY_PERMISSIONS.reduce(
  (permissions, key) => {
    permissions[key] = false;
    return permissions;
  },
  {}
);

module.exports = { API_KEY_PERMISSIONS, DEFAULT_API_KEY_PERMISSIONS };
