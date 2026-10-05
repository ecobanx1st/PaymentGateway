require("dotenv/config");
console.log("--process.env", process.env.REDIS_URL);
module.exports = {
  PORT: process.env.PORT,
  SECRET_KEY: {
    CRYPTO: process.env.SECRET_KEY_CRYPTO,
  },
  ETH: {
    URL: process.env.ETH_URL,
    KEY: process.env.ETH_KEY,
    CHAINID: process.env.CHAIN_ID
  },
  REDIS_URL: process.env.REDIS_URL,
  WEB3_PROVIDER: process.env.WEB3_PROVIDER,
  WEB3_CHAIN: process.env.WEB3_CHAIN,
  SERVICE: {
    WALLET: {
      ETH_ID: process.env.SERVICE_WALLET_ETH_ID,
      ETH_URL: process.env.SERVICE_WALLET_ETH_URL,
    },
  },
  ADMIN: {
    ADDRESS: process.env.ADMINADDRESS,
    PRIVATEKEY: process.env.ADMINPRIVATEKEY
  },
  ORIGINALURL: process.env.ORIGINALURL
};
