const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");
const { deleteImageFile } = require("../../utils/imageUpload");
const { checkEvmAddress, checkTronAddress, checkSolanaAddress } = require("../../utils/checkContractAddress");



const createAsset = async (req, reply) => {
  try {
    const {
      assetName,
      assetSymbol,
      networks,
      depositStatus,
      withdrawStatus,
    } = req.validatedData;

    const assetImage = req.assetImage || null;

    const normalizedName = assetName.trim();
    const normalizedSymbol = assetSymbol.trim().toUpperCase();
    const uniqueNetworkIds = [...new Set(networks.map((n) => n.networkId))];

    const networksExist = await Network.find({
      _id: { $in: uniqueNetworkIds },
      status: true,
    }).lean();

    if (networksExist.length !== uniqueNetworkIds.length) {
      return reply.code(400).send({
        success: false,
        message: "selected networks are inactive or do not exist",
        data: null,
      });
    }

    for (const networkConfig of networks) {
      const network = networksExist.find(
        (n) => String(n._id) === String(networkConfig.networkId)
      );

      if (
        network &&
        networkConfig.contractAddress
      ) {
        let result;

        if (network.type === "EVM") {
          result = await checkEvmAddress(
            networkConfig.contractAddress,
            network.networkSymbol || network.type,
            network.rpcUrl
          );
        } else if (network.type === "TRON" || network.type === "TRX") {
          result = await checkTronAddress(networkConfig.contractAddress, network.rpcUrl);
        } else if (network.type === "SOL" || network.type === "SOLANA") {
          result = await checkSolanaAddress(networkConfig.contractAddress, network.rpcUrl);
        }

        if (result && !result.valid) {
          return reply
            .code(400)
            .send({ success: false, message: result.message || "Invalid contract address format for network", data: null });
        }
      }
    }

    const escapedName = escapeRegex(normalizedName);
    const existingAsset = await Asset.findOne({
      assetName: { $regex: `^${escapedName}$`, $options: "i" },
      assetSymbol: normalizedSymbol,
      "networks.networkId": { $in: uniqueNetworkIds },
    }).lean();

    if (existingAsset) {
      return reply
        .code(409)
        .send({
          success: false,
          message: "Asset already exists for selected network",
          data: null,
        });
    }

    const contractAddressFilter = networks
      .filter((n) => n.contractAddress)
      .map((n) => ({
        "networks.networkId": n.networkId,
        "networks.contractAddress": n.contractAddress,
      }));

    if (contractAddressFilter.length) {
      const duplicateContract = await Asset.findOne({
        $or: contractAddressFilter,
      }).lean();

      if (duplicateContract) {
        return reply
          .code(409)
          .send({
            success: false,
            message: "Contract address already exists for selected network",
            data: null,
          });
      }
    }

    const asset = await Asset.create({
      assetName: normalizedName,
      assetSymbol: normalizedSymbol,
      networks,
      depositStatus,
      withdrawStatus,
      image: assetImage,
    });

    return reply
      .code(201)
      .send({ success: true, message: "Asset created successfully", data: asset });
  } catch (error) {
    console.error("createAsset Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const updateAsset = async (req, reply) => {
  try {
    const {
      assetId,
      assetName,
      assetSymbol,
      networks,
      depositStatus,
      withdrawStatus,
      status,
    } = req.validatedData;

    const asset = await Asset.findById(assetId).lean();
    if (!asset) {
      if (req.assetImage) deleteImageFile(req.assetImage);
      return reply
        .code(404)
        .send({ success: false, message: "Asset not found", data: null });
    }

    // if (!asset.status) {
    //   if (req.assetImage) deleteImageFile(req.assetImage);
    //   return reply
    //     .code(400)
    //     .send({ success: false, message: "Inactive asset cannot be updated", data: null });
    // }

    const resolvedName =
      assetName !== undefined ? assetName.trim() : asset.assetName;
    const resolvedSymbol =
      assetSymbol !== undefined
        ? assetSymbol.trim().toUpperCase()
        : asset.assetSymbol;
    const resolvedNetworks =
      networks !== undefined ? networks : asset.networks || [];

    if (networks !== undefined) {
      const uniqueNetworkIds = [
        ...new Set(resolvedNetworks.map((n) => n.networkId)),
      ];

      const networksExist = await Network.find({
        _id: { $in: uniqueNetworkIds },
        status: true,
      }).lean();
      if (networksExist.length !== uniqueNetworkIds.length) {
        if (req.assetImage) deleteImageFile(req.assetImage);
        return reply
          .code(400)
          .send({ success: false, message: "One or more selected networks are inactive or do not exist", data: null });
      }

      for (const networkConfig of resolvedNetworks) {
        const network = networksExist.find(
          (n) => String(n._id) === String(networkConfig.networkId)
        );

        if (
          network &&
          networkConfig.contractAddress
        ) {
          let result;

          if (network.type === "EVM") {
            result = await checkEvmAddress(
              networkConfig.contractAddress,
              network.networkSymbol || network.type,
              network.rpcUrl
            );
          } else if (network.type === "TRON" || network.type === "TRX") {
            result = await checkTronAddress(networkConfig.contractAddress, network.rpcUrl);
          } else if (network.type === "SOL" || network.type === "SOLANA") {
            result = await checkSolanaAddress(networkConfig.contractAddress, network.rpcUrl);
          }

          if (result && !result.valid) {
            if (req.assetImage) deleteImageFile(req.assetImage);
            return reply
              .code(400)
              .send({ success: false, message: result.message || "Invalid contract address format for network", data: null });
          }
        }
      }
    }

    const escapedName = escapeRegex(resolvedName);
    const duplicate = await Asset.findOne({
      _id: { $ne: assetId },
      assetName: { $regex: `^${escapedName}$`, $options: "i" },
      assetSymbol: resolvedSymbol,
      "networks.networkId": { $in: resolvedNetworks.map((n) => n.networkId) },
    }).lean();

    if (duplicate) {
      if (req.assetImage) deleteImageFile(req.assetImage);
      return reply
        .code(409)
        .send({
          success: false,
          message: "Asset already exists for one or more of the selected networks",
          data: null,
        });
    }

    const contractAddressFilter = resolvedNetworks
      .filter((n) => n.contractAddress)
      .map((n) => ({
        "networks.networkId": n.networkId,
        "networks.contractAddress": n.contractAddress,
      }));

    if (contractAddressFilter.length) {
      const duplicateContract = await Asset.findOne({
        _id: { $ne: assetId },
        $or: contractAddressFilter,
      }).lean();

      if (duplicateContract) {
        if (req.assetImage) deleteImageFile(req.assetImage);
        return reply
          .code(409)
          .send({
            success: false,
            message: "Contract address already exists for one or more of the selected networks",
            data: null,
          });
      }
    }

    const oldImage = asset.image;
    const updateData = {};
    if (assetName !== undefined) updateData.assetName = assetName.trim();
    if (assetSymbol !== undefined) updateData.assetSymbol = assetSymbol.trim().toUpperCase();
    if (networks !== undefined) updateData.networks = resolvedNetworks;
    if (depositStatus !== undefined) updateData.depositStatus = depositStatus;
    if (withdrawStatus !== undefined) updateData.withdrawStatus = withdrawStatus;
    if (status !== undefined) updateData.status = status;
    if (req.assetImage) updateData.image = req.assetImage;

    const updatedAsset = await Asset.findByIdAndUpdate(assetId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("networks.networkId", "networkName networkSymbol chainId type")
      .lean();

    if (oldImage && req.assetImage) {
      deleteImageFile(oldImage);
    }

    return reply
      .code(200)
      .send({ success: true, message: "Asset updated successfully", data: updatedAsset });
  } catch (error) {
    if (req.assetImage) deleteImageFile(req.assetImage);
    console.error("updateAsset Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const deleteAsset = async (req, reply) => {
  try {
    const { assetId } = req.validatedData;

    const asset = await Asset.findById(assetId).lean();
    if (!asset) {
      return reply
        .code(404)
        .send({ success: false, message: "Asset not found", data: null });
    }

    if (!asset.status) {
      return reply
        .code(400)
        .send({ success: false, message: "Asset is already inactive", data: null });
    }

    await Asset.findByIdAndUpdate(assetId, { status: false });

    return reply
      .code(200)
      .send({ success: true, message: "Asset soft deleted successfully", data: null });
  } catch (error) {
    console.error("deleteAsset Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const getAssetDetails = async (req, reply) => {
  try {
    const { assetId } = req.validatedData;

    const asset = await Asset.findById(assetId)
      .populate("networks.networkId", "networkName networkSymbol chainId type")
      .lean();

    if (!asset) {
      return reply
        .code(404)
        .send({ success: false, message: "Asset not found", data: null });
    }

    if (!asset.status) {
      return reply
        .code(404)
        .send({ success: false, message: "Asset not found", data: null });
    }

    return reply
      .code(200)
      .send({ success: true, message: "Asset fetched successfully", data: asset });
  } catch (error) {
    console.error("getAssetDetails Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const getAllAssets = async (req, reply) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      networkId,
      status = "all",
      depositStatus = "all",
      withdrawStatus = "all",
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
    // assetName / assetSymbol
    // -----------------------------
    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { assetName: searchRegex },
        { assetSymbol: searchRegex },
      ];
    }

    // -----------------------------
    // Network filter
    // -----------------------------
    if (networkId) {
      filter["networks.networkId"] = networkId;
    }

    // -----------------------------
    // Asset status
    // all / true / false
    // -----------------------------
    if (status !== "all") {
      filter.status = status === "true";
    }

    // -----------------------------
    // Deposit status
    // all / true / false
    // -----------------------------
    if (depositStatus !== "all") {
      filter.depositStatus = depositStatus === "true";
    }

    // -----------------------------
    // Withdraw status
    // all / true / false
    // -----------------------------
    if (withdrawStatus !== "all") {
      filter.withdrawStatus = withdrawStatus === "true";
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
      populate: {
        path: "networks.networkId",
        select: "networkName networkSymbol chainId type",
      },
      lean: true,
    };

    const result = await Asset.paginate(filter, options);

    // -----------------------------
    // Response
    // -----------------------------
    return reply.code(200).send({
      success: true,
      message: "Assets fetched successfully",
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
    console.error("getAllAssets Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};


const hardDeleteAsset = async (req, reply) => {
  try {
    const { assetId } = req.validatedData;

    const asset = await Asset.findById(assetId).lean();
    if (!asset) {
      return reply
        .code(404)
        .send({ success: false, message: "Asset not found", data: null });
    }

    await Asset.findByIdAndDelete(assetId);

    return reply
      .code(200)
      .send({ success: true, message: "Asset deleted successfully.", data: null });
  } catch (error) {
    console.error("hardDeleteAsset Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

const toggleAssetStatus = async (req, reply) => {
  try {
    const { assetId } = req.validatedData;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return reply
        .code(404)
        .send({ success: false, message: "Asset not found", data: null });
    }

    asset.status = !asset.status;
    await asset.save();

    return reply
      .code(200)
      .send({
        success: true,
        message: `Asset ${asset.status ? "activated" : "deactivated"} successfully`,
        data: asset,
      });
  } catch (error) {
    console.error("toggleAssetStatus Error:", error);
    return reply
      .code(500)
      .send({ success: false, message: "Internal server error", data: null });
  }
};

module.exports = {
  createAsset,
  updateAsset,
  deleteAsset,
  hardDeleteAsset,
  toggleAssetStatus,
  getAssetDetails,
  getAllAssets,

};
