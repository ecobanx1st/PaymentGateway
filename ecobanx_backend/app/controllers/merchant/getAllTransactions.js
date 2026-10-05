const { DepositHistory } = require("../../models/depositHistoryModel");
const { Withdrawal } = require("../../models/withdrawalModel");
const { Users } = require("../../models/usersModel");

const getAllTransactions = async (req, reply) => {
    try {
        const merchantId = req.user.merchantId || req.user._id || req.user.id;

        const {
            page = 1,
            limit = 10,
            search = "",
            type = "all",
            status,
        } = req.body || {};

        const skip = (Number(page) - 1) * Number(limit);

        const regex = new RegExp(search, "i");

        // Search matching users
        const users = await Users.find({
            $or: [
                { fullName: regex },
                { email: regex },
            ],
        })
            .select("_id fullName email")
            .lean();

        const userIds = users.map((u) => u._id);

        const userMap = new Map(
            users.map((u) => [u._id.toString(), u])
        );

        const depositFilter = {
            userId: req.user._id,
            ...(search
                ? {
                    $or: [
                        { txId: regex },
                        { symbol: regex },
                        { network: regex },
                        { address: regex },
                        { userId: { $in: userIds } },
                    ],
                }
                : {}),
        };

        const withdrawalFilter = {
            merchantId,
            ...(status ? { status } : {}),
            ...(search
                ? {
                    $or: [
                        { transactionId: regex },
                        { assetSymbol: regex },
                        { network: regex },
                        { walletAddress: regex },
                        { userId: { $in: userIds } },
                    ],
                }
                : {}),
        };

        let deposits = [];
        let withdrawals = [];

        if (type === "all" || type === "deposit") {
            deposits = await DepositHistory.find(depositFilter).lean();
        }

        if (type === "all" || type === "withdraw") {
            withdrawals = await Withdrawal.find(withdrawalFilter).lean();
        }

        const transactions = [
            ...deposits.map((item) => {
                const user = userMap.get(item.userId?.toString());

                return {
                    _id: item._id,
                    type: "DEPOSIT",
                    transactionId: item.txId,
                    customerName: user?.fullName || "",
                    email: user?.email || "",
                    asset: item.assetSymbol,
                    network: item.network,
                    address: item.walletAddress,
                    amount: item.amount,
                    status: item.status,
                    createdAt: item.createdAt,
                };
            }),

            ...withdrawals.map((item) => {
                const user = userMap.get(item.userId?.toString());

                return {
                    _id: item._id,
                    type: "WITHDRAW",
                    transactionId: item.transactionId,
                    customerName: user?.fullName || "",
                    email: user?.email || "",
                    asset: item.assetSymbol,
                    network: item.network,
                    address: item.walletAddress,
                    amount: item.amount,
                    status: item.status,
                    createdAt: item.createdAt,
                };
            }),
        ].sort((a, b) => b.createdAt - a.createdAt);

        const total = transactions.length;

        const result = transactions.slice(skip, skip + Number(limit));

        return reply.send({
            success: true,
            message: "Transactions fetched successfully",
            result,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        console.error("getAllTransactions:", err);

        return reply.code(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getAllTransactions,
};