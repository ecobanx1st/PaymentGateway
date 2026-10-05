const { Asset } = require("../../models/Asset");

const getMerchantAssets = async (req, reply) => {
    try {
        const {
            assetSymbol,
            networkId,
            depositStatus,
            withdrawStatus,
        } = req.validatedData;

        const filter = {
            status: true,
        };

        if (assetSymbol) {
            filter.assetSymbol = assetSymbol.toUpperCase();
        }

        if (networkId) {
            filter["networks.networkId"] = networkId;
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
                select:
                    "networkName networkSymbol chainId rpcUrl type depositEnabled withdrawEnabled withdrawFee explorerUrl",
            })
            .lean();

        const supportedAssets = assets.map((asset) => ({
            assetSymbol: asset.assetSymbol,
            assetName: asset.assetName,

            networks: (asset.networks || [])
                .filter((entry) => entry.networkId)
                .map(({ networkId: network }) => ({
                    networkName: network.networkName,
                    networkSymbol: network.networkSymbol,
                    chainId: network.chainId,
                    rpcUrl: network.rpcUrl,
                    depositEnabled: network.depositEnabled,
                    withdrawEnabled: network.withdrawEnabled,
                    withdrawFee: network.withdrawFee,
                    explorerUrl: network.explorerUrl,
                })),
        }));

        return reply.code(200).send({
            success: true,
            message: "Asset networks fetched successfully.",
            data: {
                supportedAssets,
            },
        });
    } catch (error) {
        console.error("getMerchantAssets Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error",
            data: null,
        });
    }
};

module.exports = { getMerchantAssets };