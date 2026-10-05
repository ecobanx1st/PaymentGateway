const { getBalance } = require("../../services/wallet/balanceService");
const { getExchangeRate } = require("../../services/price/priceService");

const { Asset } = require("../../models/Asset");
const { DepositHistory } = require("../../models/depositHistoryModel");
const { Withdrawal } = require("../../models/withdrawalModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const USDT_EQUIVALENTS = new Set(["USDT", "USD"]);

const getBalanceInUsdt = async (assetSymbol, balance) => {
    if (USDT_EQUIVALENTS.has(assetSymbol)) {
        return balance;
    }

    const rate = await getExchangeRate(assetSymbol, "USD");

    if (!rate) return 0;

    return balance * rate;
};

const getDashboard = async (req, reply) => {
    try {
        const merchantId =
            req.user.merchantId || req.user._id || req.user.id;

        /* ----------------------- Total Wallet Balance ----------------------- */

        const assets = await Asset.find({ status: true }).lean();

        let totalUsdt = 0;

        for (const asset of assets) {
            try {
                const balance = await getBalance(merchantId, asset.assetSymbol);

                const usdt = await getBalanceInUsdt(
                    balance.assetSymbol,
                    Number(balance.totalBalance.total || 0)
                );

                totalUsdt += usdt;
            } catch (err) {
                // Ignore asset if wallet not found
            }
        }

        /* ------------------------- Total Deposits -------------------------- */

        const depositResult = await DepositHistory.aggregate([
            {
                $match: {
                    userId: req.user._id,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

        const totalDeposits =
            depositResult.length > 0 ? depositResult[0].total : 0;

        /* ------------------------ Total Withdrawals ------------------------ */

        const withdrawResult = await Withdrawal.aggregate([
            {
                $match: {
                    merchantId: merchantId,
                    status: "COMPLETED",
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

        const totalWithdrawals =
            withdrawResult.length > 0 ? withdrawResult[0].total : 0;

        /* -------------------------- Total APIs ----------------------------- */

        const totalApis = await MerchantApiKey.countDocuments({
            merchantId,
        });


        /* ---------------------- Recent Transactions ---------------------- */

        const { search = "", page = 1, limit = 10 } = req.query;

        const searchFilter = search
            ? {
                $or: [
                    { transactionId: { $regex: search, $options: "i" } },
                    { customerName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { assetSymbol: { $regex: search, $options: "i" } },
                ],
            }
            : {};

       const deposits = await DepositHistory.find({
    userId: req.user._id,
    ...(search
        ? {
            $or: [
                { txId: { $regex: search, $options: "i" } },
                { symbol: { $regex: search, $options: "i" } },
                { network: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } },
            ],
        }
        : {}),
})
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

        const withdrawals = await Withdrawal.find({
    merchantId,
    ...searchFilter,
})
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
        // console.log("🚀 ~ getDashboard ~ withdrawals:", withdrawals)


        const recentTransactions = [
            ...deposits.map((item) => ({
                type: "DEPOSIT",
                transactionId: item.txId,
                customerName: item.userId?.fullName || "",
                email: item.userId?.email || "",
                assetSymbol: item.symbol,
                network: item.network,
                address: item.address,
                amount: item.amount || 0,
                status: item.status || "COMPLETED",
                createdAt: item.createdAt,
            })),
            ...withdrawals.map((item) => ({
                type: "WITHDRAW",
                transactionId: item.transactionHash || item.txHash || null,
                customerName: item.userId?.fullName || "",
                email: item.userId?.email || "",
                assetSymbol: item.assetSymbol,
                amount: item.amount,
                status: item.status,
                createdAt: item.createdAt,
            })),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const totalTransactions = recentTransactions.length;

        const paginatedTransactions = recentTransactions.slice(
            (Number(page) - 1) * Number(limit),
            Number(page) * Number(limit)
        );

        return reply.code(200).send({
            success: true,
            message: "Dashboard fetched successfully",
            result: {
                totalBalance: Number(totalUsdt.toFixed(2)),
                totalDeposits,
                totalWithdrawals,
                totalApis,

                recentTransactions: paginatedTransactions,


                transactionPagination: {
                    total: totalTransactions,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalTransactions / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Dashboard Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getDashboard,
};