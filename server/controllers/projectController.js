const Project = require("../models/Project");
const mongoose = require("mongoose");
const upload = require("../middlewares/projectImage");

// 1. BARCHA LOYIHALARNI OLISH
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

// 2. BITTA LOYIHANI ID BO'YICHA OLISH
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

// 3. YANGI LOYIHA QO'SHISH
exports.createProject = async (req, res) => {
  try {
    // req.file faylni yuklab beradi
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imagePath)
      return res.status(400).json({ message: "Rasm yuklanishi shart!" });

    const newProject = new Project({
      ...req.body,
      image: imagePath,
      createdBy: req.user?._id || req.admin?._id,
    });

    await newProject.save();
    res.status(201).json({ message: "Saqlandi!", data: newProject });
  } catch (error) {
    res.status(400).json({ message: "Xatolik", error: error.message });
  }
};

// 4. LOYIHANI TO'LIQ YANGILASH (PUT)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, technologies, githubLink, demoLink } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID formati noto'g'ri!" });
    }

    // PUT qoidasiga ko'ra hamma narsa kiritilishi majburiy
    if (!title || !description || !image || !technologies || !githubLink) {
      return res.status(400).json({
        message: "PUT so'rovi uchun barcha maydonlar to'ldirilishi shart!",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { title, description, image, technologies, githubLink, demoLink },
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
    res.status(400).json({
      message: "Yangilashda xatolik yuzaga keldi",
      error: error.message,
    });
  }
};

// 5. LOYIHANI QISMAN YANGILASH (PATCH)
exports.patchProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID formati noto'g'ri!" });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

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

// 6. LOYIHANI O'CHIRISH
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
    res.status(500).json({
      message: "O'chirishda xatolik yuzaga keldi",
      error: error.message,
    });
  }
};
