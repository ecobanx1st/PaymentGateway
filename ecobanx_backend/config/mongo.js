const mongoose = require("mongoose");

async function initMongo() {
    try {
        mongoose.set("autoIndex", false);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 60000,
            maxPoolSize: 100,
            minPoolSize: 10,
            maxIdleTimeMS: 30000,
            waitQueueTimeoutMS: 10000,
            family: 4,
        });

        console.log("****************************");
        console.log("*    Starting Server");
        console.log(`*    Port: ${process.env.PORT || 3000}`);
        console.log(`*    NODE_ENV: ${process.env.NODE_ENV}`);
        console.log(`*    Database: MongoDB (Mongoose)`);
        console.log("*    DB Connection: OK");
        console.log("****************************");

        return mongoose.connection;
    } catch (err) {
        console.error("DB Connection Error:", err);
        process.exit(1);
    }
}

module.exports = {
    initMongo
};
