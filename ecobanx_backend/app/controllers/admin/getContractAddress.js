const { symbol, boolean } = require("zod");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");

const getContractAddress = async (req, reply) => {
    try {
        const { networkSymbol } = req.body || {};

        if (!networkSymbol) {
            return reply.code(400).send({
                success: false,
                message: "networkSymbol is required",
            });
        }

        // Find network using network symbol
        const network = await Network.findOne({
            networkSymbol: networkSymbol.toUpperCase(),
            status: true,
        })
            .select("_id networkName networkSymbol")
            .lean();

        if (!network) {
            return reply.code(404).send({
                success: false,
                message: "Network not found",
            });
        }

        // Find assets for this network
        const assets = await Asset.find({
            "networks.networkId": network._id,
            status: true,
        })
            .select("assetSymbol decimal networks")
            .lean();

        if (!assets.length) {
            return reply.code(404).send({
                success: false,
                message: "No assets found for this network",
            });
        }

        const data = assets.map((asset) => {
            const networkConfig = asset.networks.find(
                (item) =>
                    item.networkId.toString() === network._id.toString()
            );
            if (networkConfig?.contractAddress != null) {
                return {
                    [networkConfig?.contractAddress]: {
                        symbol: asset.assetSymbol,
                        decimal: networkConfig?.decimal,
                    }
                };
            } 

            return null;


        }).filter(Boolean);

        return reply.code(200).send({
            success: true,
            message: "Contract addresses retrieved successfully",
            data,
        });

    } catch (error) {
        console.error("Get Contract Address Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Error in getContractAddress API",
        });
    }
};

module.exports = {
    getContractAddress,
};