const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");
const { getBalance } = require("../../services/wallet/balanceService");

const getUserAssets = async (req, reply) => {
  try {
    const { search, networkId, depositStatus, withdrawStatus } =
      req.validatedData;

    const activeNetworks = await Network.find({ status: true })
      .select("_id")
      .lean();
    const activeNetworkIds = activeNetworks.map((n) => n._id);

    if (activeNetworkIds.length === 0) {
      return reply.code(200).send({
        success: true,
        message: "Assets fetched successfully.",
        data: [],
      });
    }

    const filter = { status: true };

    if (networkId) {
      if (!activeNetworkIds.some((id) => id.toString() === networkId)) {
        return reply.code(200).send({
          success: true,
          message: "Assets fetched successfully.",
          data: [],
        });
      }
      filter["networks.networkId"] = networkId;
    } else {
      filter["networks.networkId"] = { $in: activeNetworkIds };
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchRegex = new RegExp(safeSearch, "i");
      filter.$or = [
        { assetName: searchRegex },
        { assetSymbol: searchRegex },
      ];
    }

    if (depositStatus !== undefined && depositStatus !== "") {
      filter.depositStatus = depositStatus === "true";
    }

    if (withdrawStatus !== undefined && withdrawStatus !== "") {
      filter.withdrawStatus = withdrawStatus === "true";
    }

    const assets = await Asset.find(filter)
      .populate({
        path: "networks.networkId",
        match: { status: true },
        select: "networkName networkSymbol chainId type depositEnabled withdrawEnabled withdrawFee ",
      })
      .sort({ assetName: 1 })
      .lean();

    const userId = req.user._id || req.user.id;

    for (const asset of assets) {
      try {
        const balance = await getBalance(userId, asset.assetSymbol);
        asset.balance = balance.totalBalance.total;
        asset.free = balance.totalBalance.free;
        asset.locked = balance.totalBalance.locked;
      } catch {
        asset.balance = 0;
        asset.free = 0;
        asset.locked = 0;
      }
    }

    return reply.code(200).send({
      success: true,
      message: "Assets fetched successfully.",
      data: assets,
    });
  } catch (error) {
    console.error("getUserAssets Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { getUserAssets };
