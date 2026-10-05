const { Network } = require("../../models/Network");
const { Asset } = require("../../models/Asset");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");

const createNetwork = async (req, reply) => {
  try {
    const {
      networkName,
      networkSymbol,
      chainId,
      rpcUrl,
      type,
      status,
      depositEnabled,
      withdrawEnabled,
      withdrawFee,
      explorerUrl,
    } = req.validatedData;

    const normalizedName = networkName.trim();
    const normalizedSymbol = networkSymbol.trim().toUpperCase();
    const normalizedChainId = (chainId || "").trim();
    const rpcUrlTrim = (rpcUrl || "").trim();
    const networkType = type !== "EVM" ? networkSymbol : "EVM";

    const duplicateConditions = [
      {
        networkName: {
          $regex: `^${escapeRegex(normalizedName)}$`,
          $options: "i",
        },
      },
      {
        networkSymbol: normalizedSymbol,
      },
      {
        rpcUrl: rpcUrlTrim,
      },
    ];

    // Check chainId uniqueness only for EVM networks
    if (type === "EVM" && normalizedChainId) {
      duplicateConditions.push({
        chainId: normalizedChainId,
      });
    }

    const existing = await Network.findOne({
      $or: duplicateConditions,
    }).lean();

    if (existing) {
      if (
        existing.networkName?.trim().toLowerCase() ===
        normalizedName.toLowerCase()
      ) {
        return reply.code(409).send({
          success: false,
          message: "Network name already exists",
          data: null,
        });
      }

      if (
        existing.networkSymbol?.trim().toUpperCase() === normalizedSymbol
      ) {
        return reply.code(409).send({
          success: false,
          message: "Network symbol already exists",
          data: null,
        });
      }

      if (
        type === "EVM" &&
        normalizedChainId &&
        existing.chainId === normalizedChainId
      ) {
        return reply.code(409).send({
          success: false,
          message: "Chain ID already exists",
          data: null,
        });
      }
      if (existing.rpcUrl?.trim() === rpcUrlTrim) {
        return reply.code(409).send({
          success: false,
          message: "RPC URL already exists",
          data: null,
        });
      }

      return reply.code(409).send({
        success: false,
        message: "Network already exists",
        data: null,
      });
    }

    const network = await Network.create({
      networkName: normalizedName,
      networkSymbol: normalizedSymbol,
      chainId: type === "EVM" ? normalizedChainId : null,
      rpcUrl: rpcUrl?.trim() || "",
      type: networkType.toUpperCase(),
      status,
      depositEnabled,
      withdrawEnabled,
      withdrawFee,
      explorerUrl: explorerUrl?.trim() || "",
    });

    return reply.code(201).send({
      success: true,
      message: "Network created successfully",
      data: network,
    });
  } catch (error) {
    console.error("createNetwork Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const updateNetwork = async (req, reply) => {
  try {
    const { networkId, networkName, networkSymbol, chainId, rpcUrl, type, status, depositEnabled, withdrawEnabled, withdrawFee, explorerUrl } =
      req.validatedData;

    const network = await Network.findById(networkId).lean();
    if (!network) {
      return reply
        .code(404)
        .send({ success: false, message: "Network not found", data: null });
    }

    const updateData = {};
    const duplicateConditions = [];
    const idFilter = { _id: { $ne: networkId } };

    if (networkName !== undefined) {
      const trimmed = networkName.trim();
      updateData.networkName = trimmed;
      duplicateConditions.push({
        networkName: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
      });
    }

    if (networkSymbol !== undefined) {
      const normalized = networkSymbol.trim().toUpperCase();
      updateData.networkSymbol = normalized;
      duplicateConditions.push({ networkSymbol: normalized });
    }
    if (rpcUrl !== undefined) {
      const rpcUrlTrim = rpcUrl.trim();
      updateData.rpcUrl = rpcUrlTrim;
      duplicateConditions.push({ rpcUrl: rpcUrlTrim });
    }

    const currentType = type ?? network.type;

    if (type !== undefined) {
      updateData.type = type;
    }

    if (chainId !== undefined) {
      const trimmed = chainId ? chainId.trim() : null;

      if (currentType === "EVM") {
        updateData.chainId = trimmed || null;

        if (trimmed) {
          duplicateConditions.push({ chainId: trimmed });
        }
      } else {
        updateData.chainId = null;
      }
    }
    const networkType = type !== "EVM" ? networkSymbol : "EVM";

    if (rpcUrl !== undefined) updateData.rpcUrl = rpcUrl.trim();
    if (status !== undefined) updateData.status = Boolean(status);
    if (type !== undefined) updateData.type = networkType.toUpperCase();
    if (depositEnabled !== undefined) updateData.depositEnabled = Boolean(depositEnabled);
    if (withdrawEnabled !== undefined) updateData.withdrawEnabled = Boolean(withdrawEnabled);
    if (withdrawFee !== undefined) updateData.withdrawFee = Number(withdrawFee);
    if (explorerUrl !== undefined) updateData.explorerUrl = explorerUrl.trim();

    if (duplicateConditions.length > 0) {
      const duplicate = await Network.findOne({
        ...idFilter,
        $or: duplicateConditions,
      }).lean();

      if (duplicate) {
        const proposedName = networkName !== undefined ? networkName.trim().toLowerCase() : "";
        const proposedSymbol = networkSymbol !== undefined ? networkSymbol.trim().toUpperCase() : "";
        const proposedChainId = chainId !== undefined ? (chainId ? chainId.trim() : "") : "";
        const proposedRpcURL = rpcUrl !== undefined ? rpcUrl.trim() : "";

        if (proposedName && duplicate.networkName?.toLowerCase() === proposedName) {
          return reply.code(409).send({ success: false, message: "Network name already exists", data: null });
        }
        if (proposedSymbol && duplicate.networkSymbol === proposedSymbol) {
          return reply.code(409).send({ success: false, message: "Network symbol already exists", data: null });
        }
        if (proposedChainId && duplicate.chainId === proposedChainId) {
          return reply.code(409).send({ success: false, message: "Chain ID already exists", data: null });
        } if (proposedRpcURL && duplicate.rpcUrl === proposedRpcURL) {
          return reply.code(409).send({ success: false, message: "RPC URL already exists", data: null });
        }
        return reply.code(409).send({ success: false, message: "Network already exists", data: null });
      }
    }

    const updatedNetwork = await Network.findByIdAndUpdate(networkId, updateData, {
      new: true,
      runValidators: true,
    });

    return reply
      .code(200)
      .send({ success: true, message: "Network updated successfully", data: updatedNetwork });
  } catch (error) {
    console.error("updateNetwork Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const deleteNetwork = async (req, reply) => {
  try {
    const { networkId } = req.validatedData;

    const network = await Network.findById(networkId).lean();
    if (!network) {
      return reply
        .code(404)
        .send({ success: false, message: "Network not found", data: null });
    }

    if (!network.status) {
      return reply
        .code(400)
        .send({ success: false, message: "Network is already inactive", data: null });
    }

    await Network.findByIdAndUpdate(networkId, { status: false });

    return reply
      .code(200)
      .send({ success: true, message: "Network soft deleted successfully", data: null });
  } catch (error) {
    console.error("deleteNetwork Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const getNetworkDetails = async (req, reply) => {
  try {
    const { networkId } = req.validatedData;

    const network = await Network.findById(networkId).lean();

    if (!network) {
      return reply
        .code(404)
        .send({ success: false, message: "Network not found", data: null });
    }

    if (!network.status) {
      return reply
        .code(404)
        .send({ success: false, message: "Network not found", data: null });
    }

    return reply
      .code(200)
      .send({ success: true, message: "Network fetched successfully", data: network });
  } catch (error) {
    console.error("getNetworkDetails Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const hardDeleteNetwork = async (req, reply) => {
  try {
    const { networkId } = req.validatedData;

    const network = await Network.findById(networkId).lean();
    if (!network) {
      return reply
        .code(404)
        .send({ success: false, message: "Network not found", data: null });
    }

    const assets = await Asset.find({ "networks.networkId": networkId })
      .select("assetName assetSymbol status")
      .lean();

    if (assets.length > 0) {
      return reply.code(409).send({
        success: false,
        message: "This network is being used by one or more assets.",
        result: {
          assetCount: assets.length,
          assets: assets.map((a) => ({
            _id: a._id,
            name: a.assetName,
            symbol: a.assetSymbol,
            status: a.status ? "active" : "inactive",
          })),
        },
      });
    }

    await Network.findByIdAndDelete(networkId);

    return reply
      .code(200)
      .send({ success: true, message: "Network deleted successfully.", data: null });
  } catch (error) {
    console.error("hardDeleteNetwork Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};



const getAllNetworks = async (req, reply) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      status = "all",
      type,
    } = req.validatedData;

    // -----------------------------
    // Pagination
    // -----------------------------
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    // -----------------------------
    // Build filter
    // -----------------------------
    const filter = {};

    // -----------------------------
    // Search
    // networkName
    // networkSymbol
    // chainId
    // -----------------------------
    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { networkName: searchRegex },
        { networkSymbol: searchRegex },
        { chainId: searchRegex },
      ];
    }

    // -----------------------------
    // Type filter
    // EVM / NON-EVM
    // -----------------------------
    if (type) {
      filter.type = type;
    }

    // -----------------------------
    // Status filter
    // all / true / false
    // -----------------------------
    if (status !== "all") {
      filter.status = status === "true";
    }

    // -----------------------------
    // Pagination options
    // -----------------------------
    const options = {
      page: pageNum,
      limit: limitNum,
      sort: {
        createdAt: -1,
      },
      lean: true,
    };

    const result = await Network.paginate(filter, options);

    // -----------------------------
    // Response
    // -----------------------------
    return reply.code(200).send({
      success: true,
      message: "Networks fetched successfully",
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      },
    });
  } catch (error) {
    console.error("getAllNetworks Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};


const toggleNetworkStatus = async (req, reply) => {
  try {
    const { networkId, forceChange } = req.validatedData;

    const network = await Network.findById(networkId);
    if (!network) {
      return reply
        .code(404)
        .send({ success: false, message: "Network not found", data: null });
    }

    if (network.status) {
      const assets = await Asset.find({ "networks.networkId": networkId })
        .select("assetName assetSymbol status")
        .lean();

      if (assets.length > 0 && !forceChange) {
        return reply.code(409).send({
          success: false,
          message: "This network is being used by one or more assets.",
          result: {
            assetCount: assets.length,
            assets: assets.map((a) => ({
              _id: a._id,
              name: a.assetName,
              symbol: a.assetSymbol,
              status: a.status ? "active" : "inactive",
            })),
          },
        });
      }

    }

    network.status = !network.status;
    await network.save();

    return reply
      .code(200)
      .send({
        success: true,
        message: `Network ${network.status ? "activated" : "deactivated"} successfully`,
        data: network,
      });
  } catch (error) {
    console.error("toggleNetworkStatus Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

module.exports = {
  createNetwork,
  updateNetwork,
  deleteNetwork,
  hardDeleteNetwork,
  toggleNetworkStatus,
  getNetworkDetails,
  getAllNetworks,
};
