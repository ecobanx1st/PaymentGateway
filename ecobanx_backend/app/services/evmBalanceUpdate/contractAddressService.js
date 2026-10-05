const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");

const getContractAddressData = async (networkSymbol) => {
    if (!networkSymbol) {
        throw new Error("networkSymbol is required");
    }

    const network = await Network.findOne({
        networkSymbol: networkSymbol.toUpperCase(),
        status: true,
    })
        .select("_id networkName networkSymbol")
        .lean();

    if (!network) {
        throw new Error("Network not found");
    }

    const assets = await Asset.find({
        "networks.networkId": network._id,
        status: true,
    })
        .select("assetSymbol decimal networks")
        .lean();

    if (!assets.length) {
        throw new Error("No assets found for this network");
    }

    const data = assets
        .map((asset) => {
            const networkConfig = asset.networks.find(
                (item) =>
                    item.networkId.toString() === network._id.toString()
            );

            if (networkConfig?.contractAddress != null) {
                return {
                    [networkConfig.contractAddress]: {
                        symbol: asset.assetSymbol,
                        decimal: networkConfig.decimal,
                    },
                };
            }

            return null;
        })
        .filter(Boolean);

    return data;
};

module.exports = {
    getContractAddressData,
};
