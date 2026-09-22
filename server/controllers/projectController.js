const Project = require("../models/Project");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const { emitRealtimeEvent } = require("../services/realtime");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const logger = require("../utils/logger");

// =========================
// HELPERLAR
// =========================

// technologies ni arrayga aylantirish
const toPublicProject = (project) => {
  if (!project) return project;

  if (typeof project.toJSON === "function") {
    return project.toJSON();
  }

  const publicProject = { ...project };
  delete publicProject.createdBy;

  return publicProject;
};

const parseTechnologies = (technologies) => {
  if (!technologies) return [];

  if (Array.isArray(technologies)) return technologies;

  if (typeof technologies === "string") {
    try {
      const parsed = JSON.parse(technologies);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // JSON bo'lmasa, quyida vergul bilan ajratilgan qiymat sifatida o'qiladi.
    }

    return technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// eski rasmni o'chirish
const deleteImage = async (imagePath) => {
  if (
    typeof imagePath !== "string" ||
    !imagePath.startsWith("/uploads/projects/")
  ) {
    return;
  }

  const uploadsRoot = path.resolve(__dirname, "../uploads/projects");
  const relativePath = imagePath.replace("/uploads/projects/", "");
  const fullPath = path.resolve(uploadsRoot, relativePath);

  if (!fullPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return;
  }

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger.error(
        { err: error, imagePath },
        "Project rasmini o'chirishda xatolik.",
      );
    }
  }
};

// =========================
// GET ALL PROJECTS
// =========================

exports.getAllProjects = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query, {
      defaultLimit: 12,
      maxLimit: 50,
    });

    const [projects, total] = await Promise.all([
      Project.find()
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Project.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Loyihalar muvaffaqiyatli yuklandi.",
      count: projects.length,
      pagination: buildPaginationMeta({
        ...pagination,
        total,
      }),
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
};

// =========================
// GET PROJECT BY ID
// =========================

exports.getProjectById = async (req, res, next) => {
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
    return next(error);
  }
};

// =========================
// CREATE PROJECT
// =========================

exports.createProject = async (req, res, next) => {
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

    const publicProject = toPublicProject(project);

    emitRealtimeEvent("projectCreated", publicProject);

    return res.status(201).json({
      success: true,
      message: "Loyiha muvaffaqiyatli yaratildi.",
      data: publicProject,
    });
  } catch (error) {
    if (req.file) {
      await deleteImage(`/uploads/projects/${req.file.filename}`);
    }

    return next(error);
  }
};
// =========================
// UPDATE PROJECT (PUT)
// =========================

exports.updateProject = async (req, res, next) => {
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

    const oldImage = project.image;

    if (req.file) {
      updateData.image = `/uploads/projects/${req.file.filename}`;
    } else {
      updateData.image = project.image;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      if (req.file) {
        await deleteImage(`/uploads/projects/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Loyiha yangilash vaqtida topilmadi.",
      });
    }

    if (req.file) {
      await deleteImage(oldImage);
    }

    const publicProject = toPublicProject(updatedProject);

    emitRealtimeEvent("projectUpdated", publicProject);

    return res.status(200).json({
      success: true,
      message: "Loyiha muvaffaqiyatli yangilandi.",
      data: publicProject,
    });
  } catch (error) {
    if (req.file) {
      await deleteImage(`/uploads/projects/${req.file.filename}`);
    }

    return next(error);
  }
};

// =========================
// PATCH PROJECT
// =========================

exports.patchProject = async (req, res, next) => {
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

    const allowedFields = [
      "title",
      "description",
      "technologies",
      "githubLink",
      "demoLink",
    ];

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
    );

    if (req.body.technologies) {
      updateData.technologies = parseTechnologies(req.body.technologies);
    }

    const oldImage = project.image;

    if (req.file) {
      updateData.image = `/uploads/projects/${req.file.filename}`;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      if (req.file) {
        await deleteImage(`/uploads/projects/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Loyiha yangilash vaqtida topilmadi.",
      });
    }

    if (req.file) {
      await deleteImage(oldImage);
    }

    const publicProject = toPublicProject(updatedProject);

    emitRealtimeEvent("projectUpdated", publicProject);

    return res.status(200).json({
      success: true,
      message: "Loyiha qisman yangilandi.",
      data: publicProject,
    });
  } catch (error) {
    if (req.file) {
      await deleteImage(`/uploads/projects/${req.file.filename}`);
    }

    return next(error);
  }
};

// =========================
// DELETE PROJECT
// =========================

exports.deleteProject = async (req, res, next) => {
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

    await project.deleteOne();

    await deleteImage(project.image);

    emitRealtimeEvent("projectDeleted", {
      id: project._id,
    });

    return res.status(200).json({
      success: true,
      message: "Loyiha muvaffaqiyatli o'chirildi.",
    });
  } catch (error) {
    return next(error);
  }
};
