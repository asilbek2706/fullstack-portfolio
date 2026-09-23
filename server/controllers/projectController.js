const Project = require("../models/Project");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const { emitRealtimeEvent } = require("../services/realtime");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const logger = require("../utils/logger");
const imageKit = require("../services/imageKit");

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
  delete publicProject.imageFileId;

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

const getUploadedImage = (file) => ({
  url: file.imageKitUrl || `/uploads/projects/${file.filename}`,
  fileId: file.imageKitFileId,
});

const deleteStoredImage = async ({ url, fileId }, uploadedFile) => {
  if (fileId) {
    try {
      await imageKit.deleteImage(fileId);

      if (uploadedFile) {
        uploadedFile.imageKitCleaned = true;
      }

      return;
    } catch (error) {
      logger.error(
        { err: error, fileId },
        "ImageKit project rasmini o'chirishda xatolik.",
      );

      return;
    }
  }

  await deleteImage(url);
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
      data: projects.map(toPublicProject),
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
      data: toPublicProject(project),
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
    const uploadedImage = getUploadedImage(req.file);

    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      technologies,
      githubLink: req.body.githubLink,
      demoLink: req.body.demoLink || "",
      image: uploadedImage.url,
      ...(uploadedImage.fileId && {
        imageFileId: uploadedImage.fileId,
      }),
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
      await deleteStoredImage(getUploadedImage(req.file), req.file);
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
    const oldImageFileId = project.imageFileId;

    if (req.file) {
      const uploadedImage = getUploadedImage(req.file);

      updateData.image = uploadedImage.url;

      if (uploadedImage.fileId) {
        updateData.imageFileId = uploadedImage.fileId;
      }
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
      await deleteStoredImage({
        url: oldImage,
        fileId: oldImageFileId,
      });
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
      await deleteStoredImage(getUploadedImage(req.file), req.file);
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
    const oldImageFileId = project.imageFileId;

    if (req.file) {
      const uploadedImage = getUploadedImage(req.file);

      updateData.image = uploadedImage.url;

      if (uploadedImage.fileId) {
        updateData.imageFileId = uploadedImage.fileId;
      }
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
      await deleteStoredImage({
        url: oldImage,
        fileId: oldImageFileId,
      });
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
      await deleteStoredImage(getUploadedImage(req.file), req.file);
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

    await deleteStoredImage({
      url: project.image,
      fileId: project.imageFileId,
    });

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
