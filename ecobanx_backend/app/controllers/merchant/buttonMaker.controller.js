const QRCode = require("qrcode");
const ButtonMaker = require("../../models/buttonMakerModel");
const { DepositAddress } = require("../../models/depositAddressModel");
const { DepositHistory } = require("../../models/depositHistoryModel");
const { Network } = require("../../models/Network");
const { Asset } = require("../../models/Asset");
const mongoose = require("mongoose");
const {
  createEvmWallet,
  createSolanaWallet,
  createTronWallet,
} = require("../../services/wallet/helpers/walletHelpers");
const { encrypt } = require("../../services/encryption/encryptData");
const { validateAddress } = require("../../utils/validateAddress");
const { storeAddress } = require("../../services/evmBalanceUpdate/evmBalanceUpdate");
const { createNotification } = require("../../services/notification/notificationService");

const createButtonMaker = async (req, reply) => {
    try {
        const data = req.validatedData || req.body || {};

        const merchantId =
            req.user?.merchantId ||
            req.user?._id ||
            req.user?.id;

        if (!merchantId) {
            return reply.code(401).send({
                success: false,
                result: null,
                message: "Merchant authentication required",
            });
        }

        if (data.buttonType && data.buttonType !== "Simple" && data.buttonType !== "Advanced") {
            return reply.code(400).send({
                success: false,
                result: null,
                message: "Button type must be Simple or Advanced",
            });
        }

        const buttonMaker = await ButtonMaker.create({
            merchantId,
            ...data,
            amountReceivedStatus: "pending",
        });

        const buttonObj = buttonMaker.toObject ? buttonMaker.toObject() : buttonMaker;

        return reply.code(201).send({
            success: true,
            result: {
                ...buttonObj,
                checkoutUrl: `/checkout/button?buttonId=${String(buttonMaker._id)}`,
            },
            message: "Button created successfully",
        });
    } catch (error) {
        req.log?.error(error);

        return reply.code(500).send({
            success: false,
            result: null,
            message: "Failed to create button",
            error: error.message,
        });
    }
};


const getAllButtonMakers = async (req, reply) => {
    try {
        const merchantId = req.user?.merchantId || req.user?._id || req.user?.id;

        if (!merchantId) {
            return reply.code(401).send({
                success: false,
                result: null,
                message: "Merchant authentication required",
            });
        }

        const {
            page = 1,
            limit = 10,
            search,
            buttonType,
            amountReceivedStatus,
        } = req.validatedData || req.query;

        const filter = {
            merchantId,
        };

        if (search) {
            filter.$or = [
                {
                    itemName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    itemNumber: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    invoice: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (buttonType) {
            filter.buttonType = buttonType;
        }

        if (amountReceivedStatus) {
            filter.amountReceivedStatus = amountReceivedStatus;
        }

        const options = {
            page: Number(page),
            limit: Number(limit),
            sort: {
                createdAt: -1,
            },
        };

        const result = await ButtonMaker.paginate(filter, options);

        return reply.code(200).send({
            success: true,
            result,
            message: "Button makers fetched successfully",
        });
    } catch (error) {
        req.log?.error(error);

        return reply.code(500).send({
            success: false,
            result: null,
            message: "Failed to fetch button makers",
            error: error.message,
        });
    }
};


const getButtonMakerById = async (req, reply) => {
    try {
        const merchantId = req.user?.merchantId;

        if (!merchantId) {
            return reply.code(401).send({
                success: false,
                result: null,
                message: "Merchant authentication required",
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return reply.code(400).send({
                success: false,
                result: null,
                message: "Invalid button maker ID",
            });
        }

        const buttonMaker = await ButtonMaker.findOne({
            _id: id,
            merchantId,
        }).lean();

        if (!buttonMaker) {
            return reply.code(404).send({
                success: false,
                result: null,
                message: "Button maker not found",
            });
        }

        return reply.code(200).send({
            success: true,
            result: buttonMaker,
            message: "Button maker fetched successfully",
        });
    } catch (error) {
        req.log?.error(error);

        return reply.code(500).send({
            success: false,
            result: null,
            message: "Failed to fetch button maker",
            error: error.message,
        });
    }
};

const getPublicButtonMakerById = async (req, reply) => {
    try {
        const { id } = req.params || {};

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return reply.code(400).send({
                success: false,
                result: null,
                message: "Invalid button ID",
            });
        }

        const buttonMaker = await ButtonMaker.findById(id)
            .select("merchantId itemName amountInCurrency fiatName requestAmount assetSymbol assetId network NetworkName itemDescription itemNumber invoice successUrl cancelUrl ipnUrl buttonType amountReceivedStatus receivedAmount createdAt")
            .lean();

        if (!buttonMaker) {
            return reply.code(404).send({
                success: false,
                result: null,
                message: "Button not found",
            });
        }

        return reply.code(200).send({
            success: true,
            result: buttonMaker,
            message: "Button fetched successfully",
        });
    } catch (error) {
        req.log?.error(error);

        return reply.code(500).send({
            success: false,
            result: null,
            message: "Failed to fetch button",
            error: error.message,
        });
    }
};

const updateButtonMaker = async (req, reply) => {    try {
        const merchantId =
            req.user?.merchantId ||
            req.user?._id ||
            req.user?.id;

        if (!merchantId) {
            return reply.code(401).send({
                success: false,
                result: null,
                message: "Merchant authentication required",
            });
        }

        const { buttonmakerId } = req.validatedData;

        if (!mongoose.Types.ObjectId.isValid(buttonmakerId)) {
            return reply.code(400).send({
                success: false,
                result: null,
                message: "Invalid button maker ID",
            });
        }

        const {
            network,
            firstname,
            lastname,
            email,
        } = req.validatedData || req.body || {};

        if (!network) {
            return reply.code(400).send({
                success: false,
                result: null,
                message: "network is required",
            });
        }

        // 1. Find existing button (first API saved data)
        const existingButton = await ButtonMaker.findOne({
            _id: buttonmakerId,
            merchantId,
        }).lean();

        if (!existingButton) {
            return reply.code(404).send({
                success: false,
                result: null,
                message: "Button maker not found",
            });
        }

        // 2. Resolve network doc (accept ObjectId or symbol like ETH/TRX/SOL)
        let networkDoc = null;
        const networkInput = String(network).trim();
        if (mongoose.Types.ObjectId.isValid(networkInput)) {
            networkDoc = await Network.findById(networkInput).lean();
        }
        if (!networkDoc) {
            networkDoc = await Network.findOne({
                networkSymbol: networkInput.toUpperCase(),
                status: true,
            }).lean();
        }
        if (!networkDoc) {
            networkDoc = await Network.findOne({
                networkName: new RegExp(`^${networkInput}$`, "i"),
                status: true,
            }).lean();
        }

        if (!networkDoc) {
            return reply.code(404).send({
                success: false,
                result: null,
                message: `Network ${networkInput} not found or inactive`,
            });
        }
        const networkType = String(networkDoc.type || "").trim().toUpperCase();
        let wallet = null;

        switch (networkType) {
            case "EVM":
                wallet = createEvmWallet();
                break;
            case "SOL":
            case "SOLANA":
                wallet = createSolanaWallet();
                break;
            case "TRX":
            case "TRON":
                wallet = await createTronWallet();
                break;
            default:
                return reply.code(400).send({
                    success: false,
                    result: null,
                    message: `Unsupported network type: ${networkDoc.type}`,
                });
        }

        if (!wallet || !wallet.address || !wallet.privateKey) {
            return reply.code(500).send({
                success: false,
                result: null,
                message: "Wallet generation failed",
            });
        }

        if (!validateAddress(wallet.address, networkDoc.type || networkDoc.networkSymbol)) {
            return reply.code(500).send({
                success: false,
                result: null,
                message: `Generated address is invalid for network ${networkDoc.networkSymbol}`,
            });
        }

        // 4. Save deposit address in DB
        const lastAddress = await DepositAddress.findOne({ merchantId })
            .sort({ addressIndex: -1 })
            .select("addressIndex")
            .lean();
        const addressIndex = lastAddress ? lastAddress.addressIndex + 1 : 1;

        const coin = String(existingButton.assetSymbol || "").toUpperCase().trim();
        if (!coin) {
            return reply.code(400).send({
                success: false,
                result: null,
                message: "Button has no assetSymbol, cannot create deposit address",
            });
        }

        const depositAddressDoc = await DepositAddress.create({
            merchantId,
            transactionId: null,
            coin,
            network: networkDoc.networkSymbol,
            networkId: networkDoc._id,
            isAddressLive: "true",
            address: wallet.address,
            encryptedPrivateKey: encrypt(wallet.privateKey),
            walletIndex: 0,
            addressIndex,
            paymentStatus: "pending",
        });

        if (/^0x[a-fA-F0-9]{40}$/.test(wallet.address)) {
            storeAddress({ address: wallet.address, add: true }).catch((err) =>
                console.error("buttonMaker storeAddress failed:", err?.message || err)
            );
        }

        let assetDecimal = 18;
        try {
            if (existingButton.assetId) {
                const assetDoc = await Asset.findById(existingButton.assetId)
                    .select("networks")
                    .lean();
                const entry = (assetDoc?.networks || []).find(
                    (item) => String(item.networkId) === String(networkDoc._id)
                );
                if (entry && Number.isInteger(entry.decimal)) {
                    assetDecimal = entry.decimal;
                }
            }
        } catch (assetErr) {
            console.error("buttonMaker asset decimal lookup failed:", assetErr?.message || assetErr);
        }

        const buttonType = existingButton.buttonType || null;

        const depositHistoryDoc = await DepositHistory.create({
            merchantId,
            userId: merchantId,
            address: wallet.address,
            amount: existingButton.requestAmount ?? 0,
            receivedAmount: 0,
            txId: `pending-${String(depositAddressDoc._id)}`.toLowerCase(),
            from: null,
            contractAddress: null,
            network: networkDoc.networkSymbol,
            symbol: coin,
            decimal: assetDecimal,
            status: "pending",
            type: "payIn",
            buttonType,
        });

        try {
            await createNotification({
                user_id: merchantId,
                admin_id: null,
                role: "user",
                title: "Button Payment Address Generated",
                description: `Your ${buttonType || ""} button payment address ${wallet.address} has been created for ${existingButton.requestAmount ?? 0} ${coin} on ${networkDoc.networkSymbol}.`.trim(),
                type: "payIn",
                category: "TRANSACTION",
                status: "info",
                isRead: false,
                seen: false,
                createdBy: null,
            });
        } catch (notificationError) {
            console.error("buttonMaker notification creation error:", notificationError?.message || notificationError);
        }

        // 5. Generate QR code for the address
        const qrcode = await QRCode.toDataURL(wallet.address, {
            errorCorrectionLevel: "M",
            width: 256,
            margin: 2,
        });

        // 6. Update button with network + buyer details
        const buttonMaker = await ButtonMaker.findOneAndUpdate(
            {
                _id: buttonmakerId,
                merchantId,
            },
            {
                $set: {
                    network: networkDoc._id,
                    NetworkName: networkDoc.networkName || networkDoc.networkSymbol,
                    ...(firstname !== undefined && { "BuyerDetails.firstname": firstname }),
                    ...(lastname !== undefined && { "BuyerDetails.lastname": lastname }),
                    ...(email !== undefined && { "BuyerDetails.email": email }),
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!buttonMaker) {
            return reply.code(404).send({
                success: false,
                result: null,
                message: "Button maker not found",
            });
        }

        return reply.code(200).send({
            success: true,
            result: {
                buttonMaker,
                address: depositAddressDoc.address,
                qrcode,
                coin: depositAddressDoc.coin,
                network: depositAddressDoc.network,
                depositAddressId: depositAddressDoc._id,
                depositHistoryId: depositHistoryDoc._id,
                buttonType,
            },
            message: "Button maker updated successfully",
        });

    } catch (error) {
        req.log?.error(error);

        return reply.code(500).send({
            success: false,
            result: null,
            message: "Failed to update button maker",
            error: error.message,
        });
    }
};

module.exports = {
    createButtonMaker,
    getAllButtonMakers,
    getButtonMakerById,
    getPublicButtonMakerById,
    updateButtonMaker,
};