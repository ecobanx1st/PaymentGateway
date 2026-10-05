const { WalletAddress } = require("../../models/walletAddressModel");
const { DepositAddress } = require("../../models/depositAddressModel");

const getBothAddressData = async (networkType) => {
    const filter = {};

    if (networkType) {
        filter.networkType = networkType.toUpperCase();
    }

    const getAlladdress = await WalletAddress.find(filter)
        .select("address -_id")
        .lean()
        .sort({ createdAt: -1 });

    const depositFilter = {
        paymentStatus: "pending",
    };

    if (networkType) {
        depositFilter.network = networkType.toUpperCase();
    }

    const getAllDepositAddress = await DepositAddress.find(depositFilter)
        .select("address -_id")
        .lean()
        .sort({ createdAt: -1 });

    return [
        ...getAlladdress,
        ...getAllDepositAddress,
    ];
};

module.exports = {
    getBothAddressData,
};