require("dotenv").config({ quiet: true });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
};

const validateEnv = () => {
  const requiredValues = {
    MONGO_URI: env.mongoUri,
    JWT_SECRET: env.jwtSecret,
    CLIENT_URL: env.clientUrl,
  };

  const missingValues = Object.entries(requiredValues)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingValues.length > 0) {
    throw new Error(
      `Majburiy environment qiymatlari topilmadi: ${missingValues.join(", ")}`,
    );
  }

  if (env.jwtSecret.length < 32) {
    throw new Error(
      "JWT_SECRET kamida 32 ta belgidan iborat bo'lishi kerak.",
    );
  }

  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error("PORT 1 va 65535 oralig'ida bo'lishi kerak.");
  }

  return env;
};

module.exports = {
  env,
  validateEnv,
};
