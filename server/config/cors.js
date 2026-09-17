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

    return callback(
      new Error("CORS tomonidan ruxsat berilmagan origin."),
    );
  },
  credentials: true,
};

module.exports = {
  allowedOrigins,
  corsOptions,
  isOriginAllowed,
};
