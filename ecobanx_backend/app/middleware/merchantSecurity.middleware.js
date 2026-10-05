const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { PassThrough } = require("stream");

const { decrypt } = require("../services/encryption/encryptData");
const { getRedisClient } = require("../../config/redis");

const MAX_TIMESTAMP_DRIFT = 300; // 5 minutes
const NONCE_TTL_SECONDS = 300;

const nonceStore = new Map();

//
// Request ID
//
const attachRequestId = (req, reply, done) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  reply.header("X-Request-ID", req.requestId);
  done();
};

//
// Raw Body Capture
//
const captureRawBody = (req, reply, payload, done) => {
  let body = "";

  const passThrough = new PassThrough();

  payload.on("data", (chunk) => {
    body += chunk;
    passThrough.write(chunk);
  });

  payload.on("end", () => {
    req._rawBodyString = body;
    passThrough.end();
    done(null, passThrough);
  });

  payload.on("error", done);
};

//
// Verify HMAC
//
const verifyHmacSignature = async (req, reply) => {
  if (!req.apiKey) {
    return reply.code(401).send({
      success: false,
      message: "Authentication required",
    });
  }

  const timestamp = req.headers["x-timestamp"];
  const nonce = req.headers["x-nonce"];
  const signature = req.headers["x-signature"];

  if (!timestamp || !nonce || !signature) {
    return reply.code(400).send({
      success: false,
      message: "Missing required headers: X-TIMESTAMP, X-NONCE, X-SIGNATURE",
    });
  }

  //
  // Timestamp Validation
  //
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);

  if (!ts || Math.abs(now - ts) > MAX_TIMESTAMP_DRIFT) {
    return reply.code(400).send({
      success: false,
      message: "Invalid or expired X-TIMESTAMP",
    });
  }

  //
  // Replay Protection
  //
  const nonceKey = `nonce:${req.apiKey._id}:${nonce}`;
  if (await checkNonce(nonceKey)) {
    return reply.code(409).send({
      success: false,
      message: "Replay attack detected: duplicate nonce",
    });
  }

  //
  // Build body string exactly like Postman
  //
  let bodyString = "";

  try {
    bodyString = JSON.stringify(req.body || {});
  } catch {
    bodyString = req._rawBodyString || "";
  }

  //
  // HMAC
  //
  const secretKey = decrypt(req.apiKey.secretKeyEncrypted);

  const dataToSign = `${timestamp}${nonce}${bodyString}`;

  const expectedSig = crypto
    .createHmac("sha256", secretKey)
    .update(dataToSign)
    .digest("hex");

  //
  // Verify Signature
  //
  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSig, "hex")
    )
  ) {
    return reply.code(401).send({
      success: false,
      message: "Invalid X-SIGNATURE",
    });
  }

  //
  // Store nonce AFTER successful verification
  //
  await storeNonce(nonceKey);
};

//
// Redis / Memory Nonce Store
//
async function checkNonce(key) {
  const redis = await getRedisClient();

  if (redis) {
    try {
      return !!(await redis.get(key));
    } catch {}
  }

  return nonceStore.has(key);
}

async function storeNonce(key) {
  const redis = await getRedisClient();

  if (redis) {
    try {
      await redis.set(key, "1", {
        EX: NONCE_TTL_SECONDS,
      });
      return;
    } catch {}
  }

  nonceStore.set(key, Date.now());

  setTimeout(() => {
    nonceStore.delete(key);
  }, NONCE_TTL_SECONDS * 1000);
}

module.exports = {
  attachRequestId,
  captureRawBody,
  verifyHmacSignature,
};