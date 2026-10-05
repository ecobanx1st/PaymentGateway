const cron = require("node-cron");
const { DepositAddress } = require("../models/depositAddressModel");
const { Transaction } = require("../models/transactionModel");
const {
    notifyEvmTrackerStoreAddress,
    isEvmAddress,
} = require("../services/tracker/evmTrackerService");

let isRunning = false;

const updateExpiredPayments = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
        // const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
        const fiveHoursAgo = new Date(Date.now() -  60 * 1000);

        const expired = await DepositAddress.find({
            paymentStatus: "pending",
            createdAt: { $lte: fiveHoursAgo },
        })
            .select("address")
            .lean();

        if (expired.length === 0) {
            return { modifiedCount: 0, notified: 0 };
        }

        const result = await DepositAddress.updateMany(
            {
                paymentStatus: "pending",
                createdAt: { $lte: fiveHoursAgo },
            },
            {
                $set: {
                    paymentStatus: "expired",
                    updatedAt: new Date(),
                },
            }
        );
        const transactions = await Transaction.updateMany(
            {
                status: "pending",
                createdAt: { $lte: fiveHoursAgo },
            },
            {
                $set: {
                    status: "expired",
                    updatedAt: new Date(),
                },
            }
        );
        console.log("Tranasction Expired Count", transactions.length);
        const modifiedCount = result.modifiedCount ?? result.nModified ?? 0;

        if (modifiedCount > 0) {
            console.log(
                `Payment status cron: ${modifiedCount} payment(s) marked as failed`
            );
        }
        let notified = 0;
        for (const doc of expired) {
            if (!doc?.address || !isEvmAddress(doc.address)) continue;
            try {
                const res = await notifyEvmTrackerStoreAddress(doc.address, false);
                if (res?.success) notified++;
            } catch (err) {
                console.error(
                    `Payment status cron: tracker unwatch failed for ${doc.address}:`,
                    err?.message || err
                );
            }
        }

        if (notified > 0) {
            console.log(
                `Payment status cron: ${notified} address(es) unwatched on evm tracker (add=false)`
            );
        }

        return { modifiedCount, notified };
    } catch (error) {
        console.error("Payment status cron error:", error);
        return { modifiedCount: 0, notified: 0, error };
    } finally {
        isRunning = false;
    }
};

cron.schedule("*/5 * * * *", updateExpiredPayments);

module.exports = {
    updateExpiredPayments,
};
