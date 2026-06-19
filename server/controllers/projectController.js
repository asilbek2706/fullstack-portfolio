const Project = require("../models/Project");
const mongoose = require("mongoose");

// 1. BARCHA LOYIHALARNI OLISH (Hammaga ochiq)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ message: "Loyihalar muvaffaqiyatli yuklandi", data: projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Serverda kutilmagan xatolik", error: error.message });
  }
};

// 2. BITTA LOYIHANI ID BO'YICHA OLISH (Hammaga ochiq)
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Yuborilgan ID formati noto'g'ri!" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Loyiha topilmadi" });
    }

    res.json({ message: "Loyiha topildi!", data: project });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Serverda kutilmagan xatolik", error: error.message });
  }
};

// 3. YANGI LOYIHA QO'SHISH (Faqat Adminlar)
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi shart!" });
    }

    const newProject = new Project({ title, description });
    await newProject.save();

    res
      .status(201)
      .json({ message: "Loyiha muvaffaqiyatli saqlandi!", data: newProject });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Loyihani saqlashda xatolik", error: error.message });
  }
};

// 4. LOYIHANI TO'LIQ YANGILASH (PUT - Faqat Adminlar)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID formati noto'g'ri!" });
    }

    if (!title || !description) {
      return res
        .status(400)
        .json({
          message: "PUT so'rovi uchun barcha maydonlar to'ldirilishi shart!",
        });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Loyiha topilmadi" });
    }

    res.json({
      message: "Loyiha muvaffaqiyatli yangilandi!",
      data: updatedProject,
    });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Yangilashda xatolik yuzaga keldi",
        error: error.message,
      });
  }
};

// 5. LOYIHANI QISMAN YANGILASH (PATCH - Faqat Adminlar)
exports.patchProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID formati noto'g'ri!" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      req.body, // Kelgan o'zgarishlarni avtomat qabul qiladi (masalan, faqat title)
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Loyiha topilmadi" });
    }

    res.json({ message: "Loyiha qisman yangilandi!", data: updatedProject });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Qisman yangilashda xatolik", error: error.message });
  }
};

// 6. LOYIHANI O'CHIRISH (Faqat Adminlar)
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID formati noto'g'ri!" });
    }

    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Loyiha topilmadi" });
    }

    res.json({ message: "Loyiha tizimdan butunlay o'chirildi!" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "O'chirishda xatolik yuzaga keldi",
        error: error.message,
      });
  }
};
