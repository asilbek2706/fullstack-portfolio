const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Savol matni kiritilishi shart"],
      trim: true,
      minlength: [3, "Savol kamida 3 ta belgidan iborat bo'lishi kerak"],
      maxlength: [300, "Savol 300 ta belgidan oshmasligi kerak"],
    },
    answer: {
      type: String,
      required: [true, "Javob matni kiritilishi shart"],
      trim: true,
      minlength: [2, "Javob kamida 2 ta belgidan iborat bo'lishi kerak"],
      maxlength: [3000, "Javob 3000 ta belgidan oshmasligi kerak"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "FAQ tartib raqami manfiy bo'lishi mumkin emas"],
      max: [10000, "FAQ tartib raqami 10000 dan oshmasligi kerak"],
      validate: {
        validator: Number.isInteger,
        message: "FAQ tartib raqami butun son bo'lishi kerak",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("FAQ", FAQSchema);
