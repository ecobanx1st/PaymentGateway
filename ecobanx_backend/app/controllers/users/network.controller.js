const { Network } = require("../../models/Network");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");

const getUserNetworks = async (req, reply) => {
  try {
    const { search } = req.validatedData;

    const filter = { status: true };

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchRegex = new RegExp(safeSearch, "i");
      filter.$or = [
        { networkName: searchRegex },
        { networkSymbol: searchRegex },
        { chainId: searchRegex },
      ];
    }

    const networks = await Network.find(filter)
      .select("networkName networkSymbol chainId rpcUrl type")
      .sort({ networkName: 1 })
      .lean();

    return reply.code(200).send({
      success: true,
      message: "Networks fetched successfully.",
      data: networks,
    });
  } catch (error) {
    console.error("getUserNetworks Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { getUserNetworks };
