const { verifyOtpValidator } = require("./verifyOtpValidator");
const { registerValidator } = require("./registerValidator");
const { loginValidator } = require("./loginValidator");
const { resendOtpValidator } = require("./resendOtpValidator");
const { forgotPasswordValidator } = require("./forgotPasswordValidator");
const { resetPasswordValidator } = require("./resetPasswordValidator");
const { validate2FALoginValidator } = require("./validate2FALoginValidator");
const { adminLoginValidator } = require('./adminLoginValidator')
const { verify2FAValidator } = require('./verify2FAValidator');
const { disable2FAValidator } = require('./disable2FAValidator');
const { changePasswordValidator } = require('./changePasswordValidator')
const { updateAdminDetailsValidator } = require('./updateAdminDetailsValidator')
const { logoutValidator } = require('./logoutValidator')

module.exports = {
    verifyOtpValidator,
    loginValidator,
    resendOtpValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    validate2FALoginValidator,
    registerValidator,
    adminLoginValidator,
    verify2FAValidator,
    disable2FAValidator,
    changePasswordValidator,
    updateAdminDetailsValidator,
    logoutValidator,
};