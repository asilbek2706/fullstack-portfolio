const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Loyiha sarlavhasi kiritilishi shart"],
      trim: true,
      minlength: [3, "Sarlavha kamida 3 ta belgi bo'lishi kerak"],
    },

    description: {
      type: String,
      required: [true, "Loyiha tavsifi kiritilishi shart"],
      trim: true,
      minlength: [10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak"],
    },

    image: {
      type: String,
      required: [true, "Rasm yuklanishi shart"],
      trim: true,
    },

    technologies: {
      type: [String],
      required: [true, "Kamida bitta texnologiya kiritilishi shart"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length >= 1 && val.length <= 4;
        },
        message: "Texnologiyalar soni 1 tadan 4 tagacha bo'lishi kerak.",
      },
    },

    githubLink: {
      type: String,
      required: [true, "Github havolasi kiritilishi shart"],
      trim: true,
      match: [/^https?:\/\/.+/, "Github havolasi noto'g'ri."],
    },

    demoLink: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (val) {
          return val === "" || /^https?:\/\/.+/.test(val);
        },
        message: "Demo havolasi noto'g'ri.",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Loyihani yaratgan admin ko'rsatilishi shart!"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Project", projectSchema);
