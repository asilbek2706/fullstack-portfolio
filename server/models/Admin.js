const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Login kiritilishi shart"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      unique: true,
      trim: true,
      match: [
        /^\x20*[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\x20*$/,
        "Iltimos, to'g'ri email manzilini kiriting",
      ],
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
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
