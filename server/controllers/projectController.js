const Project = require("../models/Project");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");

// =========================
// HELPERLAR
// =========================

// technologies ni arrayga aylantirish
const parseTechnologies = (technologies) => {
  if (!technologies) return [];

  if (Array.isArray(technologies)) return technologies;

  if (typeof technologies === "string") {
    try {
      const parsed = JSON.parse(technologies);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (_) {}

    return technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// eski rasmni o'chirish
const deleteImage = async (imagePath) => {
  if (!imagePath) return;

  try {
    const fullPath = path.join(__dirname, "..", imagePath.replace(/^\//, ""));

    await fs.access(fullPath);
    await fs.unlink(fullPath);
  } catch (_) {
    // fayl topilmasa yoki o'chmasa davom etadi
  }
};

// =========================
// GET ALL PROJECTS
// =========================

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Loyihalar muvaffaqiyatli yuklandi.",
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Serverda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// =========================
// GET PROJECT BY ID
// =========================

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID formati noto'g'ri.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Loyiha topilmadi.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Loyiha topildi.",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Serverda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// =========================
// CREATE PROJECT
// =========================

exports.createProject = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Rasm yuklanishi shart.",
      });
    }

    const technologies = parseTechnologies(req.body.technologies);

    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      technologies,
      githubLink: req.body.githubLink,
      demoLink: req.body.demoLink || "",
      image: `/uploads/projects/${req.file.filename}`,
      createdBy: req.user._id,
    });

    if (global.io) {
      global.io.emit("projectCreated", project);
    }

    return res.status(201).json({
      success: true,
      message: "Loyiha muvaffaqiyatli yaratildi.",
      data: project,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Loyiha yaratishda xatolik.",
      error: error.message,
    });
  }
};
// =========================
// UPDATE PROJECT (PUT)
// =========================

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID formati noto'g'ri.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Loyiha topilmadi.",
      });
    }

    const technologies = parseTechnologies(req.body.technologies);

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      technologies,
      githubLink: req.body.githubLink,
      demoLink: req.body.demoLink || "",
    };

    if (req.file) {
      await deleteImage(project.image);
      updateData.image = `/uploads/projects/${req.file.filename}`;
    } else {
      updateData.image = project.image;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (global.io) {
      global.io.emit("projectUpdated", updatedProject);
    }

    return res.status(200).json({
      success: true,
      message: "Loyiha muvaffaqiyatli yangilandi.",
      data: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Yangilashda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// =========================
// PATCH PROJECT
// =========================

exports.patchProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID formati noto'g'ri.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Loyiha topilmadi.",
      });
    }

    const updateData = { ...req.body };

    if (req.body.technologies) {
      updateData.technologies = parseTechnologies(req.body.technologies);
    }

    if (req.file) {
      await deleteImage(project.image);
      updateData.image = `/uploads/projects/${req.file.filename}`;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (global.io) {
      global.io.emit("projectUpdated", updatedProject);
    }

    return res.status(200).json({
      success: true,
      message: "Loyiha qisman yangilandi.",
      data: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Qisman yangilashda xatolik.",
      error: error.message,
    });
  }
};

// =========================
// DELETE PROJECT
// =========================

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID formati noto'g'ri.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Loyiha topilmadi.",
      });
    }

    await deleteImage(project.image);

    await project.deleteOne();

    if (global.io) {
      global.io.emit("projectDeleted", {
        id: project._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Loyiha muvaffaqiyatli o'chirildi.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "O'chirishda xatolik yuz berdi.",
      error: error.message,
    });
  }
};
