const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "So'rovlar juda ko'p, iltimos 15 daqiqadan keyin urinib ko'ring.",
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Xabar yuborish limiti tugadi. Iltimos, birozdan keyin urining.",
  },
});

module.exports = {
  globalLimiter,
  contactLimiter,
};
