const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middlewares/authMiddleware");

const { 
  validateProjectInput, 
  checkProjectOwnerOrSuper 
} = require("../middlewares/projectMiddleware");

// 🔓 OCHIQ YO'LLAR (Hamma ko'ra oladi)
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);

// 🔒 HIMOYA QILINGAN YO'LLAR (Faqat tokeni/kukisi bor adminlar uchun)
router.post("/", protect, validateProjectInput, projectController.createProject);
router.put("/:id", protect, checkProjectOwnerOrSuper, validateProjectInput, projectController.updateProject);
router.patch("/:id", protect, checkProjectOwnerOrSuper, projectController.patchProject);
router.delete("/:id", protect, checkProjectOwnerOrSuper, projectController.deleteProject);

module.exports = router;