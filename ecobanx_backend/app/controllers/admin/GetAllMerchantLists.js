const { Users } = require("../../models/usersModel");
const { Users: StageUsers } = require("../../models/stageUsersModel");

const escapeRegex = (text = "") =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const GetAllMerchantLists = async (req, reply) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            accountverifyStatus,
            walletStatus,
            blockstatus,
            accountType,
            fromDate,
            toDate,
            export: isExport = false,
        } = req.validatedData || req.body || {};

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

        const filter = {};

        if (accountType) {
            filter.accountType = accountType;
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

            filter.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { companyName: searchRegex },
                { companyWebsite: searchRegex },
                { businessName: searchRegex },
            ];
        }

        if (accountverifyStatus !== undefined && accountverifyStatus !== "") {
            filter.accountverifyStatus =
                accountverifyStatus === true || accountverifyStatus === "true";
        }

        if (walletStatus !== undefined && walletStatus !== "") {
            filter.walletStatus =
                walletStatus === true || walletStatus === "true";
        }

        if (blockstatus !== undefined && blockstatus !== "") {
            filter.blockstatus =
                blockstatus === true || blockstatus === "true";
        }

        if (fromDate || toDate) {
            filter.createdAt = {};

            if (fromDate) {
                const start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
                filter.createdAt.$gte = start;
            }

            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const userFields =
            "fullName email phone twoFactorEnabled companyName companyWebsite businessName accountverifyStatus walletStatus blockstatus createdAt accountType";

        const stageFields =
            "fullName email phone companyName companyWebsite businessName accountverifyStatus createdAt accountType";

        const [users, stageUsers] = await Promise.all([
            Users.find(filter)
                .select(userFields)
                .lean(),

            StageUsers.find(filter)
                .select(stageFields)
                .lean(),
        ]);

        const formattedUsers = users.map((user) => ({
            ...user,
            source: "users",
            isStageUser: false,
        }));

        const formattedStageUsers = stageUsers.map((user) => ({
            ...user,
            source: "stageusers",
            isStageUser: true,
            walletStatus: false,
            blockstatus: false,
            twoFactorEnabled: false,
        }));

        const mergedData = [...formattedUsers, ...formattedStageUsers].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Export
        if (isExport) {
            return reply.code(200).send({
                success: true,
                message: "Merchant export fetched successfully.",
                export: true,
                totalRecords: mergedData.length,
                data: mergedData,
            });
        }

        // Manual Pagination
        const totalDocs = mergedData.length;
        const totalPages = Math.ceil(totalDocs / limitNum);
        const startIndex = (pageNum - 1) * limitNum;

        const docs = mergedData.slice(
            startIndex,
            startIndex + limitNum
        );

        return reply.code(200).send({
            success: true,
            message: "Merchant list fetched successfully.",
            export: false,
            data: docs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalDocs,
                totalPages,
                pagingCounter: startIndex + 1,
                hasPrevPage: pageNum > 1,
                hasNextPage: pageNum < totalPages,
                prevPage: pageNum > 1 ? pageNum - 1 : null,
                nextPage: pageNum < totalPages ? pageNum + 1 : null,
            },
        });
    } catch (error) {
        console.error("GetAllMerchantLists Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = {
    GetAllMerchantLists,
};