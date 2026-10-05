const { Users } = require("../../models/usersModel");
const { KYC } = require("../../models/kycModel");
const { KYB } = require("../../models/kybModel");
const { isAtLeast18YearsOld } = require("../../utils/ageValidation");

const profile = async (req, reply) => {
    try {
        // Get authenticated user ID
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        // Get user profile
        const user = await Users.findById(userId)
            .select(
                "-_id fullName companyName accountType twoFactorEnabled email phone phoneCountryCode dob gender country background_picture verifyStatus profile_picture userUniqueId "
            )
            .lean();

        if (!user) {
            return reply.code(404).send({
                success: false,
                message: "User not found",
            });
        }

        const accountType = user.accountType;

        if (!["individual", "business"].includes(accountType)) {
            return reply.code(400).send({
                success: false,
                message: "Invalid account type",
            });
        }

        // Optional DOB validation
        if (req.body?.dob && !isAtLeast18YearsOld(req.body.dob)) {
            return reply.code(400).send({
                success: false,
                message: "You must be at least 18 years old.",
            });
        }

        // =====================================================
        // INDIVIDUAL → CHECK KYC
        // =====================================================
        if (accountType === "individual") {
            const kycRecord = await KYC.findOne({
                userId: userId,
            })
                .select("status")
                .lean();

            const kyc = kycRecord?.status === "Approved";

            return reply.code(200).send({
                success: true,
                message: "Profile retrieved successfully",
                result: {
                    ...user,
                    // lockTimeoutMinutes: `${user.lockTimeoutMinutes} min`,
                    kyc,
                },
            });
        }

        // =====================================================
        // BUSINESS → CHECK KYB
        // =====================================================
        if (accountType === "business") {
            const kybRecord = await KYB.findOne({
                userId: userId,
            })
                .select("status")
                .lean();

            const kyb = kybRecord?.status === "Approved";

            return reply.code(200).send({
                success: true,
                message: "Profile retrieved successfully",
                result: {
                    ...user,
                    // lockTimeoutMinutes: `${user.lockTimeoutMinutes} min`,
                    kyb,
                },
            });
        }
    } catch (error) {
        console.error("Profile Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Something Went Wrong",
        });
    }
};

module.exports = {
    profile,
};