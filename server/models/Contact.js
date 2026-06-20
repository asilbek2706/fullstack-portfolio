const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ismni kiritish shart!"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon raqamni kiritish shart!"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Xabar matni bo'sh bo'lishi mumkin emas!"],
      trim: true,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    answer: {
      type: String,
      default: "",
    },
    telegramMessageId: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Contact", contactSchema);
