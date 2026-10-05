const { verifyAccessToken } = require("./utils/pasetoService");
const { Users } = require("../models/usersModel");
const { Admins } = require("../models/adminModel");
const { AdminStaff } = require("../models/AdminStaff");
const { MerchantApiKey } = require("../models/merchantApiKeyModel");
 
/**
* Access Token Validation Middleware
*
* Features:
* - Verifies PASETO signature
* - Checks token type is "access"
* - Rejects refresh tokens explicitly
* - Enforces role-based access
* - Loads user from database
*
* @param {string|string[]} requiredRoles - Allowed roles
* @returns {function} Fastify middleware
*/
const validateToken = (requiredRoles,requiredAccountTypes) => async (req, reply) => {
  try {
 
  
    const authHeader = req.headers.authorization;
 
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized: Missing or invalid authorization header. Expected: 'Bearer <token>'",
        code: "MISSING_TOKEN",
      });
    }
 
    const token = authHeader.split(" ")[1];
    let payload;
    let user = null;

 
 
    // ========== CRITICAL: Verify ACCESS token (not refresh) ==========
    // This will REJECT refresh tokens with WRONG_TOKEN_TYPE error
    try {
      payload = await verifyAccessToken(token);
      console.log("✅ Access token verified for user:", payload.id);
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
 
      // Explicitly reject refresh tokens sent to this endpoint
      if (err.message.includes("Invalid token type")) {
        return reply.code(401).send({
          success: false,
          message: "Cannot use refresh token as access token. This endpoint requires an access token. Use /auth/refresh-token to get one.",
          code: "WRONG_TOKEN_TYPE",
        });
      }
 
      if (err.message.includes("expired")) {
        return reply.code(401).send({
          success: false,
          message: "Token expired",
        });
      }
 
      return reply.code(401).send({
        success: false,
        message: "Unauthorized: Invalid or malformed token",
        code: "INVALID_TOKEN",
      });
    }
 
    // ========== If token contains apiKeyId, verify API key is still ACTIVE ==========
    if (payload.apiKeyId) {
      const apiKey = await MerchantApiKey.findById(payload.apiKeyId)
        .select("status expiresAt permissions")
        .lean();
 
      if (!apiKey || apiKey.status !== "ACTIVE") {
        return reply.code(401).send({
          success: false,
          message: "API key has been revoked or deactivated.",
          code: "API_KEY_REVOKED",
        });
      }
 
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return reply.code(401).send({
          success: false,
          message: "API key has expired.",
          code: "API_KEY_EXPIRED",
        });
      }
 
      req.apiKey = apiKey;
    }
 
    try {
      user = await Users.findById(payload.id).lean();
 
      if (!user) {
        user = await Admins.findById(payload.id).lean();
      }
 
      if (!user) {
        user = await AdminStaff.findById(payload.id).lean();
      }
 
      if (!user) {
        console.warn("⚠️ User not found after token verification:", payload.id);
        return reply.code(401).send({
          success: false,
          message: "User account not found. Token may be from deleted account.",
          code: "USER_NOT_FOUND",
        });
      }
 
 
      // ========== Account type access control ==========
if (requiredAccountTypes) {
  
  const accountType = Array.isArray(requiredAccountTypes)
    ? requiredAccountTypes
    : [requiredAccountTypes];
 
 
 
  const normalizedAccountTypes = accountType.map(type =>
    String(type).toLowerCase()
  );
 
  
  const userAccountType = user.accountType
    ? String(user.accountType).toLowerCase()
    : "";
 
  if (!normalizedAccountTypes.includes(userAccountType)) {
    console.warn(
      "⚠️ Invalid account type - User:",
      payload.id,
      "Account Type:",
      userAccountType,
      "Required:",
      normalizedAccountTypes
    );
 
    return reply.code(403).send({
      success: false,
      message: "Forbidden: This account type cannot access this resource",
      code: "INVALID_ACCOUNT_TYPE",
      requiredAccountTypes: normalizedAccountTypes,
      accountType: userAccountType,
    });
  }
}
 
      // ========== Reject blocked users ==========
      // Blocked accounts are forced out on every protected request.
      // Only regular users have a blockstatus field (admins/staff don't).
      if (user.blockstatus) {
        console.warn("🚫 Blocked user attempted access:", payload.id);
        return reply.code(403).send({
          success: false,
          message: "Your account has been blocked.",
        });
      }
 
      // Attach payload metadata to user object
      if (payload.permissions && Array.isArray(payload.permissions)) {
        user.permissions = payload.permissions;
      }
 
      if (payload.userType) {
        user.userType = payload.userType;
      }
 
      // Mark this as access token (for debugging/logging)
      user.tokenType = "access";
 
      // ========== Role-based access control ==========
      if (requiredRoles) {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const normalizedRoles = roles.map(role => String(role).toLowerCase());
        const userRole = user.role ? String(user.role).toLowerCase() : "";
 
        if (!normalizedRoles.includes(userRole)) {
          console.warn(
            "⚠️ Insufficient permissions - User:",
            payload.id,
            "Role:",
            userRole,
            "Required:",
            normalizedRoles
          );
 
          return reply.code(403).send({
            success: false,
            message: "Forbidden: Your role does not have permission to access this resource",
            code: "INSUFFICIENT_PERMISSIONS",
            requiredRoles: normalizedRoles,
            userRole: userRole,
          });
        }
      }
 
      // ========== Authorization successful ==========
      req.user = user;
      console.log(`✅ ${user.role || "User"} authorized | ID: ${user._id}`);
      return;
    } catch (err) {
      console.error("❌ Database error during token validation:", err);
      return reply.code(500).send({
        success: false,
        message: "Internal server error during authentication",
        code: "INTERNAL_ERROR",
      });
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};
 
module.exports = { validateToken };