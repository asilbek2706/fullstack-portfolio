const mongoose = require("mongoose");

const removePrivateFields = (_document, result) => {
  delete result.createdBy;
  return result;
};

const isValidHttpUrl = (value, { githubOnly = false } = {}) => {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    if (githubOnly) {
      const hostname = url.hostname.toLowerCase();

      return (
        hostname === "github.com" ||
        hostname === "www.github.com"
      );
    }

    return true;
  } catch {
    return false;
  }
};

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Loyiha sarlavhasi kiritilishi shart"],
      trim: true,
      minlength: [3, "Sarlavha kamida 3 ta belgi bo'lishi kerak"],
      maxlength: [120, "Sarlavha 120 ta belgidan oshmasligi kerak"],
    },

    description: {
      type: String,
      required: [true, "Loyiha tavsifi kiritilishi shart"],
      trim: true,
      minlength: [10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak"],
      maxlength: [3000, "Tavsif 3000 ta belgidan oshmasligi kerak"],
    },

    image: {
      type: String,
      required: [true, "Rasm yuklanishi shart"],
      trim: true,
      maxlength: [500, "Rasm yo'li 500 ta belgidan oshmasligi kerak"],
    },

    technologies: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Texnologiya nomi bo'sh bo'lishi mumkin emas"],
          maxlength: [40, "Texnologiya nomi 40 ta belgidan oshmasligi kerak"],
        },
      ],
      required: [true, "Kamida bitta texnologiya kiritilishi shart"],
      validate: [
        {
          validator: (values) =>
            Array.isArray(values) &&
            values.length >= 1 &&
            values.length <= 4,
          message: "Texnologiyalar soni 1 tadan 4 tagacha bo'lishi kerak",
        },
        {
          validator: (values) => {
            if (!Array.isArray(values)) return false;

            const normalized = values.map((value) =>
              value.toLowerCase(),
            );

            return new Set(normalized).size === normalized.length;
          },
          message: "Texnologiyalar takrorlanmasligi kerak",
        },
      ],
    },

    githubLink: {
      type: String,
      required: [true, "Github havolasi kiritilishi shart"],
      trim: true,
      maxlength: [2048, "Github havolasi juda uzun"],
      validate: {
        validator: (value) =>
          isValidHttpUrl(value, { githubOnly: true }),
        message: "Github havolasi github.com URL bo'lishi kerak",
      },
    },

    demoLink: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Demo havolasi juda uzun"],
      validate: {
        validator: (value) =>
          value === "" || isValidHttpUrl(value),
        message: "Demo havolasi to'g'ri http/https URL bo'lishi kerak",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Loyihani yaratgan admin ko'rsatilishi shart"],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: removePrivateFields,
    },
    toObject: {
      transform: removePrivateFields,
    },
  },
);

projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
