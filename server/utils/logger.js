const pino = require("pino");
const { env } = require("../config/env");

const isProduction = env.nodeEnv === "production";
const pinoLogLevels = new Set([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);
const fallbackLogLevel = isProduction ? "info" : "debug";

const logger = pino({
  level: pinoLogLevels.has(env.logLevel)
    ? env.logLevel
    : fallbackLogLevel,

  base: {
    service: "portfolio-api",
    environment: env.nodeEnv,
  },

  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "*.authorization",
      "cookie",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.x-telegram-bot-api-secret-token",
    ],
    censor: "[REDACTED]",
  },

  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: true,
        },
      },
});

module.exports = logger;
