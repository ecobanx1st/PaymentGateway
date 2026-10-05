const { WalletAddress } = require('../../models/walletAddressModel')
const { DepositAddress } = require("../../models/depositAddressModel")


const getBothAddress = async (req, reply) => {
    try {
        const { networkType } = req.body || {};

        const filter = {};

        if (networkType) {
            filter.networkType = networkType.toUpperCase();
        }

        const getAlladdress = await WalletAddress.find(filter)
            .select("address -_id")
            .lean()
            .sort({ createdAt: -1 });

        const depositFilter = { paymentStatus: "pending" };
        if (networkType) {
            depositFilter.network = networkType.toUpperCase();
        }

        const getAllDepositAddress = await DepositAddress.find(depositFilter)
            .select("address -_id")
            .lean()
            .sort({ createdAt: -1 });
        const combinedAddresses = [...getAlladdress, ...getAllDepositAddress];
        console.log(getAlladdress);
        console.log(getAllDepositAddress);


        return reply.code(200).send({ success: true, message: "All Address Retrived", getAlladdress: combinedAddresses });


    } catch (error) {
        console.error("Block User Error:", error);
        return reply.code(500).send({ success: false, message: "error in getAllDepositAddress Api" });
    }
}


module.exports = {
    getBothAddress,
};