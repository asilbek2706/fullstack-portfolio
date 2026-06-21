const About = require("../models/About");

// 🌐 1. "Men haqimda" ma'lumotlarini olish (Ommaviy)
exports.getAbout = async (req, res) => {
  try {
    const aboutData = await About.findOne().populate(
      "updatedBy",
      "username email role",
    );

    if (!aboutData) {
      return res.status(404).json({
        success: false,
        message: "Ma'lumotlar topilmadi. Tizim hali sozlanmagan.",
      });
    }

    res.status(200).json({
      success: true,
      data: aboutData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ma'lumotlarni yuklashda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// 🔒 2. Ma'lumotlarni yaratish yoki yangilash (⚠️ FAQAT SUPERADMIN)
exports.updateAbout = async (req, res) => {
  try {
    const { fullName, title, avatar, bio, experienceYears } = req.body;
    const adminId = req.admin._id;

    let aboutData = await About.findOne();

    if (aboutData) {
      // Agar yangi qiymat kelsa o'sha, kelmasa bazadagi eski qiymat qoladi
      aboutData.fullName = fullName || aboutData.fullName;
      aboutData.title = title || aboutData.title;
      aboutData.avatar = avatar || aboutData.avatar;
      aboutData.bio = bio || aboutData.bio;
      aboutData.experienceYears = experienceYears || aboutData.experienceYears; // Toza va xavfsiz qisqartma
      aboutData.updatedBy = adminId;

      await aboutData.save();
    } else {
      // Baza bo'sh bo'lsa, yangi yaratadi
      aboutData = await About.create({
        fullName,
        title,
        avatar,
        bio,
        experienceYears,
        updatedBy: adminId,
      });
    }

    res.status(200).json({
      success: true,
      message: "About ma'lumotlari daxshatli darajada xavfsiz yangilandi! 🛡️",
      data: aboutData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ma'lumotni yangilashda server xatoligi.",
      error: error.message,
    });
  }
};