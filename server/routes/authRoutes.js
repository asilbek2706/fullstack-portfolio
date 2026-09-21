const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  validateLogin,
  validateInviteAdmin,
  validateUpdateMe,
  validateAdminUpdate,
} = require("../middlewares/authValidation");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message:
      "Login urinishlari juda ko'p. 15 daqiqadan keyin qayta urining.",
  },
});

// 🔓 OCHIQ YO'LLAR (Hamma foydalanishi mumkin)
router.post(
  "/login",
  loginLimiter,
  validateLogin,
  authController.loginAdmin,
);

// 🚪 TIZIMDAN CHIQISH (Faqat kirgan adminlar kuki faylini tozalashi uchun)
router.post("/logout", protect, authController.logoutAdmin);

// 🔒 ADMIN O'Z PROFILINI TAHRIRLASHI (Istalgan kirgan admin qila oladi)
router.patch(
  "/update",
  protect,
  validateUpdateMe,
  authController.updateMe,
);


// 🛡️ ---- QUYIDAGI YO'LLAR FAQAT SUPERADMIN UCHUN HIMOYA QILINGAN ----

// Yangi admin qo'shish (Taklif qilish)
router.post(
  "/invite",
  protect,
  restrictToSuperAdmin,
  validateInviteAdmin,
  authController.inviteAdmin,
);

// Barcha adminlar ro'yxatini ko'rish
router.get(
  "/admins",
  protect,
  restrictToSuperAdmin,
  authController.getAllAdmins
);

// Boshqa adminni ID orqali to'liq yangilash (Rolini o'zgartirish va h.k.)
router.put(
  "/update/:id",
  protect,
  restrictToSuperAdmin,
  validateAdminUpdate,
  authController.updateAdminBySuper,
);

// Adminni tizimdan o'chirish
router.delete(
  "/admins/:id",
  protect,
  restrictToSuperAdmin,
  authController.deleteAdmin
);
 
// Kirgan admin o'z ma'lumotlarini ko'rishi (ID, username, email, role)
router.get("/me", protect, authController.getMe);

module.exports = router;