const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Login kiritilishi shart"],
      unique: true,
      trim: true,
      minlength: [3, "Username kamida 3 ta belgidan iborat bo'lishi kerak"],
      maxlength: [32, "Username 32 ta belgidan oshmasligi kerak"],
      match: [/^[A-Za-z0-9._-]+$/, "Username formati noto'g'ri"],
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [254, "Email 254 ta belgidan oshmasligi kerak"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Iltimos, to'g'ri email manzilini kiriting",
      ],
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Admin", AdminSchema);
