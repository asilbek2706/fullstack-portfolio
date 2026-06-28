const Project = require("../models/Project");
const mongoose = require("mongoose");

// ================================
// Project ma'lumotlarini tekshirish
// ================================
const validateProjectInput = (req, res, next) => {
  let { title, description, technologies, githubLink } = req.body;

  // multipart/form-data dan kelgan technologies ni Array qilish
  if (typeof technologies === "string") {
    try {
      technologies = JSON.parse(technologies);
    } catch {
      technologies = technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    req.body.technologies = technologies;
  }

  // POST uchun rasm majburiy
  if (req.method === "POST" && !req.file) {
    return res.status(400).json({
      success: false,
      message: "Rasm yuklanishi shart!",
    });
  }

  // title
  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Loyiha sarlavhasi kamida 3 ta belgidan iborat bo'lishi kerak!",
    });
  }

  // description
  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Loyiha tavsifi kamida 10 ta belgidan iborat bo'lishi kerak!",
    });
  }

  // github
  if (!githubLink) {
    return res.status(400).json({
      success: false,
      message: "Github havolasi kiritilishi shart!",
    });
  }

  // technologies
  if (!Array.isArray(technologies)) {
    return res.status(400).json({
      success: false,
      message: "Technologies massiv (Array) ko'rinishida bo'lishi kerak!",
    });
  }

  if (technologies.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Kamida bitta texnologiya kiriting!",
    });
  }

  if (technologies.length > 4) {
    return res.status(400).json({
      success: false,
      message: "Texnologiyalar soni 4 tadan oshmasligi kerak!",
    });
  }

  next();
};

// ===================================
// Muallif yoki SuperAdmin tekshiruvi
// ===================================
const checkProjectOwnerOrSuper = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID formati noto'g'ri!",
      });
    }

    const currentAdmin = req.user || req.admin;

    if (!currentAdmin) {
      return res.status(401).json({
        success: false,
        message: "Avtorizatsiya talab qilinadi!",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Loyiha topilmadi!",
      });
    }

    // SuperAdmin hamma narsani o'zgartira oladi
    if (currentAdmin.role === "superadmin") {
      return next();
    }

    // createdBy bo'lmasa
    if (!project.createdBy) {
      return res.status(403).json({
        success: false,
        message:
          "Bu loyiha muallifisiz yaratilgan. Uni faqat SuperAdmin boshqarishi mumkin.",
      });
    }

    // Oddiy admin faqat o'zinikini boshqaradi
    if (project.createdBy.toString() !== currentAdmin._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "Siz faqat o'zingiz yaratgan loyihalarni tahrirlashingiz yoki o'chirishingiz mumkin.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Ruxsatni tekshirishda xatolik",
      error: error.message,
    });
  }
};

module.exports = {
  validateProjectInput,
  checkProjectOwnerOrSuper,
};
