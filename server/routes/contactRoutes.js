const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const {
  validateContactAndRecaptcha,
} = require("../middlewares/contactMiddleware");
const { protect, restrictToSuperAdmin } = require("../middlewares/authMiddleware");

// 📩 Yangi savol yuborish (Xavfsiz, reCAPTCHA v3 bilan)
router.post("/", validateContactAndRecaptcha, contactController.createContact);

// 🔒 Barcha savol-javoblarni ko'rish (Faqat Login qilgan Admin uchun)
router.get("/", protect, contactController.getAllQuestionsAnswers);

// 🌐 Barcha javob berilgan savollarni ommaviy olish (Frontend F.A.Q uchun)
router.get("/answer", contactController.getContactAnswers);

// 🔍 Bitta maxsus savol javobini tekshirish (ID bo'yicha)
router.get("/answer/:id", contactController.getContactAnswer);

// 🔒 Bitta savolni ID bo'yicha o'chirish (Faqat Admin)
router.delete(
  "/:id",
  protect,
  restrictToSuperAdmin,
  contactController.deleteContact,
);

// 🤖 Telegram Botdan keladigan javobni qabul qilish (Webhook)
router.post("/telegram-webhook", contactController.handleTelegramWebhook);

module.exports = router;
