const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const {
  validateContactAndRecaptcha,
} = require("../middlewares/contactMiddleware");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  contactLimiter,
  telegramWebhookLimiter,
} = require("../middlewares/rateLimiters");

// 📩 Yangi savol yuborish (Xavfsiz, reCAPTCHA v3 bilan)
router.post(
  "/",
  contactLimiter,
  validateContactAndRecaptcha,
  contactController.createContact,
);

// 🔒 Barcha savol-javoblarni ko'rish (Faqat Login qilgan Admin uchun)
router.get("/", protect, contactController.getAllQuestionsAnswers);

// 🌐 Barcha javob berilgan savollarni ommaviy olish (Frontend F.A.Q uchun)
router.get("/answer", contactController.getContactAnswers);

// 🔍 Bitta maxsus savol javobini tekshirish (ID bo'yicha)
router.get("/answer/:id", contactController.getContactAnswer);

// 🔒 Contact javobini public qilish yoki yashirish
router.patch(
  "/:id/publication",
  protect,
  restrictToSuperAdmin,
  contactController.setContactPublication,
);

// 🔒 Barcha savol-javoblarni tozalash (Faqat SuperAdmin)
router.delete(
  "/clear",
  protect,
  restrictToSuperAdmin,
  contactController.clearAllContacts,
);

// 🔒 Bitta savolni ID bo'yicha o'chirish (Faqat Admin)
router.delete(
  "/clear/:id",
  protect,
  restrictToSuperAdmin,
  contactController.deleteContact,
);

// 🤖 Telegram Botdan keladigan javobni qabul qilish (Webhook)
router.post(
  "/telegram-webhook",
  telegramWebhookLimiter,
  contactController.handleTelegramWebhook,
);

module.exports = router;
