const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");

// 🔓 OCHIQ YO'LLAR (Hamma foydalanishi mumkin)
router.post("/login", authController.loginAdmin);

// 🚪 TIZIMDAN CHIQISH (Faqat kirgan adminlar kuki faylini tozalashi uchun)
router.post("/logout", protect, authController.logoutAdmin);

// 🔒 ADMIN O'Z PROFILINI TAHRIRLASHI (Istalgan kirgan admin qila oladi)
router.patch("/update", protect, authController.updateMe);


// 🛡️ ---- QUYIDAGI YO'LLAR FAQAT SUPERADMIN UCHUN HIMOYA QILINGAN ----

// Yangi admin qo'shish (Taklif qilish)
router.post(
  "/invite",
  protect,
  restrictToSuperAdmin,
  authController.inviteAdmin
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
  authController.updateAdminBySuper
);

// Adminni tizimdan o'chirish
router.delete(
  "/admins/:id",
  protect,
  restrictToSuperAdmin,
  authController.deleteAdmin
);

module.exports = router;