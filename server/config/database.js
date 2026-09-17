const mongoose = require("mongoose");

const { env } = require("./env");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production",
    serverSelectionTimeoutMS: 10000,
  });

  logger.info("MongoDB-ga muvaffaqiyatli ulandi.");
};

const disconnectDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info("MongoDB ulanishi yopildi.");
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
