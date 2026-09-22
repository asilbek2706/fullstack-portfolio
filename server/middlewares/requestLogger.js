const crypto = require("crypto");
const pinoHttp = require("pino-http");

const logger = require("../utils/logger");

const isHealthCheck = (req) => req.url === "/health" || req.url === "/ready";

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

  autoLogging: {
    ignore: isHealthCheck,
  },

  wrapSerializers: false,

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      remoteAddress: req.socket?.remoteAddress,
    }),

    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  customLogLevel: (req, res, error) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req, res) => {
    const outcome = res.statusCode >= 400 ? "rejected" : "completed";

    return `${req.method} ${req.originalUrl || req.url} ` + outcome;
  },

  customErrorMessage: (req) =>
    `${req.method} ${req.originalUrl || req.url} failed`,
});

module.exports = requestLogger;
