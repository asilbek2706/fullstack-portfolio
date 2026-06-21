const FAQ = require("../models/Faq");
const mongoose = require("mongoose"); // 🔥 ID validatsiyasi uchun mongoose ulandi

// 🌐 1. Barcha FAQ savol-javoblarini olish (Ommaviy - Home Page uchun)
exports.getFAQs = async (req, res) => {
  try {
    // 🔥 -__v maydoni front-endga keraksiz, shuni select orqali olib tashlaymiz
    const faqs = await FAQ.find().sort({ order: 1 }).select("-__v");

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "FAQ ma'lumotlarini yuklashda xatolik.",
      error: error.message,
    });
  }
};

// 🔒 2. Yangi FAQ savol-javob qo'shish (⚠️ Faqat SuperAdmin)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, order } = req.body;

    // 🛡️ Xavfsizlik va Validatsiya: Bo'sh ma'lumot yuborishdan himoya
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Savol va javob matni majburiy kiritilishi shart!",
      });
    }

    const adminId = req.admin._id; 

    const newFaq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      order: order || 0,
      createdBy: adminId,
    });

    res.status(201).json({
      success: true,
      message: "Yangi FAQ muvaffaqiyatli yaratildi! 🚀",
      data: newFaq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "FAQ yaratishda server xatoligi.",
      error: error.message,
    });
  }
};

// 🔒 3. FAQ savolini tahrirlash (⚠️ Faqat SuperAdmin)
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, order } = req.body;

    // 🛡️ XAVFSIZLIK DEVORI: ID formatini tekshirish (Server crash bo'lishini oldini oladi)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Yaroqsiz ID formati! Iltimos, to'g'ri ID kiriting.",
      });
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "Bunday FAQ topilmadi.",
      });
    }

    // 🛡️ Data Sanitization: Faqat ruxsat berilgan maydonlarni yangilash
    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();
    if (order !== undefined) faq.order = order;

    await faq.save();

    res.status(200).json({
      success: true,
      message: "FAQ muvaffaqiyatli tahrirlandi! 📝",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "FAQni yangilashda server xatoligi.",
      error: error.message,
    });
  }
};

// 🔒 4. FAQ savolini o'chirish (⚠️ Faqat SuperAdmin)
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ XAVFSIZLIK DEVORI: ID formatini tekshirish (Server crash bo'lishini oldini oladi)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Yaroqsiz ID formati! Iltimos, to'g'ri ID kiriting.",
      });
    }

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "O'chirmoqchi bo'lgan FAQ topilmadi.",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ daxshatli tarzda bazadan o'chirib tashlandi! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "FAQni o'chirishda server xatoligi.",
      error: error.message,
    });
  }
};