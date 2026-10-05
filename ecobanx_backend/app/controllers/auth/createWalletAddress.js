const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { WalletAddress } = require("../../models/walletAddressModel");
const { Users } = require("../../models/usersModel");
const { KYC } = require("../../models/kycModel");
const { KYB } = require("../../models/kybModel");
const {
    createEvmWallet,
    createSolanaWallet,
    createTronWallet,
} = require("../../services/wallet/helpers/walletHelpers");
const { encrypt } = require("../../services/encryption/encryptData");
const { notifyEvmTrackerStoreAddress } = require("../../services/tracker/evmTrackerService");

const createWalletAddress = async (req, reply) => {
    try {
        const { assetSymbol, networkSymbol } = req.validatedData;
        const userId = req.user._id || req.user.id;

        // ============================================================
        // GET USER
        // ============================================================

        const user = await Users.findById(userId).lean();

        if (!user) {
            return reply.code(404).send({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.accountverifyStatus) {
            return reply.code(400).send({
                success: false,
                message: "User account is not verified.",
            });
        }

        // ============================================================
        // KYC / KYB VERIFICATION
        // ============================================================

        if (user.accountType === "individual") {
            const kyc = await KYC.findOne({
                userId,
            }).lean();

            // No KYC submitted
            if (!kyc) {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Please complete your KYC verification before creating a wallet address.",
                });
            }

            // KYC pending admin approval
            if (kyc.status === "Pending") {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Your KYC verification is pending admin approval. Please wait until your KYC is approved.",
                });
            }

            // KYC rejected
            if (kyc.status === "Rejected") {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Your KYC verification was rejected. Please resubmit your KYC for approval.",
                });
            }

            // Any status other than Approved
            if (kyc.status !== "Approved") {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Your KYC verification is not approved yet. Please wait for admin approval.",
                });
            }
        } else if (user.accountType === "business") {
            const kyb = await KYB.findOne({
                userId: userId,
            }).lean();

            // No KYB submitted
            if (!kyb) {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Please complete your KYB verification before creating a wallet address.",
                });
            }

            // KYB pending admin approval
            if (kyb.status === "Pending") {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Your KYB verification is pending admin approval. Please wait until your KYB is approved.",
                });
            }

            // KYB rejected
            if (kyb.status === "Rejected") {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Your KYB verification was rejected. Please resubmit your KYB for approval.",
                });
            }

            // Any status other than Approved
            if (kyb.status !== "Approved") {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Your KYB verification is not approved yet. Please wait for admin approval.",
                });
            }
        } else {
            return reply.code(400).send({
                success: false,
                message: "Invalid account type.",
            });
        }

        // ============================================================
        // NETWORK
        // ============================================================

        const network = await Network.findOne({
            networkSymbol,
        }).lean();

        if (!network) {
            return reply.code(404).send({
                success: false,
                message: "Network not found.",
            });
        }

        // ============================================================
        // ASSET
        // ============================================================

        const asset = await Asset.findOne({
            assetSymbol,
            "networks.networkId": network._id,
        }).lean();

        if (!asset) {
            return reply.code(404).send({
                success: false,
                message: "Asset not found on the selected network.",
            });
        }

        // ============================================================
        // CHECK EXISTING WALLET FOR SAME ASSET + NETWORK
        // ============================================================

        const existing = await WalletAddress.findOne({
            userId,
            networkId: network._id,
            assetId: asset._id,
        });

        if (existing) {
            return reply.code(200).send({
                success: true,
                message: "Wallet address already exists.",
                data: {
                    network: network.networkName,
                    asset: asset.assetSymbol,
                    address: existing.address,
                },
            });
        }

        // ============================================================
        // REUSE EXISTING WALLET FOR SAME NETWORK TYPE
        // ============================================================

        const reusableWallet = await WalletAddress.findOne({
            userId,
            networkType: network.type,
        })
            .select("+privateKey")
            .lean();

        if (reusableWallet) {
            return reply.code(200).send({
                success: true,
                message: "Wallet address fetched successfully.",
                data: {
                    network: network.networkName,
                    asset: asset.assetSymbol,
                    address: reusableWallet.address,
                },
            });
        }

        // ============================================================
        // CREATE WALLET
        // ============================================================

        let wallet;

        switch (network.type) {
            case "EVM":
                wallet = createEvmWallet();
                break;

            case "SOL":
                wallet = createSolanaWallet();
                break;

            case "TRX":
                wallet = await createTronWallet();
                break;

            default:
                return reply.code(400).send({
                    success: false,
                    message: `Unsupported network type: ${network.type}`,
                });
        }

        // ============================================================
        // SAVE WALLET
        // ============================================================

        await WalletAddress.create({
            userId,
            address: wallet.address,
            hexAddress: wallet.hexAddress || null,
            publicKey: wallet.publicKey || null,
            privateKey: encrypt(wallet.privateKey),
            networkType: network.type,
        });

        // Only when a NEW address is generated, send it to evm-track /storeAddress 
        notifyEvmTrackerStoreAddress(wallet.address, true).catch((trackerErr) => {
          console.error("createWalletAddress: evm tracker notify failed:", trackerErr?.message || trackerErr);
        });

        // ============================================================
        // RESPONSE
        // ============================================================

        return reply.code(200).send({
            success: true,
            message: "Wallet address created successfully.",
            data: {
                network: network.networkName,
                asset: asset.assetSymbol,
                address: wallet.address,
            },
        });
    } catch (error) {
        console.error("Create wallet address error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error.",
        });
    }
};

module.exports = createWalletAddress;