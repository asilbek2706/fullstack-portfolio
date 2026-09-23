const fs = require("fs/promises");
const path = require("path");
const About = require("../models/About");
const logger = require("../utils/logger");

const aboutUploadDirectory = path.resolve(__dirname, "../uploads/about");

const getLocalAvatarPath = (avatar) => {
  if (typeof avatar !== "string") return null;

  const match = avatar.match(
    /^\/uploads\/about\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i,
  );

  if (!match) return null;

  const filePath = path.resolve(aboutUploadDirectory, match[1]);

  if (!filePath.startsWith(`${aboutUploadDirectory}${path.sep}`)) {
    return null;
  }

  return filePath;
};

const deleteLocalAvatar = async (avatar) => {
  const filePath = getLocalAvatarPath(avatar);

  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger.warn({ err: error, filePath }, "Eski About rasmi o'chirilmadi.");
    }
  }
};

// "Men haqimda" ma'lumotlarini olish
exports.getAbout = async (req, res, next) => {
  try {
    const aboutData = await About.findOne().select("-updatedBy").lean();

    if (!aboutData) {
      return res.status(404).json({
        success: false,
        message: "Ma'lumotlar topilmadi. Tizim hali sozlanmagan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: aboutData,
    });
  } catch (error) {
    return next(error);
  }
};

// About ma'lumotlarini yaratish yoki yangilash
exports.updateAbout = async (req, res, next) => {
  try {
    const adminId = req.admin._id;
    const textFields = ["fullName", "title", "bio", "experienceYears"];
    const allowedFields = textFields;

    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};

    const unknownFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ruxsat etilmagan maydonlar: ${unknownFields.join(", ")}`,
      });
    }

    if (Object.keys(body).length === 0 && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Yangilash uchun kamida bitta maydon yuboring.",
      });
    }

    const updateData = {};

    for (const field of allowedFields) {
      if (!Object.hasOwn(body, field)) continue;

      if (typeof body[field] !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} matn ko'rinishida bo'lishi kerak.`,
        });
      }

      const value = body[field].trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: `${field} bo'sh bo'lishi mumkin emas.`,
        });
      }

      updateData[field] = value;
    }

    if (req.file) {
      updateData.avatar = `/uploads/about/${req.file.filename}`;
    }

    let aboutData = await About.findOne();
    const previousAvatar = aboutData?.avatar;

    if (!aboutData) {
      const requiredFields = [
        "fullName",
        "title",
        "avatar",
        "bio",
        "experienceYears",
      ];
      const missingFields = requiredFields.filter(
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

    if (req.file && previousAvatar && previousAvatar !== updateData.avatar) {
      await deleteLocalAvatar(previousAvatar);
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
