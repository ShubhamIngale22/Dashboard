// db/config.js
const mongoose = require("mongoose");
const logger = require("../app/utility/logger_utility");
const { dbURL } = require("../app/constant/constant");

async function connectDB() {
    try {
        await mongoose.connect(dbURL.database); // no auth / no replicaSet forced
        logger.logger.info("connected to the database");
        return mongoose.connection;
    } catch (err) {
        logger.logger.error("mongoose err :: " + (err?.message || err));
        throw err;
    }
}

module.exports = { connectDB };
