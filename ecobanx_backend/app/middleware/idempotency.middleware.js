const crypto = require("crypto");
const { getRedisClient } = require("../../config/redis");

const IDEMPOTENCY_TTL_SECONDS = 86400;
const cache = new Map();

function getKey(apiKeyId, idempotencyKey) {
  return `idemp:${apiKeyId}:${idempotencyKey}`;
}

async function getCached(key) {
  const redis = await getRedisClient();
  if (redis) {
    try {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return cache.get(key) || null;
    }
  }
  return cache.get(key) || null;
}

async function setCached(key, data) {
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(data), { EX: IDEMPOTENCY_TTL_SECONDS });
      return;
    } catch {
      // fall through
    }
  }
  cache.set(key, data);
  setTimeout(() => cache.delete(key), IDEMPOTENCY_TTL_SECONDS * 1000);
}

const idempotencyMiddleware = async (req, reply) => {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) return;

  const apiKeyId = req.apiKey?._id;
  if (!apiKeyId) return;

  const cacheKey = getKey(apiKeyId, idempotencyKey);

  const cached = await getCached(cacheKey);
  if (cached) {
    return reply.code(cached.statusCode).send(cached.body);
  }

  reply._idempotencyKey = cacheKey;
  reply._idempotencyData = null;
};

const idempotencyOnSend = (req, reply, payload, done) => {
  const cacheKey = reply._idempotencyKey;
  if (cacheKey && reply.statusCode < 500) {
    setCached(cacheKey, {
      statusCode: reply.statusCode,
      body: JSON.parse(payload),
    }).catch(() => {});
  }
  done(null, payload);
};

module.exports = { idempotencyMiddleware, idempotencyOnSend };
