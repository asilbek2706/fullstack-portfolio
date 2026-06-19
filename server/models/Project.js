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
    },
    image: {
      type: String,
      required: [true, "Loyiha rasmi (URL yoki fayl yo'li) kiritilishi shart"],
      trim: true,
    },
    technologies: {
      type: [String],
      required: [true, "Kamida bitta texnologiya kiritilishi shart"],
      validate: {
        // Ko'pi bilan 4 ta texnologiya kiritishni tekshirish (Custom Validator)
        validator: function (val) {
          return val.length <= 4;
        },
        message: "Texnologiyalar soni ko'pi bilan 4 ta bo'lishi mumkin!",
      },
    },
    githubLink: {
      type: String,
      required: [true, "GitHub havolasi kiritilishi shart"],
      trim: true,
    },
    demoLink: {
      type: String,
      required: false, // Ixtiyoriy maydon
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
