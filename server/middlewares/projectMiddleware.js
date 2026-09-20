const Project = require("../models/Project");
const mongoose = require("mongoose");

// ================================
// Project ma'lumotlarini tekshirish
// ================================
const allowedProjectFields = new Set([
  "title",
  "description",
  "technologies",
  "githubLink",
  "demoLink",
]);

const parseTechnologiesInput = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();

  if (!trimmedValue) return [];

  if (trimmedValue.startsWith("[")) {
    try {
      return JSON.parse(trimmedValue);
    } catch {
      return null;
    }
  }

  return trimmedValue.split(",");
};

const validateHttpUrl = (value, { githubOnly = false } = {}) => {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    if (githubOnly) {
      const hostname = url.hostname.toLowerCase();

      if (
        hostname !== "github.com" &&
        hostname !== "www.github.com"
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

const validateProjectInput = (req, res, next) => {
  const body =
    req.body &&
    typeof req.body === "object" &&
    !Array.isArray(req.body)
      ? req.body
      : {};

  const unknownFields = Object.keys(body).filter(
    (field) => !allowedProjectFields.has(field),
  );

  if (unknownFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Ruxsat etilmagan maydonlar: ${unknownFields.join(", ")}`,
    });
  }

  const isFullRequest =
    req.method === "POST" || req.method === "PUT";

  const requiredFields = [
    "title",
    "description",
    "technologies",
    "githubLink",
  ];

  if (isFullRequest) {
    const missingFields = requiredFields.filter(
      (field) => !Object.hasOwn(body, field),
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Majburiy maydonlar yetishmayapti: ${missingFields.join(", ")}`,
      });
    }
  }

  if (
    req.method === "PATCH" &&
    Object.keys(body).length === 0 &&
    !req.file
  ) {
    return res.status(400).json({
      success: false,
      message: "Yangilash uchun kamida bitta maydon yuboring.",
    });
  }

  const normalized = {};

  const textRules = {
    title: {
      min: 3,
      max: 120,
      label: "Sarlavha",
    },
    description: {
      min: 10,
      max: 3000,
      label: "Tavsif",
    },
  };

  for (const [field, rule] of Object.entries(textRules)) {
    if (!Object.hasOwn(body, field)) continue;

    if (typeof body[field] !== "string") {
      return res.status(400).json({
        success: false,
        message: `${rule.label} matn ko'rinishida bo'lishi kerak.`,
      });
    }

    const value = body[field].trim();

    if (value.length < rule.min || value.length > rule.max) {
      return res.status(400).json({
        success: false,
        message:
          `${rule.label} uzunligi ${rule.min}–${rule.max} belgi oralig'ida bo'lishi kerak.`,
      });
    }

    normalized[field] = value;
  }

  if (Object.hasOwn(body, "technologies")) {
    const technologies =
      parseTechnologiesInput(body.technologies);

    if (
      !Array.isArray(technologies) ||
      technologies.length < 1 ||
      technologies.length > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Technologies 1–4 elementli massiv bo'lishi kerak.",
      });
    }

    const normalizedTechnologies = [];

    for (const technology of technologies) {
      if (typeof technology !== "string") {
        return res.status(400).json({
          success: false,
          message: "Har bir texnologiya matn bo'lishi kerak.",
        });
      }

      const value = technology.trim();

      if (value.length < 1 || value.length > 40) {
        return res.status(400).json({
          success: false,
          message:
            "Texnologiya nomi 1–40 belgi oralig'ida bo'lishi kerak.",
        });
      }

      normalizedTechnologies.push(value);
    }

    const uniqueTechnologies = new Set(
      normalizedTechnologies.map((item) =>
        item.toLowerCase(),
      ),
    );

    if (
      uniqueTechnologies.size !==
      normalizedTechnologies.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Technologies ichida takroriy qiymat bor.",
      });
    }

    normalized.technologies = normalizedTechnologies;
  }

  if (Object.hasOwn(body, "githubLink")) {
    if (
      typeof body.githubLink !== "string" ||
      body.githubLink.length > 2048 ||
      !validateHttpUrl(body.githubLink.trim(), {
        githubOnly: true,
      })
    ) {
      return res.status(400).json({
        success: false,
        message: "Github havolasi github.com URL bo'lishi kerak.",
      });
    }

    normalized.githubLink = body.githubLink.trim();
  }

  if (Object.hasOwn(body, "demoLink")) {
    if (typeof body.demoLink !== "string") {
      return res.status(400).json({
        success: false,
        message: "Demo havolasi matn bo'lishi kerak.",
      });
    }

    const demoLink = body.demoLink.trim();

    if (
      demoLink.length > 2048 ||
      (demoLink && !validateHttpUrl(demoLink))
    ) {
      return res.status(400).json({
        success: false,
        message: "Demo havolasi to'g'ri http/https URL bo'lishi kerak.",
      });
    }

    normalized.demoLink = demoLink;
  }

  req.body = normalized;
  return next();
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

    const project = await Project.findById(id)
      .select("+createdBy");

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
    return next(error);
  }
};

module.exports = {
  validateProjectInput,
  checkProjectOwnerOrSuper,
};
