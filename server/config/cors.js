const { env } = require("./env");

const normalizeOrigin = (origin) => {
  if (typeof origin !== "string") return null;

  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const allowedOrigins = [env.clientUrl, "http://localhost:5173"]
  .map(normalizeOrigin)
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);

  return normalizedOrigin !== null && allowedOrigins.includes(normalizedOrigin);
};

const isSameOrigin = (req, origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  const host = req.get("host");

  if (!normalizedOrigin || !host) return false;

  const requestOrigin = normalizeOrigin(`${req.protocol}://${host}`);

  return normalizedOrigin === requestOrigin;
};

const createCorsError = () => {
  const error = new Error("CORS tomonidan ruxsat berilmagan origin.");

  error.code = "CORS_ORIGIN_DENIED";
  return error;
};

// Socket.IO uchun mavjud konfiguratsiya.
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(createCorsError());
  },
  credentials: true,
};

// Express HTTP so‘rovlari uchun frontend yoki same-origin ruxsati.
const httpCorsOptions = (req, callback) => {
  const origin = req.get("origin");

  if (!origin || isOriginAllowed(origin) || isSameOrigin(req, origin)) {
    return callback(null, {
      origin: Boolean(origin),
      credentials: true,
    });
  }

  return callback(createCorsError());
};

module.exports = {
  allowedOrigins,
  corsOptions,
  httpCorsOptions,
  isOriginAllowed,
  isSameOrigin,
};
