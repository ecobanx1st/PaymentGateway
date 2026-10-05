const { storeAddress } = require("../evmBalanceUpdate/evmBalanceUpdate");

const isEvmAddress = (address) => {
  return typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address.trim());
};

const notifyEvmTrackerStoreAddress = async (address, add = true) => {
  if (!address || typeof address !== "string" || !address.trim()) return { skipped: true };

  const cleanAddress = address.trim();

  if (!isEvmAddress(cleanAddress)) return { skipped: true, reason: "non-evm-address" };

  try {
    const result = await storeAddress({ address: cleanAddress, add: add === true });
    console.log("evmTrackerService: storeAddress ok:", cleanAddress, `add=${add === true}`, result);
    const failed = result && (result.status === false || result.success === false);
    if (failed) {
      return { success: false, error: result?.message || "storeAddress returned failure" };
    }
    return { success: true, data: result?.data };
  } catch (err) {
    console.error("evmTrackerService: storeAddress failed:", {
      address: cleanAddress,
      add,
      message: err.message,
    });
    return { success: false, error: err.message };
  }
};

module.exports = {
  isEvmAddress,
  notifyEvmTrackerStoreAddress,
};
