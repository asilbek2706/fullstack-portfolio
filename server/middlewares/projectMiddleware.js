const Project = require("../models/Project");
const mongoose = require("mongoose");

// 1. Yangi loyiha qo'shilayotganda va PUT qilinayotganda ma'lumotlarni suzgichdan o'tkazish
const validateProjectInput = (req, res, next) => {
  const { title, description, image, technologies, githubLink } = req.body;

  // Kontrollerdagi tekshiruvni shu yerga ko'chirib, yukni kamaytiramiz
  if (!title || !description || !image || !technologies || !githubLink) {
    return res
      .status(400)
      .json({
        message:
          "Barcha majburiy maydonlar to'ldirilishi shart! (title, description, image, technologies, githubLink)",
      });
  }

  // Sarlavha uzunligini tekshirish (Model qoidasiga mos)
  if (title.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Loyiha sarlavhasi kamida 3 ta belgi bo'lishi kerak!" });
  }

  // Texnologiyalar massiv ekanligini va 4 tadan oshmasligini tekshirish (Model validatsiyasi)
  if (!Array.isArray(technologies)) {
    return res
      .status(400)
      .json({
        message:
          "Technologies maydoni massiv (Array) ko'rinishida bo'lishi shart!",
      });
  }

  if (technologies.length === 0) {
    return res
      .status(400)
      .json({ message: "Kamida bitta texnologiya kiritilishi shart!" });
  }

  if (technologies.length > 4) {
    return res
      .status(400)
      .json({
        message: "Texnologiyalar soni ko'pi bilan 4 ta bo'lishi mumkin!",
      });
  }

  next();
};

// 2. Faqat loyiha muallifiga yoki SuperAdminga tahrirlash/o'chirish huquqini berish
const checkProjectOwnerOrSuper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentAdmin = req.user || req.admin; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID formati noto'g'ri!" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Loyiha topilmadi!" });
    }

    if (currentAdmin.role === "superadmin") {
      return next();
    }

    if (!project.createdBy) {
      return res.status(403).json({ 
        message: "Ruxsat rad etildi! Bu tizim loyihasi bo'lib, muallifi noma'lum. Uni faqat SuperAdmin o'zgartira oladi." 
      });
    }

    if (project.createdBy.toString() !== currentAdmin._id.toString()) {
      return res.status(403).json({ 
        message: "Ruxsat rad etildi! Siz faqat o'zingiz yaratgan loyihalarni tahrirlashingiz yoki o'chirishingiz mumkin." 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Xavfsizlik tekshiruvida xatolik", error: error.message });
  }
};

module.exports = { validateProjectInput, checkProjectOwnerOrSuper };
