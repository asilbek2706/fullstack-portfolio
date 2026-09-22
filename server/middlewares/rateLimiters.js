const rateLimit = require("express-rate-limit");

const isTelegramWebhook = (req) => req.path === "/api/contact/telegram-webhook";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTelegramWebhook,
  message: {
    success: false,
    message: "So'rovlar juda ko'p, iltimos 15 daqiqadan keyin urinib ko'ring.",
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Xabar yuborish limiti tugadi. Iltimos, keyinroq qayta urining.",
  },
});

const telegramWebhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Telegram webhook so'rovlari limiti tugadi.",
  },
});

module.exports = {
  globalLimiter,
  contactLimiter,
  telegramWebhookLimiter,
};
