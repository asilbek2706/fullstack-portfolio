const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Ism-familiya kiritilishi shart"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Kasbiy unvon (Title) kiritilishi shart"],
      trim: true,
    },
    avatar: {
      type: String,
      required: [true, "Profil rasmi URL manzili shart"],
      trim: true,
      match: [
        /^https?:\/\/.+/,
        "Iltimos, faqat xavfsiz va to'g'ri rasm URL manzilini kiriting (http/https)",
      ],
    },
    bio: {
      type: String,
      required: [true, "O'zingiz haqingizda ma'lumot (Bio) shart"],
      trim: true,
    },
    experienceYears: {
      type: String,
      required: [true, "O'qish/tajriba yili kiritilishi shart"],
      default: "7 oy",
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
