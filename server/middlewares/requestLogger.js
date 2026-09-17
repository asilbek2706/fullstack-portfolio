const crypto = require("crypto");
const pinoHttp = require("pino-http");

const logger = require("../utils/logger");

const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const incomingId = req.headers["x-request-id"];

    const requestId =
      typeof incomingId === "string" &&
      /^[A-Za-z0-9._-]{1,100}$/.test(incomingId)
        ? incomingId
        : crypto.randomUUID();

    res.setHeader("X-Request-Id", requestId);
    return requestId;
  },

  customLogLevel: (req, res, error) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req) => {
    const url = req.originalUrl || req.url;
    return `${req.method} ${url} completed`;
  },

  customErrorMessage: (req) => {
    const url = req.originalUrl || req.url;
    return `${req.method} ${url} failed`;
  },
});

module.exports = requestLogger;
