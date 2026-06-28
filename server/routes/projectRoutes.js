const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");

const { protect } = require("../middlewares/authMiddleware");

const upload = require("../middlewares/projectImage");

const {
  validateProjectInput,
  checkProjectOwnerOrSuper,
} = require("../middlewares/projectMiddleware");

// ==========================
// PUBLIC ROUTES
// ==========================

// Barcha loyihalar
router.get("/", projectController.getAllProjects);

// Bitta loyiha
router.get("/:id", projectController.getProjectById);

// ==========================
// PROTECTED ROUTES
// ==========================

// CREATE
router.post(
  "/",
  protect,
  upload.single("image"),
  validateProjectInput,
  projectController.createProject,
);

// UPDATE (PUT)
router.put(
  "/:id",
  protect,
  checkProjectOwnerOrSuper,
  upload.single("image"),
  validateProjectInput,
  projectController.updateProject,
);

// PATCH
router.patch(
  "/:id",
  protect,
  checkProjectOwnerOrSuper,
  upload.single("image"),
  projectController.patchProject,
);

// DELETE
router.delete(
  "/:id",
  protect,
  checkProjectOwnerOrSuper,
  projectController.deleteProject,
);

module.exports = router;
