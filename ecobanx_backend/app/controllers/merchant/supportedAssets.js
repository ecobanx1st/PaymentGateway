// controllers/merchant/supportedAssets.js

const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");

const supportedAssets = async (req, reply) => {
    try {
        const assets = await Asset.find({
            status: true,
        })
            .populate({
                path: "networks.networkId",
                select:
                    "networkName networkSymbol chainId type status depositEnabled withdrawEnabled",
                match: {
                    status: true,
                },
            })
            .select("assetName assetSymbol depositStatus withdrawStatus networks")
            .lean();

        const result = [];

        for (const asset of assets) {
            const activeNetworks = (asset.networks || []).filter(
                (networkConfig) =>
                    networkConfig.networkId &&
                    networkConfig.networkId.status === true
            );

            if (activeNetworks.length === 0) {
                continue;
            }

            const networks = activeNetworks.map((networkConfig) => {
                const network = networkConfig.networkId;

                return {
                    networkName: network.networkName,
                    networkSymbol: network.networkSymbol,

                    depositStatus:
                        asset.depositStatus === true &&
                        network.depositEnabled === true,

                    withdrawStatus:
                        asset.withdrawStatus === true &&
                        network.withdrawEnabled === true,
                };
            });

            result.push({
                assetName: asset.assetName,
                assetSymbol: asset.assetSymbol,
                networks,
            });
        }

        return reply.code(200).send({
            success: true,
            message: "Supported assets fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("supportedAssets Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error",
            data: null,
        });
    }
};

module.exports = {
    supportedAssets,
};


const supportedNetworks = async (req, reply) => {
    try {
        const networks = await Network.find({
            status: true,
        })
            .select(
                "networkName networkSymbol chainId type depositEnabled withdrawEnabled"
            )
            .sort({ createdAt: -1 })
            .lean();

        const result = networks.map((network) => ({
            networkName: network.networkName,
            networkSymbol: network.networkSymbol,
            chainId: network.chainId,
            type: network.type,
            depositStatus: network.depositEnabled === true,
            withdrawStatus: network.withdrawEnabled === true,
        }));

        return reply.code(200).send({
            success: true,
            message: "Supported networks fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("supportedNetworks Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error",
            data: null,
        });
    }
};

module.exports = {
    supportedAssets,
    supportedNetworks,
};