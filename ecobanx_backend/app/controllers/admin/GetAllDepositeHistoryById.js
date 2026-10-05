const { DepositHistory } = require("../../models/depositHistoryModel");
const { Transaction } = require("../../models/transactionModel");

const getDepositHistoryById = async (req, reply) => {
    try {
        const { id } = req.params;

        const deposit = await DepositHistory.findOne({ _id: id })
            .select("-__v -merchantId -userId -walletId -_id -walletId")
            .populate("merchantId", "fullName email companyName accountType")
            .populate("userId", "fullName email companyName accountType")
            .populate("apiKeyId", "keyName")
            .lean();

        if (!deposit) {
            return reply.code(404).send({
                success: false,
                message: "Deposit not found",
            });
        }
        // Deposit txId can be an on-chain hash OR a payIn txnId (e.g. txn_...)
        // where Transaction.txnHash is still null. Fall back to txnId,
        // then to address + merchant scope (same strategy as user controller).
        const merchantScope =
            deposit.merchantId?._id ||
            deposit.merchantId ||
            deposit.userId?._id ||
            deposit.userId ||
            null;

        let transaction = null;
        if (deposit.txId) {
            transaction = await Transaction.findOne({
                txnHash: deposit.txId,
            })
                .select(" -destTag -confirmsNeeded -timeout -exchangeRate -marketRate -quoteCreatedAt -quoteExpiresAt -expiresAt -statusUrl")
                .populate("apiKeyId", "keyName")
                .lean();
        }
        if (!transaction && deposit.txId) {
            transaction = await Transaction.findOne({
                txnId: deposit.txId,
            })
                .select(" -destTag -confirmsNeeded -timeout -exchangeRate -marketRate -quoteCreatedAt -quoteExpiresAt -expiresAt -statusUrl")
                .populate("apiKeyId", "keyName")
                .lean();
        }
        if (!transaction && deposit.address) {
            const addressFilter = merchantScope
                ? { merchantId: merchantScope, address: deposit.address }
                : { address: deposit.address };
            transaction = await Transaction.findOne(addressFilter)
                .sort({ createdAt: -1 })
                .select("-buyerName -fullName -_id -merchantId  -destTag -confirmsNeeded -timeout -exchangeRate -marketRate -quoteCreatedAt -quoteExpiresAt -expiresAt -statusUrl")
                .populate("apiKeyId", "keyName")
                .lean();
        }

        if (transaction) {
            transaction.apiKeyName = transaction.apiKeyId?.keyName || null;
            delete transaction.apiKeyId;
        }

        deposit.apiKeyName = deposit.apiKeyId?.keyName || null;
        delete deposit.apiKeyId;

        deposit.transaction = transaction;

        return reply.code(200).send({
            success: true,
            data: deposit,
        });
    } catch (error) {
        console.error("getDepositHistoryById error:", error);
        return reply.code(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = getDepositHistoryById;