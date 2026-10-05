const net = require("net");

const isValidCIDR = (cidr) => {
  const parts = cidr.split("/");
  if (parts.length !== 2) return false;
  const ip = parts[0];
  const mask = parseInt(parts[1], 10);
  if (!net.isIPv4(ip) && !net.isIPv6(ip)) return false;
  if (net.isIPv4(ip) && (mask < 0 || mask > 32)) return false;
  if (net.isIPv6(ip) && (mask < 0 || mask > 128)) return false;
  return true;
};

const isValidIP = (ip) => {
  return net.isIPv4(ip) || net.isIPv6(ip);
};

const isValidIPRestriction = (value) => {
  if (isValidIP(value)) return true;
  if (isValidCIDR(value)) return true;
  return false;
};

const ipToLong = (ip) => {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
};

const isIPInCIDR = (ip, cidr) => {
  if (!net.isIPv4(ip)) return false;
  const [rangeIp, maskBits] = cidr.split("/");
  if (!net.isIPv4(rangeIp)) return false;
  const mask = ~(2 ** (32 - parseInt(maskBits, 10)) - 1);
  return (ipToLong(ip) & mask) === (ipToLong(rangeIp) & mask);
};

module.exports = { isValidIP, isValidCIDR, isValidIPRestriction, isIPInCIDR };
