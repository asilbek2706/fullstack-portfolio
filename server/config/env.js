require("dotenv").config({ quiet: true });

const rawPort = process.env.PORT;

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || (
    process.env.NODE_ENV === "production"
      ? "info"
      : "debug"
  ),
  port: rawPort === undefined ? 8080 : Number(rawPort),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,

  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
  recaptchaAction: process.env.RECAPTCHA_ACTION || "contact",
  recaptchaHostname: process.env.RECAPTCHA_HOSTNAME,
  recaptchaMinScore:
    process.env.RECAPTCHA_MIN_SCORE === undefined
      ? 0.5
      : Number(process.env.RECAPTCHA_MIN_SCORE),

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  webhookSecretToken: process.env.WEBHOOK_SECRET_TOKEN,
};

const validateEnv = () => {
  const requiredValues = {
    MONGO_URI: env.mongoUri,
    JWT_SECRET: env.jwtSecret,
    CLIENT_URL: env.clientUrl,
    RECAPTCHA_SECRET_KEY: env.recaptchaSecretKey,
    TELEGRAM_BOT_TOKEN: env.telegramBotToken,
    TELEGRAM_CHAT_ID: env.telegramChatId,
    WEBHOOK_SECRET_TOKEN: env.webhookSecretToken,
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

  if (!["development", "test", "production"].includes(env.nodeEnv)) {
    throw new Error(
      "NODE_ENV faqat development, test yoki production bo'lishi mumkin.",
    );
  }

  const allowedLogLevels = [
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ];

  if (!allowedLogLevels.includes(env.logLevel)) {
    throw new Error(
      `LOG_LEVEL noto'g'ri. Ruxsat etilgan qiymatlar: ${allowedLogLevels.join(", ")}`,
    );
  }

  if (
    !Number.isInteger(env.port) ||
    env.port < 1 ||
    env.port > 65535
  ) {
    throw new Error("PORT 1 va 65535 oralig'idagi butun son bo'lishi kerak.");
  }

  let clientUrl;

  try {
    clientUrl = new URL(env.clientUrl);
  } catch {
    throw new Error("CLIENT_URL to'g'ri URL formatida bo'lishi kerak.");
  }

  if (!["http:", "https:"].includes(clientUrl.protocol)) {
    throw new Error("CLIENT_URL faqat http yoki https bo'lishi kerak.");
  }

  if (
    typeof env.recaptchaAction !== "string" ||
    !/^[A-Za-z0-9/_-]{1,100}$/.test(env.recaptchaAction)
  ) {
    throw new Error("RECAPTCHA_ACTION formati noto'g'ri.");
  }

  env.recaptchaHostname =
    env.recaptchaHostname || clientUrl.hostname;

  if (
    !Number.isFinite(env.recaptchaMinScore) ||
    env.recaptchaMinScore < 0 ||
    env.recaptchaMinScore > 1
  ) {
    throw new Error(
      "RECAPTCHA_MIN_SCORE 0 va 1 oralig'idagi son bo'lishi kerak.",
    );
  }

  return env;
};

module.exports = {
  env,
  validateEnv,
};
