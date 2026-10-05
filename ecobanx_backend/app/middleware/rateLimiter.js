const crypto = require("crypto");
const { verifyToken } = require("./utils/pasetoService");
const { getRedisClient: getConfiguredRedisClient } = require("../../config/redis");

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const WITHOUT_AUTH_LIMIT = parsePositiveInt(
  process.env.MAX_REQ_ALLOWED_WITHOUT_AUTH ||
  process.env.max_req_allowed_without_auth,
  5
);
const WITHOUT_AUTH_WINDOW_SECONDS =
  parsePositiveInt(
    process.env.RATE_LIMIT_DURATION_WITHOUT_AUTH ||
    process.env.RATE_LIMIT_duration_without_auth,
    1
  ) * 60;
const WITH_AUTH_LIMIT = parsePositiveInt(
  process.env.MAX_REQ_ALLOWED_WITH_AUTH ||
  process.env.max_req_allowed_with_auth,
  20
);
const WITH_AUTH_WINDOW_SECONDS =
  parsePositiveInt(
    process.env.RATE_LIMIT_DURATION_WITH_AUTH ||
    process.env.RATE_LIMIT_duration_with_auth,
    2
  ) * 60;
const DEFAULT_LIMIT = WITHOUT_AUTH_LIMIT;
const DEFAULT_WINDOW_SECONDS = WITHOUT_AUTH_WINDOW_SECONDS;
const LOGIN_LIMIT = parsePositiveInt(
  process.env.MAX_LOGIN_ATTEMPTS ||
  process.env.max_login_attempts ||

  process.env.max_attempts,
  5
);
const ACCOUNT_LOCK_WINDOW_SECONDS =
  parsePositiveInt(process.env.ACCOUNT_LOCK_MINUTES, 15) * 60;
const LOGIN_WINDOW_SECONDS = parsePositiveInt(
  process.env.LOGIN_RATE_LIMIT_SECONDS ||
  (process.env.ACCOUNT_LOCK_MINUTES
    ? String(ACCOUNT_LOCK_WINDOW_SECONDS)
    : process.env.login_max_min_allowed),
  ACCOUNT_LOCK_WINDOW_SECONDS
);
const RATE_LIMIT_PREFIX = "ratelimit";
const memoryStore = new Map();

const routeConfigs = {
  login: {
    tier: "auth",
    limit: LOGIN_LIMIT,
    windowSeconds: LOGIN_WINDOW_SECONDS,
    countFailedOnly: true,
  },
  withoutAuth: {
    tier: "anon",
    limit: WITHOUT_AUTH_LIMIT,
    windowSeconds: WITHOUT_AUTH_WINDOW_SECONDS,
    countFailedOnly: false,
  },
  withAuth: {
    tier: "user",
    limit: WITH_AUTH_LIMIT,
    windowSeconds: WITH_AUTH_WINDOW_SECONDS,
    countFailedOnly: false,
  },
};

const getPathname = (req) => {
  try {
    return new URL(req.url, process.env.baseurl_local)
      .pathname;
  } catch (err) {
    return (req.url || "/").split("?")[0];
  }
};

const STATIC_ASSET_PREFIXES = [
  "/uploads/",
  "/public/",
  "/img/",
  "/ecobanxApi/uploads/",
];

const isExemptRoute = (pathname) => {
  if (pathname === "/health") return true;

  if (STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return pathname
    .split("/")
    .filter(Boolean)
    .some((part) => part.toLowerCase().includes("webhook"));
};

const isLoginRoute = (pathname, method) => {
  if (method !== "POST") return false;

  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "");
  return normalizedPath === "/login" || normalizedPath.endsWith("/login");
};

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    req.ip ||
    req.socket?.remoteAddress ||
    req.raw?.socket?.remoteAddress ||
    "unknown"
  );
};

const getUserId = async (req) => {
  if (req.user?.id) return String(req.user.id);
  if (req.user?._id) return String(req.user._id);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const payload = await verifyToken(authHeader.split(" ")[1]);
    return payload?.id || payload?._id ? String(payload.id || payload._id) : null;
  } catch (err) {
    return null;
  }
};

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
};

const getTokenFingerprint = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const buildRateLimitKey = (tier, identifier) => {
  return `${RATE_LIMIT_PREFIX}:${tier}:${identifier}`;
};

const getRedisClient = async () => {
  if (process.env.USE_REDIS !== "true") return null;

  try {
    const redis = await getConfiguredRedisClient();
    if (!redis) return null;

    // node-redis exposes isReady/isOpen. Keep the checks defensive so Redis
    // outages fall back to memory instead of failing the request.
    if (redis.isReady === false || redis.isOpen === false) return null;

    return redis;
  } catch (err) {
    // Redis is unavailable — fall back to in-memory Map store silently.
    console.warn("[rateLimiter] Redis unavailable, falling back to memory store:", err?.message);
    return null;
  }
};

const getRedisTtl = async (redis, key, windowSeconds) => {
  const safeWindowSeconds = parsePositiveInt(
    windowSeconds,
    DEFAULT_WINDOW_SECONDS
  );
  const ttl = await redis.ttl(key);

  if (ttl > 0) return ttl;

  // A key without TTL should not happen, but set one so counters self-heal.
  if (ttl === -1) {
    await redis.expire(key, safeWindowSeconds);
    return safeWindowSeconds;
  }

  return 0;
};

const getRedisCounter = async (redis, key, windowSeconds) => {
  const safeWindowSeconds = parsePositiveInt(
    windowSeconds,
    DEFAULT_WINDOW_SECONDS
  );
  if (!redis) return null;

  try {
    const [countValue, ttl] = await Promise.all([
      redis.get(key),
      getRedisTtl(redis, key, safeWindowSeconds),
    ]);

    const count = Number(countValue || 0);
    const now = Date.now();
    const ttlSeconds = ttl > 0 ? ttl : safeWindowSeconds;

    return {
      count,
      ttl: ttlSeconds,
      resetAt: now + ttlSeconds * 1000,
    };
  } catch (err) {
    reqLogSafe(redis, "Redis rate limit read failed", err);
    return null;
  }
};

const incrementRedisCounter = async (redis, key, windowSeconds) => {
  const safeWindowSeconds = parsePositiveInt(
    windowSeconds,
    DEFAULT_WINDOW_SECONDS
  );
  if (!redis) return null;

  try {
    const count = await redis.incr(key);

    // Redis INCR creates the key without expiry, so the first increment owns
    // the fixed window and attaches its TTL.
    if (count === 1) {
      await redis.expire(key, safeWindowSeconds);
    }

    const ttl = await getRedisTtl(redis, key, safeWindowSeconds);

    return {
      count,
      ttl,
      resetAt: Date.now() + ttl * 1000,
    };
  } catch (err) {
    reqLogSafe(redis, "Redis rate limit increment failed", err);
    return null;
  }
};

const getMemoryCounter = (key, windowSeconds) => {
  const safeWindowSeconds = parsePositiveInt(
    windowSeconds,
    DEFAULT_WINDOW_SECONDS
  );
  const now = Date.now();
  const data = memoryStore.get(key);

  if (!data || data.resetAt <= now) {
    return {
      count: 0,
      ttl: safeWindowSeconds,
      resetAt: now + safeWindowSeconds * 1000,
    };
  }

  return {
    count: data.count,
    ttl: Math.max(0, Math.ceil((data.resetAt - now) / 1000)),
    resetAt: data.resetAt,
  };
};

const incrementMemoryCounter = (key, windowSeconds) => {
  const safeWindowSeconds = parsePositiveInt(
    windowSeconds,
    DEFAULT_WINDOW_SECONDS
  );
  const now = Date.now();
  let data = memoryStore.get(key);

  if (!data || data.resetAt <= now) {
    data = {
      count: 0,
      resetAt: now + safeWindowSeconds * 1000,
    };
  }

  data.count += 1;
  memoryStore.set(key, data);

  return {
    count: data.count,
    ttl: Math.max(0, Math.ceil((data.resetAt - now) / 1000)),
    resetAt: data.resetAt,
  };
};

const addRateLimitHeaders = (reply, limit, remaining, resetAt) => {
  const safeLimit = parsePositiveInt(limit, DEFAULT_LIMIT);
  const safeResetAt = Number.isFinite(resetAt)
    ? resetAt
    : Date.now() + DEFAULT_WINDOW_SECONDS * 1000;

  reply.header("X-RateLimit-Limit", safeLimit);
  reply.header("X-RateLimit-Remaining", Math.max(remaining, 0));
  reply.header("X-RateLimit-Reset", Math.ceil(safeResetAt / 1000));
};

const sendTooManyRequests = (reply, retryAfter, isAuthenticated) => {
  const safeRetryAfter = parsePositiveInt(retryAfter, DEFAULT_WINDOW_SECONDS);
  const secondsText =
    safeRetryAfter === 1 ? "1 second" : `${safeRetryAfter} seconds`;
  const code = isAuthenticated ? "RATE_LIMIT_AUTH" : "RATE_LIMIT_UNAUTH";

  reply.header("Retry-After", safeRetryAfter);

  return reply.code(429).send({
    success: false,
    code,
    message: `Too many requests. Please try again after ${secondsText}.`,
    retryAfter: safeRetryAfter,
  });
};

const reqLogSafe = (redis, message, err) => {
  const logger = redis?.server?.log || console;
  if (logger?.warn) {
    logger.warn({ err }, message);
  }
};

const shouldCountFailedLogin = (statusCode) => {
  return statusCode >= 400 && statusCode < 500 && statusCode !== 429;
};

const getCounter = async (req, key, windowSeconds) => {
  const redis = await getRedisClient();
  const redisCounter = await getRedisCounter(redis, key, windowSeconds);

  if (redisCounter) {
    return {
      ...redisCounter,
      storage: "redis",
      redis,
    };
  }

  return {
    ...getMemoryCounter(key, windowSeconds),
    storage: "memory",
    redis: null,
  };
};

const incrementCounter = async (req, key, windowSeconds, preferredRedis) => {
  const redis = preferredRedis || (await getRedisClient());
  const redisCounter = await incrementRedisCounter(redis, key, windowSeconds);

  if (redisCounter) {
    return {
      ...redisCounter,
      storage: "redis",
      redis,
    };
  }

  return {
    ...incrementMemoryCounter(key, windowSeconds),
    storage: "memory",
    redis: null,
  };
};

const recordLoginFailure = async (req, reply) => {
  const context = req.rateLimitContext;
  if (!context || !shouldCountFailedLogin(reply.statusCode)) return;

  const counter = await incrementCounter(
    req,
    context.key,
    context.windowSeconds,
    context.redis
  );

  const remaining = parsePositiveInt(context.limit, LOGIN_LIMIT) - counter.count;
  addRateLimitHeaders(reply, context.limit, remaining, counter.resetAt);
};

const rateLimiter = (options = {}) => {
  return async (req, reply) => {


    if (options.merchantApi) {
      // Single limiter, two cases:
      //  - WITH token (req.user set by verifyMerchantToken): strict
      //    per-API-key bucket, so one spamming key is throttled alone.
      //  - WITHOUT token: per-publickey bucket on the token endpoint,
      //    otherwise per-IP bucket with generous limits.
      // Never sends 401 here — auth errors stay with verifyMerchantToken.
      const apiKeyId = req.user?.apiKeyId;
      const clientIp = getClientIp(req);

      const strictLimit = parsePositiveInt(options.limit, 5);
      const strictWindow = parsePositiveInt(options.windowSeconds, 2);
      const openLimit = parsePositiveInt(options.noAuthLimit, 60);
      const openWindow = parsePositiveInt(options.noAuthWindowSeconds, 60);

      let identifier;
      let limit = strictLimit;
      let windowSeconds = strictWindow;
      let isAuthenticated = true;

      if (apiKeyId) {
        identifier = `apiKey:${String(apiKeyId)}`;
      } else {
        isAuthenticated = false;
        const src = req.validatedData || req.body || {};
        const rawKey = src.publickey || src.publicKey || src.txn_id || src.txnId || null;
        if (rawKey) {
          const digest = crypto
            .createHash("sha256")
            .update(String(rawKey))
            .digest("hex")
            .slice(0, 32);
          identifier = `tokenpub:${digest}`;
        } else {
          identifier = `ip:${clientIp}`;
          limit = openLimit;
          windowSeconds = openWindow;
        }
      }

      const key = buildRateLimitKey(
        "merchant",
        identifier
      );

      const counter = await incrementCounter(
        req,
        key,
        windowSeconds
      );

      const remaining = limit - counter.count;

      addRateLimitHeaders(
        reply,
        limit,
        remaining,
        counter.resetAt
      );

      if (counter.count > limit) {
        return sendTooManyRequests(
          reply,
          counter.ttl,
          isAuthenticated
        );
      }

      return;
    }





    const pathname = getPathname(req);

    if (isExemptRoute(pathname)) {
      return;
    }


    if (isLoginRoute(pathname, req.method)) {
      return;
    }

    const bearerToken = getBearerToken(req);
    const baseConfig = bearerToken ? routeConfigs.withAuth : routeConfigs.withoutAuth;
    const config = {
      ...baseConfig,
      limit: parsePositiveInt(options.limit || baseConfig.limit, baseConfig.limit),
      windowSeconds: parsePositiveInt(
        options.windowSeconds || baseConfig.windowSeconds,
        baseConfig.windowSeconds
      ),
    };

    let identifier;
    if (bearerToken) {
      const userId = await getUserId(req);
      identifier = userId
        ? `uid:${userId}`
        : `token:${getTokenFingerprint(bearerToken)}`;
    } else {
      identifier = `ip:${getClientIp(req)}`;
    }
    const key = buildRateLimitKey(config.tier, identifier);

    // Login brute-force protection counts failed login responses only. The
    // preHandler checks the current window, and the onSend hook records failures.
    if (config.countFailedOnly) {
      const counter = await getCounter(req, key, config.windowSeconds);
      const retryAfter = counter.ttl;

      addRateLimitHeaders(
        reply,
        config.limit,
        config.limit - counter.count,
        counter.resetAt
      );

      req.rateLimitContext = {
        key,
        limit: config.limit,
        windowSeconds: config.windowSeconds,
        redis: counter.redis,
      };

      if (counter.count >= config.limit) {
        return sendTooManyRequests(reply, retryAfter, !!bearerToken);
      }

      return;
    }

    const counter = await incrementCounter(req, key, config.windowSeconds);
    const remaining = config.limit - counter.count;
    const retryAfter = counter.ttl;

    addRateLimitHeaders(reply, config.limit, remaining, counter.resetAt);

    if (counter.count > config.limit) {
      return sendTooManyRequests(reply, retryAfter, !!bearerToken);
    }
  };
};

rateLimiter.onSend = async (req, reply, payload) => {
  await recordLoginFailure(req, reply);
  return payload;
};

rateLimiter.getRedisClient = getRedisClient;
rateLimiter.incrementRedisCounter = incrementRedisCounter;
rateLimiter.incrementMemoryCounter = incrementMemoryCounter;
rateLimiter.buildRateLimitKey = buildRateLimitKey;

module.exports = rateLimiter;
