const { env } = require("./env");

const allowedOrigins = [
  env.clientUrl,
  "http://localhost:5173",
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const error = new Error(
      "CORS tomonidan ruxsat berilmagan origin.",
    );
    error.code = "CORS_ORIGIN_DENIED";

    return callback(error);
  },
  credentials: true,
};

module.exports = {
  allowedOrigins,
  corsOptions,
  isOriginAllowed,
};
