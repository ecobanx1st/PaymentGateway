const { DepositHistory } = require("../../models/depositHistoryModel");
const { Withdrawal } = require("../../models/withdrawalModel");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { KYC } = require("../../models/kycModel");
const { KYB } = require("../../models/kybModel");
const { Users } = require("../../models/usersModel");

const getAdminDashboard = async (req, reply) => {
    try {
        const [
            totalDeposits,
            totalWithdrawals,
            totalNetworks,
            totalAssets,

            approvedKyc,
            rejectedKyc,
            pendingKyc,

            approvedKyb,
            rejectedKyb,
            pendingKyb,

            individualUsers,
            businessUsers,

            recentDeposits,
        ] = await Promise.all([
            // Transaction Counts
            DepositHistory.countDocuments(),
            Withdrawal.countDocuments(),

            // Network & Asset Counts
            Network.countDocuments({ status: true }),
            Asset.countDocuments({ status: true }),

            // KYC Counts
            KYC.countDocuments({ status: "Approved" }),
            KYC.countDocuments({ status: "Rejected" }),
            KYC.countDocuments({
                status: { $in: ["Pending", "Submitted"] },
            }),

            // KYB Counts
            KYB.countDocuments({ status: "Approved" }),
            KYB.countDocuments({ status: "Rejected" }),
            KYB.countDocuments({ status: "Pending" }),

            // User Counts
            Users.countDocuments({
                role: "user",
                accountType: "individual",
            }),
            Users.countDocuments({
                role: "user",
                accountType: "business",
            }),

            // Recent Deposit/PayIn Transactions (Last 5)
            DepositHistory.find()
                .populate("userId", "fullName email")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);

        const recentTransactions = recentDeposits.map((item) => ({
            _id: item._id,
            type: item.type === "payIn" ? "PAYIN" : "DEPOSIT",
            transactionId: item.txId,
            customerName: item.userId?.fullName || "",
            email: item.userId?.email || "",
            asset: item.symbol,
            network: item.network,
            address: item.address,
            amount: item.amount,
            status: item.status || "COMPLETED",
            createdAt: item.createdAt,
        }));

        return reply.code(200).send({
            success: true,
            message: "Admin dashboard fetched successfully",
            result: {
                // Cards
                totalTransactions: totalDeposits + totalWithdrawals,
                totalDeposits,
                totalWithdrawals,
                totalNetworks,
                totalAssets,
                totalUsers: individualUsers + businessUsers,

                // KYC Stats
                kyc: {
                    approved: approvedKyc,
                    rejected: rejectedKyc,
                    pending: pendingKyc,
                },

                // KYB Stats
                kyb: {
                    approved: approvedKyb,
                    rejected: rejectedKyb,
                    pending: pendingKyb,
                },

                // User Stats
                users: {
                    individual: individualUsers,
                    business: businessUsers,
                },

                // Recent Transactions
                recentTransactions,
            },
        });
    } catch (error) {
        console.error("getAdminDashboard:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = {
    getAdminDashboard,
};