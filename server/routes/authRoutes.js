const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");

// 1. Tizimga kirish (Hamma uchun ochiq)
router.post("/login", authController.loginAdmin);

// ---- QUYIDAGI YO'LLAR FAQAT SUPERADMIN UCHUN HIMOYA QILINGAN ----
// Yangi admin qo'shish
router.post(
  "/invite",
  protect,
  async (req, res, next) => {
    const currentUser = req.user || req.admin;

    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "Foydalanuvchi aniqlanmadi. Qayta login qiling!" });
    }

    if (currentUser.role !== "superadmin") {
      return res
        .status(403)
        .json({
          message:
            "Foydalanuvchi roli: " +
            currentUser.role +
            ". Faqat SuperAdmin qila oladi!",
        });
    }
    req.user = currentUser;
    next();
  },
  authController.inviteAdmin,
);

// Barcha adminlarni ko'rish
router.get(
  "/admins",
  protect,
  restrictToSuperAdmin,
  authController.getAllAdmins,
);

// Admin ozining ma'lumotlarini yangilashi
router.patch("/update", protect, authController.updateMe);

// 🔒 2. PUT: Faqat SuperAdmin boshqa adminni ID orqali to'liq yangilashi
router.put(
  "/update/:id",
  protect,
  async (req, res, next) => {
    const currentUser = req.user || req.admin;
    if (!currentUser || currentUser.role !== "superadmin") {
      return res
        .status(403)
        .json({
          message: "Bu amalni bajarishga faqat SuperAdminga ruxsat berilgan!",
        });
    }
    req.user = currentUser;
    next();
  },
  authController.updateAdminBySuper,
);

// Adminni o'chirish
router.delete(
  "/admins/:id",
  protect,
  restrictToSuperAdmin,
  authController.deleteAdmin,
);

module.exports = router;
