const validateOrigin = (origin, callback) => {
    try {
        const allowedOrigins = process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
            : [];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (process.env.NODE_ENV === "development") {
            console.log("Skipping CORS check for development origin:", origin);
            callback(null, true);
        } else {
            callback(new Error("Origin not allowed"), false);
        }
    } catch (err) {
        callback(new Error("Invalid origin"), false);
    }
};

module.exports = {
    origin: validateOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
    preflight: true,
    optionsSuccessStatus: 204
};
