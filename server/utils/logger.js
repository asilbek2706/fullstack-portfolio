const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (isProduction ? "info" : "debug"),

  base: {
    service: "portfolio-api",
    environment: process.env.NODE_ENV || "development",
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
