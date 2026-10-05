// import package (optional: only the encryptJs/decryptJs/String/Object helpers need it;
// `decrypt` below uses node:crypto. Guard so a missing package never breaks boot.)
let CryptoJS = null;
try {
  CryptoJS = require("crypto-js");
} catch (err) {
  console.log("eth-cron lib/cryptoJS: crypto-js not installed, CryptoJS-based helpers disabled");
}

// import config
const config = require("../config");

// import lib
const isEmpty = require("./isEmpty");

const crypto = require('crypto')

const secret = 'MyUltraSecurePassWordIWontForgetToChange'
const algorithm = 'aes-256-cbc'
// Key length is dependent on the algorithm. In this case for aes256, it is
// 32 bytes (256 bits).
const key = crypto.scryptSync(secret, 'salt', 32)
const iv = Buffer.alloc(16, 0) // Initialization crypto vector


const decrypt = (text = '') => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  try {
    let decrypted = decipher.update(text, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err) {
    return err
  }
}

const encryptJs = (encryptValue) => {
  try {
    encryptValue = JSON.stringify(encryptValue);
    let key = CryptoJS.enc.Latin1.parse("1234567812345678");
    let iv = CryptoJS.enc.Latin1.parse("1234567812345678");

    let encrypted = CryptoJS.AES.encrypt(encryptValue, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    });
    console.log(encrypted, "encrypted", encryptValue);
    return encrypted.toString();
  } catch (err) {
    return "";
  }
};

const decryptJs = (decryptValue) => {
  try {
    let key = CryptoJS.enc.Latin1.parse("1234567812345678");
    let iv = CryptoJS.enc.Latin1.parse("1234567812345678");
    let bytes = CryptoJS.AES.decrypt(decryptValue, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log(decryptedData, "decryptedDAta");
    return decryptedData;
  } catch (err) {
    return "";
  }
};

const replaceSpecialCharacter = (value, type) => {
  try {
    let textValue = value;
    if (!isEmpty(textValue)) {
      if (type == "encrypt") {
        // textValue = textValue.toString().replace('+', 'xMl3Jk').replace('/', 'Por21Ld').replace('=', 'Ml32');
        textValue = textValue
          .toString()
          .replace(/\+/g, "xMl3Jk")
          .replace(/\//g, "Por21Ld")
          .replace(/\=/g, "Ml32");
      } else if (type == "decrypt") {
        // textValue = textValue.replace('xMl3Jk', '+').replace('Por21Ld', '/').replace('Ml32', '=');
        textValue = textValue
          .replace(/\xMl3Jk/g, "+")
          .replace(/\Por21Ld/g, "/")
          .replace(/\Ml32/g, "=");
      }
    }
    return textValue;
  } catch (err) {
    return "";
  }
};

const encryptString = (encryptValue, isSpecialCharacters = false) => {
  try {
    encryptValue = encryptValue.toString();
    let ciphertext = CryptoJS.AES.encrypt(
      encryptValue,
      config.SECRET_KEY.CRYPTO
    ).toString();
    if (isSpecialCharacters) {
      return replaceSpecialCharacter(ciphertext, "encrypt");
    }
    return ciphertext;
  } catch (err) {
    return "";
  }
};

const decryptString = (decryptValue, isSpecialCharacters = false) => {
  try {
    if (isSpecialCharacters) {
      decryptValue = replaceSpecialCharacter(decryptValue, "decrypt");
    }

    let bytes = CryptoJS.AES.decrypt(decryptValue, config.SECRET_KEY.CRYPTO);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (err) {
    console.log("decryptString", err);
    return "";
  }
};
const encryptObject = (encryptValue) => {
  try {
    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(encryptValue),
      config.SECRET_KEY.CRYPTO
    ).toString();
    return ciphertext;
  } catch (err) {
    return "";
  }
};

const decryptObject = (decryptValue) => {
  try {
    let bytes = CryptoJS.AES.decrypt(decryptValue, config.SECRET_KEY.CRYPTO);
    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (err) {
    return "";
  }
};

module.exports = {
  decrypt,
  encryptJs,
  decryptJs,
  replaceSpecialCharacter,
  encryptString,
  decryptString,
  encryptObject,
  decryptObject,
};

