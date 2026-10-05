const { MerchantApiKey } = require("../models/merchantApiKeyModel");

const checkApiKeyIp = async (req, reply) => {
    try {
        console.log("Client IP:", req.ip);

        const apiKeyId = req.user?.apiKeyId;

        if (!apiKeyId) {
            return reply.code(401).send({
                success: false,
                message: "API key not found",
            });
        }

        const apiKey = await MerchantApiKey.findById(apiKeyId).lean();

        console.log(apiKey,'apiKey');
        

        if (!apiKey) {
            return reply.code(401).send({
                success: false,
                message: "Invalid API credentials",
            });
        }
// console.log("here");

        // No IP restriction configured
        if (!apiKey.ipRestrictions?.length) {
            return;
        }

        const clientIp = req.ip;
        const { mode, ips } = apiKey.ipRestrictions;

        // WHITELIST
        // if (mode === "WHITELIST") {
            if (!apiKey?.ipRestrictions.includes(clientIp)) {
                return reply.code(403).send({
                    success: false,
                    message: "IP Blocked",
                });
            }
        // }

        // BLACKLIST
        // if (mode === "BLACKLIST") {
        //     if (ips.includes(clientIp)) {
        //         return reply.code(403).send({
        //             success: false,
        //             message: "IP address is blocked",
        //         });
        //     }
        // }
    } catch (error) {
        req.log.error(error, "Merchant API IP check failed");

        return reply.code(500).send({
            success: false,
            message: "Failed to validate IP address",
        });
    }
};

module.exports = {
    checkApiKeyIp,
};