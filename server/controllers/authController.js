const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. TIZIMGA KIRISH (LOGIN)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Login yoki parol noto'g'ri!" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Login yoki parol noto'g'ri!" });
    }

    // Token ichiga xavfsizlik uchun User-Agent va IP'ni ham qo'shib shifrlaymiz
    const userAgent = req.headers["user-agent"];
    const ip = req.ip || req.headers["x-forwarded-for"];

    const token = jwt.sign(
      { id: admin._id, role: admin.role, userAgent, ip },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Tizimga muvaffaqiyatli kirdingiz!",
      role: admin.role,
      token: `${token}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Serverda xatolik yuz berdi", error: error.message });
  }
};

// 2. YANGI ADMIN TAKLIF QILISH (Faqat SuperAdmin)
exports.inviteAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlarni to'ldiring!" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim().toLowerCase() },
      ],
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({
          message: "Bu username yoki email allaqachon ro'yxatdan o'tgan!",
        });
    }

    // 3. Parolni shifrlaymiz (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Yangi adminni bazaga 'admin' roli bilan saqlaymiz
    const newAdmin = new Admin({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "admin", // Avtomat oddiy admin bo'ladi, superadmin emas!
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
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
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
    res
      .status(500)
      .json({ message: "Serverda xatolik yuz berdi", error: error.message });
  }
};

// 4. PATCH — Admin o'z ma'lumotlarini qisman yangilashi (Ism, Email yoki Parol)
exports.updateMe = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const adminId = req.user?._id || req.admin?._id;

    if (!adminId) {
      return res.status(401).json({ message: "Foydalanuvchi aniqlanmadi, iltimos qayta login qiling!" });
    }

    let updateData = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    // Parol kelgan bo'lsa, uni shifrlaymiz
    if (password) {
      if (password.length < 4) {
        return res.status(400).json({ message: "Parol kamida 4 ta belgi bo'lishi shart!" });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Ma'lumotlaringiz muvaffaqiyatli yangilandi! ✨",
      data: updatedAdmin
    });

  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik yuz berdi", error: error.message });
  }
};

// 5. PUT — SuperAdmin tomonidan biron bir adminni to'liq boshqarish (Masalan, rolni o'zgartirish)
exports.updateAdminBySuper = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    if (!username || !email || !role) {
      return res.status(400).json({ message: "Barcha maydonlarni (username, email, role) to'ldirish shart!" });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { username: username.trim(), email: email.trim().toLowerCase(), role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Bunday admin topilmadi!" });
    }

    res.json({
      message: "Admin ma'lumotlari SuperAdmin tomonidan yangilandi! 🛠️",
      data: updatedAdmin
    });

  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
};

// 5. ADMINNI O'CHIRISH (Faqat SuperAdmin cheklangan adminlarni o'chira oladi)
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return res
        .status(404)
        .json({ message: "O'chirilishi kerak bo'lgan admin topilmadi!" });
    }

    // 🛡️ O'z-o'zini o'chirish yoki boshqa SuperAdminni o'chirishni taqiqlash!
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
    res.status(500).json({ message: "Xatolik", error: error.message });
  }
};
