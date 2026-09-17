const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};


const sendServerError = (res, error) => {
  logger.error(
    { err: error },
    "Auth controller xatoligi.",
  );

  return res.status(500).json({
    message: "Serverda ichki xatolik yuz berdi.",
  });
};

// 1. TIZIMGA KIRISH (LOGIN) — Cookie bilan avtomatlashtirilgan variant
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Login va parolni kiriting!",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim(),
    }).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "Login yoki parol noto'g'ri!" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Login yoki parol noto'g'ri!" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      ...getAuthCookieOptions(),
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Front-endga token qaytarib o'tirmaymiz, faqat kerakli ma'lumotlarni beramiz
    res.json({
      message: "Tizimga muvaffaqiyatli kirdingiz! 🚀",
      role: admin.role,
      user: {
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// 2. YANGI ADMIN TAKLIF QILISH (Faqat SuperAdmin)
exports.inviteAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Username, email va kamida 8 belgilik parolni kiriting!",
      });
    }

    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim().toLowerCase() },
      ],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Bu username yoki email allaqachon ro'yxatdan o'tgan!",
      });
    }

    // Parolni shifrlaymiz (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yangi adminni bazaga 'admin' roli bilan saqlaymiz
    const newAdmin = new Admin({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Yangi admin muvaffaqiyatli taklif qilindi va yaratildi!",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// 3. BARCHA ADMINLAR RO'YXATINI KO'RISH (Faqat SuperAdmin)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({
      message: "Barcha adminlar ro'yxati muvaffaqiyatli yuklandi",
      data: admins,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// 4. PATCH — Admin o'z ma'lumotlarini qisman yangilashi
exports.updateMe = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const adminId = req.user?._id || req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        message: "Foydalanuvchi aniqlanmadi, iltimos qayta login qiling!",
      });
    }

    let updateData = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
          message: "Parol kamida 8 ta belgi bo'lishi shart!",
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    res.json({
      message: "Ma'lumotlaringiz muvaffaqiyatli yangilandi! ✨",
      data: updatedAdmin,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// 5. PUT — SuperAdmin tomonidan biron bir adminni to'liq boshqarish
exports.updateAdminBySuper = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Admin ID formati noto'g'ri!",
      });
    }

    if (!username || !email || !role) {
      return res.status(400).json({
        message: "Barcha maydonlarni (username, email, role) to'ldirish shart!",
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { username: username.trim(), email: email.trim().toLowerCase(), role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Bunday admin topilmadi!" });
    }

    res.json({
      message: "Admin ma'lumotlari SuperAdmin tomonidan yangilandi! 🛠️",
      data: updatedAdmin,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// 6. ADMINNI O'CHIRISH (Faqat SuperAdmin cheklangan adminlarni o'chira oladi)
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Admin ID formati noto'g'ri!",
      });
    }

    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return res
        .status(404)
        .json({ message: "O'chirilishi kerak bo'lgan admin topilmadi!" });
    }

    if (adminToDelete.role === "superadmin") {
      return res.status(403).json({
        message: "Taqiqlanadi! Tizimda SuperAdminlarni o'chirib bo'lmaydi!",
      });
    }

    await Admin.findByIdAndDelete(id);
    res.json({
      message: `Admin (${adminToDelete.username}) tizimdan muvaffaqiyatli o'chirildi!`,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// 7. TIZIMDAN CHIQISH (LOGOUT)
exports.logoutAdmin = async (req, res) => {
  res.clearCookie("token", getAuthCookieOptions());

  return res.json({
    message: "Tizimdan muvaffaqiyatli chiqdingiz! 🚪",
  });
};

// 8. TIZIMDAGI JORIY ADMINNI ANIQLASH (Frontend refresh uchun)
exports.getMe = async (req, res) => {
  try {
    // req.admin yoki req.user — bu sening verifyToken middleware'ing tokeni
    // ichidagi ma'lumotlarni qayerga yozganiga bog'liq (odatda req.admin yoki req.user)
    const adminId = req.admin?.id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Siz tizimga kirmagansiz!" });
    }

    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin topilmadi!" });
    }

    res.json({
      username: admin.username,
      role: admin.role,
      email: admin.email,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};
