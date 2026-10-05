const { createClient } = require("redis");

const isRedisEnabled = () => process.env.USE_REDIS === "true";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;

  const host = process.env.ip || "127.0.0.1";
  const port = process.env.port || "6379";
  return `redis://${host}:${port}`;
};

const redisClient = createClient({
  url: getRedisUrl(),
  socket: {
    reconnectStrategy: false,
  },
});

let connectPromise = null;

redisClient.on("error", (err) => {
  console.log("Redis Error:", err.message);
});

redisClient.on("ready", () => {
  console.log("Redis Connected");
});

redisClient.on("end", () => {
  console.log("Redis Connection Closed");
});

const connectRedis = async () => {
  if (!isRedisEnabled()) return null;
  if (redisClient.isReady) return redisClient;

  if (!connectPromise) {
    connectPromise = redisClient.connect().catch((err) => {
      connectPromise = null;
      console.log("Redis Connection Failed:", err.message);
      return null;
    });
  }

  return connectPromise;
};

const getRedisClient = async () => {
  if (!isRedisEnabled()) return null;
  if (redisClient.isReady) return redisClient;

  return connectRedis();
};

const disconnectRedis = async () => {
  if (!redisClient.isOpen) return;
  await redisClient.quit();
};

module.exports = {
  redisClient,
  connectRedis,
  getRedisClient,
  disconnectRedis,
};
