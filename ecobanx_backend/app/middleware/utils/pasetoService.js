const { V4 } = require("paseto");

/**
 * ========================================
 * PASETO Token Service (Production-Ready)
 * ========================================
 * 
 * Implements complete token lifecycle:
 * - Separate tokens for access and refresh
 * - Type discrimination in payload
 * - Separate verification functions
 * - Secure expiry handling
 */

const PRIVATE_KEY = process.env.PASETO_PRIVATE_KEY?.replace(/\\n/g, '\n');
const PUBLIC_KEY = process.env.PASETO_PUBLIC_KEY?.replace(/\\n/g, '\n');

if (!PRIVATE_KEY || !PUBLIC_KEY) {
    throw new Error("PASETO_PRIVATE_KEY and PASETO_PUBLIC_KEY environment variables are required");
}

/**
 * Generate both access and refresh tokens
 * Used during login flow
 * 
 * @param {object} payload - Token payload (id, unique_id, role, etc.)
 * @returns {Promise<{accessToken, refreshToken, refreshTokenExpiresAt}>}
 * 
 * Payload structure:
 * {
 *   id: user._id,
 *   unique_id: user.unique_id,
 *   role: user.role,
 *   type: "access"  // CRITICAL: Token type field
 * }
 */
const generateToken = async (payload) => {
    // Access token payload: include type field
    const accessTokenPayload = {
        ...payload,
        type: "access", // ← CRITICAL: Type discrimination
    };

    const accessToken = await V4.sign(accessTokenPayload, PRIVATE_KEY, {
           expiresIn: "2h",
    });

    // Refresh token payload: include type field
    const refreshTokenPayload = {
        id: payload.id,
        unique_id: payload.unique_id,
        type: "refresh", // ← CRITICAL: Type discrimination
    };

    const refreshToken = await V4.sign(refreshTokenPayload, PRIVATE_KEY, {
        expiresIn: "7d",
    });

    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
    };
};

/**
 * Generate only access token (when refreshing)
 * Used by refresh endpoint to issue new access token
 * 
 * @param {object} payload - Token payload
 * @returns {Promise<string>} - New access token
 */
const generateAccessToken = async (payload) => {
    // Add type field to access token payload
    const accessTokenPayload = {
        ...payload,
        type: "access", // ← CRITICAL: Type discrimination
    };

    const token = await V4.sign(accessTokenPayload, PRIVATE_KEY, {
        expiresIn: "2h",
    });

    return token;
};

/**
 * Generate API access token (short-lived, no refresh token)
 * Used by API key login flow
 * 
 * @param {object} payload - Token payload (merchantId, apiKeyId, publicKey)
 * @returns {Promise<{accessToken, expiresAt}>}
 */
const generateApiAccessToken = async (payload) => {
    const accessTokenPayload = {
        ...payload,
        type: "access",
    };

    const accessToken = await V4.sign(accessTokenPayload, PRIVATE_KEY, {
        expiresIn: "15m",
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return { accessToken, expiresAt };
};

/**
 * Generate API access + refresh tokens
 * Used by API key login flow with refresh support
 * 
 * @param {object} payload - Token payload (id, apiKeyId, publicKey)
 * @returns {Promise<{accessToken, refreshToken, expiresAt, refreshExpiresAt}>}
 */
const generateApiTokens = async (payload) => {
    const accessTokenPayload = {
        ...payload,
        type: "access",
    };

    const accessToken = await V4.sign(accessTokenPayload, PRIVATE_KEY, {
        expiresIn: "15m",
    });

    const refreshTokenPayload = {
        id: payload.id,
        apiKeyId: payload.apiKeyId,
        type: "refresh",
    };

    const refreshToken = await V4.sign(refreshTokenPayload, PRIVATE_KEY, {
        expiresIn: "7d",
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return { accessToken, refreshToken, expiresAt, refreshExpiresAt };
};

/**
 * Generate checkout token (short-lived, txn-scoped, no refresh)
 * Used by the public checkout flow — admin controls TTL later; static 5min for now
 *
 * @param {object} payload - Token payload (txnId)
 * @param {number} expiresInMs - Validity in ms (default 5 minutes)
 * @returns {Promise<{accessToken, expiresAt}>}
 */
const generateCheckoutToken = async (payload, expiresInMs = 5 * 60 * 1000) => {
    const accessTokenPayload = {
        ...payload,
        type: "access",
        scope: "checkout",
    };

    const accessToken = await V4.sign(accessTokenPayload, PRIVATE_KEY, {
        expiresIn: Math.floor(expiresInMs / 1000) + "s",
    });

    const expiresAt = new Date(Date.now() + expiresInMs);

    return { accessToken, expiresAt };
};

/**
 * Verify access token (used by middleware)
 * CRITICAL: Validates token type = "access"
 * 
 * @param {string} token - Access token to verify
 * @returns {Promise<object>} - Decoded payload
 * @throws {Error} - If token invalid, expired, or wrong type
 */
const verifyAccessToken = async (token) => {
    try {
        const payload = await V4.verify(token, PUBLIC_KEY);

        return payload;
    } catch (error) {
        // Re-throw with meaningful error
        if (error.message.includes("Invalid token type")) {
            throw error;
        }
        throw new Error(`Access token verification failed: ${error.message}`);
    }
};

/**
 * Verify refresh token (used by refresh endpoint)
 * CRITICAL: Validates token type = "refresh"
 * 
 * @param {string} token - Refresh token to verify
 * @returns {Promise<object>} - Decoded payload
 * @throws {Error} - If token invalid, expired, or wrong type
 */
const verifyRefreshToken = async (token) => {
    try {
        const payload = await V4.verify(token, PUBLIC_KEY);

        // SECURITY: Reject if type is not "refresh"
        if (payload.type !== "refresh") {
            throw new Error(
                `Invalid token type: expected "refresh", got "${payload.type}". ` +
                `Access tokens cannot be used as refresh tokens.`
            );
        }

        return payload;
    } catch (error) {
        // Re-throw with meaningful error
        if (error.message.includes("Invalid token type")) {
            throw error;
        }
        throw new Error(`Refresh token verification failed: ${error.message}`);
    }
};

/**
 * Legacy verify function (kept for backward compatibility)
 * WARNING: Do NOT use this for new code
 * Use verifyAccessToken() or verifyRefreshToken() instead
 */
const verifyToken = async (token) => {
    return await V4.verify(token, PUBLIC_KEY);
};

module.exports = {
    generateToken,
    generateAccessToken,
    generateApiAccessToken,
    generateApiTokens,
    generateCheckoutToken,
    verifyAccessToken,
    verifyRefreshToken,
    verifyToken, 
};

  


