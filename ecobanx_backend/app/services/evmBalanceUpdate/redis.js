// ============================================================
// redis.js (eth-cron module helper, CommonJS)
// Hash helpers used by the block scanner / webhook-retry cron.
// Uses the backend redis client when available, otherwise falls
// back to an in-memory store so the crons never crash without redis.
// Same function names/signatures as evm-track/redis.js.
// ============================================================

let backendRedis = null;
try {
  backendRedis = require("../../../config/redis");
} catch (err) {
  console.log("eth-cron redis: backend redis config not available, using memory store");
}

// In-memory fallback: key -> Map(field -> value)
const memStore = new Map();

const memTable = (key) => {
  let table = memStore.get(key);
  if (!table) {
    table = new Map();
    memStore.set(key, table);
  }
  return table;
};

const getLiveClient = async () => {
  try {
    if (!backendRedis || typeof backendRedis.getRedisClient !== "function") return null;
    const client = await backendRedis.getRedisClient();
    if (client && (client.isReady || client.isOpen)) return client;
    return null;
  } catch (err) {
    return null;
  }
};

const redisConnection = async () => {
  try {
    if (!backendRedis || typeof backendRedis.connectRedis !== "function") return true;
    await backendRedis.connectRedis();
    return true;
  } catch (err) {
    return false;
  }
};

const hset = async (key, uniqueId, data) => {
  const client = await getLiveClient();
  if (client) {
    try {
      const result = await client.hSet(key, uniqueId.toString(), data);
      console.log("<-----result----->", result);
      return result;
    } catch (err) {
      console.log("eth-cron redis hset failed, using memory store:", err.message);
    }
  }
  memTable(key).set(uniqueId.toString(), data);
};

const hget = async (key, uniqueId) => {
  const client = await getLiveClient();
  if (client) {
    try {
      return await client.hGet(key, uniqueId.toString());
    } catch (err) {
      console.log("eth-cron redis hget failed, using memory store:", err.message);
    }
  }
  const table = memStore.get(key);
  return table ? table.get(uniqueId.toString()) : undefined;
};

const hdel = async (key, uniqueId) => {
  const client = await getLiveClient();
  if (client) {
    try {
      return await client.hDel(key, uniqueId.toString());
    } catch (err) {
      console.log("eth-cron redis hdel failed, using memory store:", err.message);
    }
  }
  const table = memStore.get(key);
  if (table) table.delete(uniqueId.toString());
};

const hgetall = async (key) => {
  const client = await getLiveClient();
  if (client) {
    try {
      return await client.hGetAll(key);
    } catch (err) {
      console.log("eth-cron redis hgetall failed, using memory store:", err.message);
    }
  }
  const table = memStore.get(key);
  const allvalues = {};
  if (table) {
    for (const [field, value] of table.entries()) allvalues[field] = value;
  }
  return allvalues;
};

const hdetall = async (key) => {
  const client = await getLiveClient();
  if (client) {
    try {
      return await client.del(key);
    } catch (err) {
      console.log("eth-cron redis hdetall failed, using memory store:", err.message);
    }
  }
  memStore.delete(key);
};

module.exports = {
  redisConnection,
  hset,
  hget,
  hdel,
  hgetall,
  hdetall,
};
