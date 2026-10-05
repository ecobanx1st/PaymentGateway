const { register } = require('./register')
const { verifyOtp } = require("./verifyOtp");
const { login } = require("./login");
const { resendOtp } = require("./resendOtp");
const { forgotPassword } = require("./forgotPassword");
const { resetPassword } = require("./resetPassword");
const { validate2FALogin } = require("./validate2FALogin");
const { adminLogin } = require('./adminLogin')
const { getAdminDetails } = require('./getAdminDetails');
const { logout } = require('./logout');
const { imageUploadForTemplate } = require('./imageUploadForTemplate');
const { googleLogin } = require('./googleLogin');
const { enable2FA } = require('./enable2FA');
const { getOtpStatus } = require('./getOtpStatus');


module.exports = {
    register,
    verifyOtp,
    login,
    resendOtp,
    forgotPassword,
    resetPassword,
    validate2FALogin,
    adminLogin,
    getAdminDetails, logout,
    imageUploadForTemplate,
    googleLogin,
    enable2FA,
    getOtpStatus
};