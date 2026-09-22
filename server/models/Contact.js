const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ismni kiritish shart"],
      trim: true,
      minlength: [2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"],
      maxlength: [50, "Ism 50 ta belgidan oshmasligi kerak"],
    },
    phone: {
      type: String,
      required: [true, "Telefon raqamini kiritish shart"],
      trim: true,
      match: [
        /^\+998\d{9}$/,
        "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak",
      ],
    },
    message: {
      type: String,
      required: [true, "Xabar matni bo'sh bo'lishi mumkin emas"],
      trim: true,
      minlength: [5, "Xabar kamida 5 ta belgidan iborat bo'lishi kerak"],
      maxlength: [1000, "Xabar 1000 ta belgidan oshmasligi kerak"],
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    answer: {
      type: String,
      default: "",
      trim: true,
      maxlength: [4096, "Javob 4096 ta belgidan oshmasligi kerak"],
    },
    trackingTokenHash: {
      type: String,
      required: [
        function requireTrackingTokenForNewContact() {
          return this.isNew;
        },
        "Yangi murojaat uchun tracking token majburiy",
      ],
      select: false,
      index: true,
    },
    telegramMessageId: {
      type: Number,
      default: null,
      min: [1, "Telegram message ID musbat son bo'lishi kerak"],
      validate: {
        validator: (value) => value === null || Number.isInteger(value),
        message: "Telegram message ID butun son bo'lishi kerak",
      },
      select: false,
      index: true,
    },
    telegramDeliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

contactSchema.index({
  isAnswered: 1,
  isPublic: 1,
  updatedAt: -1,
});

module.exports = mongoose.model("Contact", contactSchema);
