const { DepositHistory } = require("../../models/depositHistoryModel");
const { WalletAddress } = require("../../models/walletAddressModel");
const { Asset } = require("../../models/Asset");
const { Transaction } = require("../../models/transactionModel");
const { Wallets } = require("../../models/walletModel");
const { Users } = require("../../models/usersModel");

const {
    createNotification,
} = require("../../services/notification/notificationService");

const {
    getOrCreateWallet,
} = require("../../services/wallet/walletService");

const {
    sendIpnNotification,
} = require("../../services/ipn/ipnService");

const {
    emitPaymentConfirmed,
} = require("../../socket/paymentSocketHandler");

// =========================================================
// HELPERS
// =========================================================

const formatDepositAmount = (value) => {
    const amount = Number(value);

    return Number.isFinite(amount) && amount >= 0
        ? amount
        : String(value ?? "");
};

const toIdString = (value) => {
    if (!value) {
        return null;
    }

    return value.toString();
};

const escapeRegex = (value) => {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
};

const getSocketTxnIds = (
    checkoutTxnId,
    chainTxId
) => {
    return [
        ...new Set(
            [
                checkoutTxnId,
                chainTxId,
            ]
                .filter(Boolean)
                .map(String)
        ),
    ];
};

const emitDepositConfirmation = async ({
    checkoutTxnId,
    chainTxId,
    payload,
}) => {
    const roomTxnIds = getSocketTxnIds(
        checkoutTxnId,
        chainTxId
    );

    for (const roomTxnId of roomTxnIds) {
        const isChainTransactionRoom =
            checkoutTxnId &&
            chainTxId &&
            roomTxnId === String(chainTxId) &&
            roomTxnId !== String(checkoutTxnId);

        const roomPayload =
            isChainTransactionRoom
                ? {
                    ...payload,
                    txn_id: roomTxnId,
                    checkout_txn_id:
                        checkoutTxnId,
                }
                : payload;

        await emitPaymentConfirmed(
            roomTxnId,
            roomPayload
        );
    }

    return roomTxnIds;
};

const markCheckoutTransactionConfirmed = async ({
    checkoutTransaction,
    amount,
    txId,
}) => {
    if (!checkoutTransaction?._id) {
        return null;
    }

    const update = {
        status: "confirmed",
        receivedAmount: Number(amount),
        txnHash: txId,
    };

    await Transaction.updateOne(
        {
            _id: checkoutTransaction._id,
        },
        {
            $set: update,
        }
    );

    return update;
};

// =========================================================
// FIND WALLET ADDRESS
// =========================================================
//
// WalletAddress is the source of truth for user/merchant
// deposit addresses.
//
// First try exact match.
// Then try case-insensitive match for EVM addresses because
// EVM addresses may arrive with different checksum casing.
// =========================================================

const findWalletAddress = async (address) => {
    if (!address) {
        return null;
    }

    // -----------------------------------------
    // 1. Exact match
    // -----------------------------------------

    let walletAddress =
        await WalletAddress.findOne({
            address,
        }).lean();

    if (walletAddress) {
        return walletAddress;
    }

    // -----------------------------------------
    // 2. Case-insensitive fallback
    // -----------------------------------------

    walletAddress =
        await WalletAddress.findOne({
            address: {
                $regex: `^${escapeRegex(address)}$`,
                $options: "i",
            },
        }).lean();

    return walletAddress;
};

// =========================================================
// MAIN CONTROLLER
// =========================================================

const merchantUserDeposit = async (
    req,
    reply
) => {
    try {
        const {
            address,
            amount,
            coin,
            txId,
            from,
            contractAddress,
            network,
            apiKey,
        } =
            req.validatedData ||
            req.body ||
            {};

        console.log(
            "================================================="
        );

        console.log(
            "merchantUserDeposit | REQUEST:",
            {
                address,
                amount,
                coin,
                txId,
                from,
                contractAddress,
                network,
                apiKey: apiKey
                    ? "***provided***"
                    : undefined,
            }
        );

        // =====================================================
        // 1. VALIDATION
        // =====================================================

        if (!address) {
            return reply.code(400).send({
                success: false,
                message:
                    "Deposit address is required",
            });
        }

        if (!txId) {
            return reply.code(400).send({
                success: false,
                message:
                    "txId is required",
            });
        }

        if (!network) {
            return reply.code(400).send({
                success: false,
                message:
                    "Network is required",
            });
        }

        if (
            amount === undefined ||
            amount === null ||
            Number.isNaN(Number(amount)) ||
            Number(amount) < 0
        ) {
            return reply.code(400).send({
                success: false,
                message:
                    "Valid deposit amount is required",
            });
        }

        // =====================================================
        // 2. ASSET INFORMATION
        // =====================================================

        const tokenInfo =
            coin &&
                typeof coin === "object"
                ? Object.values(coin)[0] || {}
                : {};

        const assetSymbol =
            tokenInfo.symbol ||
            network;

        const symbol =
            tokenInfo.symbol ||
            assetSymbol ||
            null;

        const decimal =
            tokenInfo.decimal ?? null;

        const depositAmount =
            formatDepositAmount(amount);

        const depositAddress =
            address;

        console.log(
            "merchantUserDeposit | ASSET:",
            {
                assetSymbol,
                symbol,
                decimal,
                network,
                depositAmount,
                depositAddress,
            }
        );

        // =====================================================
        // 3. DUPLICATE TX CHECK (tx hashes are case-insensitive)
        // =====================================================

        const normalizedTxId = String(txId || "").trim().toLowerCase();

        const existingDeposit =
            await DepositHistory.findOne({
                txId: normalizedTxId,
            })
                .select(
                    "_id userId merchantId walletId txId address amount"
                )
                .lean();

        if (existingDeposit) {
            console.log(
                "merchantUserDeposit | DUPLICATE TX:",
                txId
            );

            return reply.code(409).send({
                success: false,
                message:
                    "A deposit with the same txId already exists",
                data: {
                    txId,
                    depositId:
                        existingDeposit._id,
                },
            });
        }

        // =====================================================
        // 4. FIND WALLET ADDRESS
        // =====================================================
        //
        // IMPORTANT:
        // User/merchant deposit addresses are stored in
        // walletaddresses collection.
        //
        // We DO NOT depend on depositaddresses here.
        // =====================================================

        const depositAddressRecord =
            await findWalletAddress(address);

        console.log(
            "merchantUserDeposit | WALLET ADDRESS LOOKUP:",
            {
                requestedAddress:
                    address,

                found:
                    Boolean(
                        depositAddressRecord
                    ),

                record:
                    depositAddressRecord
                        ? {
                            _id:
                                depositAddressRecord._id,

                            userId:
                                depositAddressRecord.userId,

                            merchantId:
                                depositAddressRecord.merchantId,

                            address:
                                depositAddressRecord.address,

                            networkType:
                                depositAddressRecord.networkType,

                            transactionId:
                                depositAddressRecord.transactionId,

                            ipnUrl:
                                depositAddressRecord.ipnUrl,
                        }
                        : null,
            }
        );

        if (!depositAddressRecord) {
            return reply.code(404).send({
                success: false,
                message:
                    "Deposit address not found",
                data: {
                    address,
                    collection:
                        "walletaddresses",
                },
            });
        }

        // =====================================================
        // 5. OPTIONAL CHECKOUT TRANSACTION
        // =====================================================
        //
        // transactionId is OPTIONAL.
        //
        // If walletaddresses has transactionId,
        // we load the checkout transaction.
        //
        // If it doesn't exist, deposit processing continues.
        // =====================================================

        let checkoutTransaction = null;

        if (
            depositAddressRecord.transactionId
        ) {
            checkoutTransaction =
                await Transaction.findById(
                    depositAddressRecord.transactionId
                )
                    .select(
                        "_id txnId amount amountInCurrency2 currency1 currency2 ipnUrl status"
                    )
                    .lean();

            console.log(
                "merchantUserDeposit | CHECKOUT TRANSACTION:",
                checkoutTransaction
                    ? {
                        id:
                            checkoutTransaction._id,

                        txnId:
                            checkoutTransaction.txnId,

                        status:
                            checkoutTransaction.status,
                    }
                    : "transactionId exists but transaction not found"
            );
        } else {
            console.log(
                "merchantUserDeposit | CHECKOUT TRANSACTION: NOT LINKED"
            );
        }

        const checkoutTxnId =
            checkoutTransaction?.txnId ||
            null;

        const socketTxnId =
            checkoutTxnId ||
            txId;

        const checkoutTransactionId =
            toIdString(
                checkoutTransaction?._id ||
                depositAddressRecord.transactionId
            );

        // =====================================================
        // 6. FIND ACTIVE ASSET
        // =====================================================

        const assetCheck =
            await Asset.findOne({
                assetSymbol,
                status: true,
            })
                .populate({
                    path:
                        "networks.networkId",

                    match: {
                        status: true,
                    },

                    select:
                        "networkSymbol networkName chainId status",
                })
                .lean();

        console.log(
            "merchantUserDeposit | ASSET LOOKUP:",
            {
                assetSymbol,
                found:
                    Boolean(assetCheck),
                assetId:
                    assetCheck?._id,
            }
        );

        if (!assetCheck) {
            return reply.code(404).send({
                success: false,
                message:
                    "Active asset not found",
                data: {
                    assetSymbol,
                },
            });
        }

        // =====================================================
        // 7. VALIDATE NETWORK
        // =====================================================

        const networkEntry =
            assetCheck.networks.find(
                (item) => {
                    const networkData =
                        item?.networkId;

                    if (!networkData) {
                        return false;
                    }

                    return (
                        networkData.networkSymbol ===
                        network ||
                        networkData.networkName ===
                        network
                    );
                }
            );

        console.log(
            "merchantUserDeposit | NETWORK LOOKUP:",
            {
                requestedNetwork:
                    network,

                found:
                    Boolean(
                        networkEntry
                    ),

                networkId:
                    networkEntry?.networkId?._id,

                networkName:
                    networkEntry?.networkId
                        ?.networkName,

                networkSymbol:
                    networkEntry?.networkId
                        ?.networkSymbol,
            }
        );

        if (
            !networkEntry ||
            !networkEntry.networkId
        ) {
            return reply.code(404).send({
                success: false,
                message:
                    `${network} network is not configured for ${assetSymbol}`,
            });
        }

        const networkId =
            networkEntry.networkId._id ||
            networkEntry.networkId.id;

        const depositAssetSymbol =
            assetCheck.assetSymbol ||
            assetSymbol ||
            "asset";

        const depositAssetName =
            assetCheck.assetName ||
            depositAssetSymbol;

        const depositNetworkName =
            networkEntry.networkId
                ?.networkName ||
            networkEntry.networkId
                ?.networkSymbol ||
            network;

        console.log(
            "merchantUserDeposit | VALIDATED ASSET/NETWORK:",
            {
                assetId:
                    assetCheck._id,

                assetSymbol:
                    depositAssetSymbol,

                assetName:
                    depositAssetName,

                networkId,

                networkName:
                    depositNetworkName,
            }
        );

        // =====================================================
        // 8. USER DEPOSIT FLOW
        // =====================================================

        if (
            depositAddressRecord.userId
        ) {
            const userId =
                depositAddressRecord.userId;

            console.log(
                "================================================="
            );

            console.log(
                "merchantUserDeposit | USER DEPOSIT FLOW"
            );

            console.log({
                userId,
                address:
                    depositAddressRecord.address,
                amount:
                    depositAmount,
                txId,
                network,
                asset:
                    depositAssetSymbol,
            });

            // -------------------------------------------------
            // 8.1 VERIFY USER
            // -------------------------------------------------

            const user =
                await Users.findById(
                    userId
                )
                    .select(
                        "_id fullName email"
                    )
                    .lean();

            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message:
                        "User not found",
                    data: {
                        userId,
                    },
                });
            }

            // -------------------------------------------------
            // 8.2 GET / CREATE USER WALLET
            // -------------------------------------------------

            const userWallet =
                await getOrCreateWallet(
                    userId,
                    assetCheck._id
                );

            if (!userWallet) {
                return reply.code(404).send({
                    success: false,
                    message:
                        "User wallet not found",
                    data: {
                        userId,
                        assetId:
                            assetCheck._id,
                    },
                });
            }

            console.log(
                "merchantUserDeposit | USER WALLET:",
                {
                    walletId:
                        userWallet._id,

                    userId,
                }
            );

            // -------------------------------------------------
            // 8.3 CREATE DEPOSIT HISTORY
            // -------------------------------------------------

            const depositRecord =
                await DepositHistory.create({
                    userId,

                    walletId:
                        userWallet._id,

                    address:
                        depositAddressRecord.address,

                    type:
                        "deposit",

                    amount:
                        Number(amount),

                    txId,

                    from:
                        from || null,

                    contractAddress:
                        contractAddress || null,

                    network,

                    symbol,

                    decimal,
                });

            console.log(
                "merchantUserDeposit | USER DEPOSIT HISTORY CREATED:",
                {
                    depositId:
                        depositRecord._id,

                    txId,
                }
            );

            // -------------------------------------------------
            // 8.4 CREDIT USER WALLET
            // -------------------------------------------------

            const updatedWallet =
                await Wallets.findByIdAndUpdate(
                    userWallet._id,
                    {
                        $inc: {
                            free:
                                Number(amount),

                            total:
                                Number(amount),
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!updatedWallet) {
                throw new Error(
                    "User wallet balance update failed"
                );
            }

            console.log(
                "merchantUserDeposit | USER WALLET CREDITED:",
                {
                    userId,

                    walletId:
                        updatedWallet._id,

                    free:
                        updatedWallet.free,

                    total:
                        updatedWallet.total,

                    amount:
                        depositAmount,

                    asset:
                        depositAssetSymbol,
                }
            );

            // -------------------------------------------------
            // 8.5 OPTIONAL CHECKOUT TRANSACTION UPDATE
            // -------------------------------------------------

            if (checkoutTransaction) {
                await markCheckoutTransactionConfirmed({
                    checkoutTransaction,
                    amount,
                    txId,
                });

                console.log(
                    "merchantUserDeposit | CHECKOUT TRANSACTION CONFIRMED:",
                    checkoutTransaction._id
                );
            }

            // -------------------------------------------------
            // 8.6 SOCKET
            // -------------------------------------------------

            const socketPayload = {
                type:
                    "payIn",

                status:
                    "confirmed",

                user_id:
                    userId.toString(),

                transaction_id:
                    depositRecord._id.toString(),

                checkout_transaction_id:
                    checkoutTransactionId,

                txn_id:
                    socketTxnId,

                txId,

                transaction_hash:
                    txId,

                amount:
                    depositAmount,

                received_amount:
                    depositAmount,

                currency:
                    depositAssetSymbol,

                currency1:
                    depositAssetSymbol,

                currency2:
                    depositAssetSymbol,

                network,

                address:
                    depositAddressRecord.address,

                from:
                    from || null,

                contract_address:
                    contractAddress || null,

                wallet_id:
                    userWallet._id.toString(),

                balance: {
                    free:
                        updatedWallet.free,

                    total:
                        updatedWallet.total,
                },

                timestamp:
                    new Date().toISOString(),
            };

            console.log(
                "merchantUserDeposit | USER SOCKET PAYLOAD:",
                socketPayload
            );

            const emittedTxnIds =
                await emitDepositConfirmation({
                    checkoutTxnId,

                    chainTxId:
                        txId,

                    payload:
                        socketPayload,
                });

            console.log(
                "merchantUserDeposit | USER SOCKET EMITTED:",
                emittedTxnIds
            );

            // -------------------------------------------------
            // 8.7 USER NOTIFICATION
            // -------------------------------------------------

            try {
                await createNotification({
                    user_id:
                        userId,

                    admin_id:
                        null,

                    role:
                        "user",

                    title:
                        "Deposit Received",

                    description:
                        `A deposit of ${depositAmount} ${depositAssetSymbol} was received on ${depositNetworkName}.`,

                    type:
                        "payIn",

                    category:
                        "TRANSACTION",

                    status:
                        "success",

                    isRead:
                        false,

                    seen:
                        false,

                    createdBy:
                        null,
                });
            } catch (
            notificationError
            ) {
                console.error(
                    "User deposit notification error:",
                    notificationError
                );
            }

            console.log(
                "merchantUserDeposit | USER DEPOSIT COMPLETED:",
                {
                    txId,

                    userId,

                    amount:
                        depositAmount,

                    asset:
                        depositAssetSymbol,
                }
            );

            // -------------------------------------------------
            // 8.8 USER RESPONSE
            // -------------------------------------------------

            return reply.code(201).send({
                success:
                    true,

                message:
                    "Deposit processed successfully",

                data: {
                    ...depositRecord.toObject(),

                    amount:
                        depositAmount,

                    asset: {
                        id:
                            assetCheck._id,

                        name:
                            depositAssetName,

                        symbol:
                            depositAssetSymbol,
                    },

                    network: {
                        id:
                            networkId,

                        name:
                            depositNetworkName,

                        symbol:
                            networkEntry
                                .networkId
                                ?.networkSymbol ||
                            network,

                        chainId:
                            networkEntry
                                .networkId
                                ?.chainId ||
                            null,
                    },

                    depositAddress:
                        depositAddressRecord.address,

                    userId,

                    walletId:
                        userWallet._id,

                    checkoutTransactionId,
                },
            });
        }

        // =====================================================
        // 9. MERCHANT DEPOSIT FLOW
        // =====================================================

        if (
            depositAddressRecord.merchantId
        ) {
            const merchantId =
                depositAddressRecord.merchantId;

            console.log(
                "================================================="
            );

            console.log(
                "merchantUserDeposit | MERCHANT DEPOSIT FLOW"
            );

            console.log({
                merchantId,

                address:
                    depositAddressRecord.address,

                amount:
                    depositAmount,

                txId,

                network,

                asset:
                    depositAssetSymbol,
            });

            // -------------------------------------------------
            // 9.1 VERIFY MERCHANT
            // -------------------------------------------------

            const merchant =
                await Users.findById(
                    merchantId
                )
                    .select(
                        "_id fullName email"
                    )
                    .lean();

            if (!merchant) {
                return reply.code(404).send({
                    success: false,
                    message:
                        "Merchant not found",
                    data: {
                        merchantId,
                    },
                });
            }

            // -------------------------------------------------
            // 9.2 GET / CREATE MERCHANT WALLET
            // -------------------------------------------------

            const merchantWallet =
                await getOrCreateWallet(
                    merchantId,
                    assetCheck._id
                );

            if (!merchantWallet) {
                return reply.code(404).send({
                    success: false,
                    message:
                        "Merchant wallet not found",
                    data: {
                        merchantId,
                        assetId:
                            assetCheck._id,
                    },
                });
            }

            // -------------------------------------------------
            // 9.3 CREATE DEPOSIT HISTORY
            // -------------------------------------------------

            const depositRecord =
                await DepositHistory.create({
                    merchantId,

                    // Your current schema requires userId.
                    userId:
                        merchantId,

                    walletId:
                        merchantWallet._id,

                    address:
                        depositAddressRecord.address,

                    amount:
                        Number(amount),

                    txId,

                    from:
                        from || null,

                    type:
                        "deposit",

                    contractAddress:
                        contractAddress || null,

                    network,

                    symbol,

                    decimal,
                });

            console.log(
                "merchantUserDeposit | MERCHANT DEPOSIT HISTORY CREATED:",
                {
                    depositId:
                        depositRecord._id,

                    txId,
                }
            );

            // -------------------------------------------------
            // 9.4 CREDIT MERCHANT WALLET
            // -------------------------------------------------

            const updatedWallet =
                await Wallets.findByIdAndUpdate(
                    merchantWallet._id,
                    {
                        $inc: {
                            free:
                                Number(amount),

                            total:
                                Number(amount),
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!updatedWallet) {
                throw new Error(
                    "Merchant wallet balance update failed"
                );
            }

            console.log(
                "merchantUserDeposit | MERCHANT WALLET CREDITED:",
                {
                    merchantId,

                    walletId:
                        updatedWallet._id,

                    free:
                        updatedWallet.free,

                    total:
                        updatedWallet.total,

                    amount:
                        depositAmount,

                    asset:
                        depositAssetSymbol,
                }
            );

            // -------------------------------------------------
            // 9.5 OPTIONAL CHECKOUT TRANSACTION UPDATE
            // -------------------------------------------------

            if (checkoutTransaction) {
                await markCheckoutTransactionConfirmed({
                    checkoutTransaction,
                    amount,
                    txId,
                });

                console.log(
                    "merchantUserDeposit | MERCHANT CHECKOUT TRANSACTION CONFIRMED:",
                    checkoutTransaction._id
                );
            }

            // -------------------------------------------------
            // 9.6 SOCKET
            // -------------------------------------------------

            const socketPayload = {
                type:
                    "payIn",

                status:
                    "confirmed",

                merchant_id:
                    merchantId.toString(),

                transaction_id:
                    depositRecord._id.toString(),

                checkout_transaction_id:
                    checkoutTransactionId,

                txn_id:
                    socketTxnId,

                txId,

                transaction_hash:
                    txId,

                amount:
                    depositAmount,

                received_amount:
                    depositAmount,

                currency:
                    depositAssetSymbol,

                currency1:
                    depositAssetSymbol,

                currency2:
                    depositAssetSymbol,

                network,

                address:
                    depositAddressRecord.address,

                from:
                    from || null,

                contract_address:
                    contractAddress || null,

                wallet_id:
                    merchantWallet._id.toString(),

                balance: {
                    free:
                        updatedWallet.free,

                    total:
                        updatedWallet.total,
                },

                timestamp:
                    new Date().toISOString(),
            };

            console.log(
                "merchantUserDeposit | MERCHANT SOCKET PAYLOAD:",
                socketPayload
            );

            const emittedTxnIds =
                await emitDepositConfirmation({
                    checkoutTxnId,

                    chainTxId:
                        txId,

                    payload:
                        socketPayload,
                });

            console.log(
                "merchantUserDeposit | MERCHANT SOCKET EMITTED:",
                emittedTxnIds
            );

            // -------------------------------------------------
            // 9.7 MERCHANT IPN
            // -------------------------------------------------

            const ipnUrl =
                depositAddressRecord.ipnUrl ||
                checkoutTransaction?.ipnUrl ||
                null;

            if (ipnUrl) {
                try {
                    await sendIpnNotification(
                        ipnUrl,
                        socketPayload
                    );

                    console.log(
                        "merchantUserDeposit | MERCHANT IPN SENT:",
                        ipnUrl
                    );
                } catch (
                ipnError
                ) {
                    console.error(
                        "Merchant deposit IPN error:",
                        ipnError
                    );
                }
            }

            // -------------------------------------------------
            // 9.8 MERCHANT NOTIFICATION
            // -------------------------------------------------

            try {
                await createNotification({
                    user_id:
                        merchantId,

                    admin_id:
                        null,

                    role:
                        "user",

                    title:
                        "Deposit Received",

                    description:
                        `A deposit of ${depositAmount} ${depositAssetSymbol} was received on ${depositNetworkName}.`,

                    type:
                        "payIn",

                    category:
                        "TRANSACTION",

                    status:
                        "success",

                    isRead:
                        false,

                    seen:
                        false,

                    createdBy:
                        null,
                });
            } catch (
            notificationError
            ) {
                console.error(
                    "Merchant deposit notification error:",
                    notificationError
                );
            }

            console.log(
                "merchantUserDeposit | MERCHANT DEPOSIT COMPLETED:",
                {
                    txId,

                    merchantId,

                    amount:
                        depositAmount,

                    asset:
                        depositAssetSymbol,
                }
            );

            // -------------------------------------------------
            // 9.9 MERCHANT RESPONSE
            // -------------------------------------------------

            return reply.code(201).send({
                success:
                    true,

                message:
                    "Deposit processed successfully",

                data: {
                    ...depositRecord.toObject(),

                    amount:
                        depositAmount,

                    asset: {
                        id:
                            assetCheck._id,

                        name:
                            depositAssetName,

                        symbol:
                            depositAssetSymbol,
                    },

                    network: {
                        id:
                            networkId,

                        name:
                            depositNetworkName,

                        symbol:
                            networkEntry
                                .networkId
                                ?.networkSymbol ||
                            network,

                        chainId:
                            networkEntry
                                .networkId
                                ?.chainId ||
                            null,
                    },

                    depositAddress:
                        depositAddressRecord.address,

                    merchantId,

                    walletId:
                        merchantWallet._id,

                    checkoutTransactionId,
                },
            });
        }

        // =====================================================
        // 10. ADDRESS HAS NO OWNER
        // =====================================================

        console.error(
            "merchantUserDeposit | ADDRESS HAS NO OWNER:",
            {
                address,
                depositAddressRecord,
            }
        );

        return reply.code(400).send({
            success: false,

            message:
                "Deposit address is not assigned to a user or merchant",

            data: {
                address:
                    depositAddressRecord.address,

                userId:
                    depositAddressRecord.userId ||
                    null,

                merchantId:
                    depositAddressRecord.merchantId ||
                    null,
            },
        });
    } catch (error) {
        console.error(
            "================================================="
        );

        console.error(
            "merchantUserDeposit | ERROR:",
            error
        );

        console.error(
            "merchantUserDeposit | ERROR STACK:",
            error?.stack
        );

        // =====================================================
        // MONGOOSE VALIDATION ERROR
        // =====================================================

        if (
            error.name ===
            "ValidationError"
        ) {
            return reply.code(400).send({
                success: false,

                message:
                    "Deposit validation failed",

                errors:
                    Object.values(
                        error.errors
                    ).map((err) => ({
                        field:
                            err.path,

                        message:
                            err.message,
                    })),
            });
        }

        // =====================================================
        // DUPLICATE KEY
        // =====================================================

        if (
            error.code === 11000
        ) {
            return reply.code(409).send({
                success: false,

                message:
                    "A deposit with this transaction already exists",

                error:
                    error.keyValue || null,
            });
        }

        // =====================================================
        // INTERNAL ERROR
        // =====================================================

        return reply.code(500).send({
            success: false,

            message:
                "Internal server error",

            error:
                process.env.NODE_ENV ===
                    "development"
                    ? error.message
                    : undefined,
        });
    }
};

module.exports = {
    merchantUserDeposit,
};