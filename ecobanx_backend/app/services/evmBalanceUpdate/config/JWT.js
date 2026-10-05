// import package
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// import lib
const config = require("./index");

// import lib
const isEmpty = require("../lib/isEmpty");

let ETHPrivate = fs.readFileSync(path.join(__dirname, "eth_private_key.pem"));
let ETHPublic = fs.readFileSync(path.join(__dirname, "eth_public_key.pem"));
console.log(ETHPublic, "ETHPublic")
const walletServiceJWT = (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    console.log(token, "tokentoken")
    if (isEmpty(token)) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    token = token.replace("Bearer ", "");
    let decoded = jwt.verify(token, ETHPublic);
    if (decoded.id == config.SERVICE.WALLET.ETH_ID) {
      return next();
    }
    return res.status(401).json({ status: false, message: "Unauthorized" });
  } catch (err) {
    console.log("-----err", err);
    return res.status(403).json({ status: false, message: "Forbidden Error" });
  }
};

const walletServSign = (payload) => {
  try {
    let token = jwt.sign(payload, ETHPrivate, {
      algorithm: "RS256",
      noTimestamp: true,
      expiresIn: "30000m",
    });
    return {
      status: true,
      token: `Bearer ${token}`,
    };
  } catch (err) {
    console.log('err: ', err);
    return {
      status: false,
    };
  }
};

module.exports = { walletServiceJWT, walletServSign };
