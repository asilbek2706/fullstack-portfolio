const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middlewares/authMiddleware");

// 🔓 OCHIQ YO'LLAR (Hamma ko'ra oladi)
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);

// 🔒 HIMOYA QILINGAN YO'LLAR (Faqat tokeni bor superadmin yoki adminlar uchun)
router.post("/", protect, projectController.createProject);
router.put("/:id", protect, projectController.updateProject);
router.patch("/:id", protect, projectController.patchProject);
router.delete("/:id", protect, projectController.deleteProject);

module.exports = router;