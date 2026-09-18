const About = require("../models/About");

// 🌐 1. "Men haqimda" ma'lumotlarini olish (Ommaviy)
exports.getAbout = async (req, res, next) => {
  try {
    const aboutData = await About.findOne()
      .select("-updatedBy")
      .lean();

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
    return next(error);
  }
};

// 🔒 2. Ma'lumotlarni yaratish yoki yangilash (⚠️ FAQAT SUPERADMIN)
exports.updateAbout = async (req, res, next) => {
  try {
    const adminId = req.admin._id;
    const allowedFields = [
      "fullName",
      "title",
      "avatar",
      "bio",
      "experienceYears",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (!Object.hasOwn(req.body, field)) continue;

      if (typeof req.body[field] !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} matn ko'rinishida bo'lishi kerak.`,
        });
      }

      const value = req.body[field].trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: `${field} bo'sh bo'lishi mumkin emas.`,
        });
      }

      updateData[field] = value;
    }

    let aboutData = await About.findOne();

    if (!aboutData) {
      const missingFields = allowedFields.filter(
        (field) => !Object.hasOwn(updateData, field),
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Majburiy maydonlar yetishmayapti: ${missingFields.join(", ")}`,
        });
      }

      aboutData = await About.create({
        ...updateData,
        updatedBy: adminId,
      });
    } else {
      for (const [field, value] of Object.entries(updateData)) {
        aboutData[field] = value;
      }

      aboutData.updatedBy = adminId;
      await aboutData.save();
    }

    const responseData = aboutData.toObject();
    delete responseData.updatedBy;

    return res.status(200).json({
      success: true,
      message: "About ma'lumotlari muvaffaqiyatli yangilandi.",
      data: responseData,
    });
  } catch (error) {
    return next(error);
  }
};