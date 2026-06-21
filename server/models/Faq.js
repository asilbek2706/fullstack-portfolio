const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Savol matni kiritilishi shart"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Javob matni kiritilishi shart"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("FAQ", FAQSchema);
