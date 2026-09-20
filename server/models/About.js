const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Ism-familiya kiritilishi shart"],
      trim: true,
      minlength: [2, "Ism-familiya kamida 2 ta belgidan iborat bo'lishi kerak"],
      maxlength: [120, "Ism-familiya 120 ta belgidan oshmasligi kerak"],
    },
    title: {
      type: String,
      required: [true, "Kasbiy unvon (Title) kiritilishi shart"],
      trim: true,
      minlength: [2, "Kasbiy unvon kamida 2 ta belgidan iborat bo'lishi kerak"],
      maxlength: [120, "Kasbiy unvon 120 ta belgidan oshmasligi kerak"],
    },
    avatar: {
      type: String,
      required: [true, "Profil rasmi URL manzili shart"],
      trim: true,
      maxlength: [2048, "Profil rasmi URL manzili juda uzun"],
      validate: {
        validator: (value) => {
          if (
            /^\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(value)
          ) {
            return true;
          }

          try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        message:
          "Avatar to'g'ri http/https URL yoki lokal upload yo'li bo'lishi kerak",
      },
    },
    bio: {
      type: String,
      required: [true, "O'zingiz haqingizda ma'lumot (Bio) shart"],
      trim: true,
      minlength: [10, "Bio kamida 10 ta belgidan iborat bo'lishi kerak"],
      maxlength: [3000, "Bio 3000 ta belgidan oshmasligi kerak"],
    },
    experienceYears: {
      type: String,
      required: [true, "O'qish/tajriba yili kiritilishi shart"],
      default: "7 oy",
      trim: true,
      maxlength: [50, "Tajriba qiymati 50 ta belgidan oshmasligi kerak"],
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("About", AboutSchema);
