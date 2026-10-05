const { WalletAddress } = require('../../models/walletAddressModel')


const getAllDepositAddress = async (req, reply) => {
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

        console.log(getAlladdress);


        return reply.code(200).send({ success: true, message: "All Address Retrived", getAlladdress });


    } catch (error) {
        console.error("Block User Error:", error);
        return reply.code(500).send({ success: false, message: "error in getAllDepositAddress Api" });
    }
}


module.exports = {
    getAllDepositAddress,
};