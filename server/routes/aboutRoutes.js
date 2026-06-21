const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");
const { protect, restrictToSuperAdmin } = require("../middlewares/authMiddleware");

router.get("/", aboutController.getAbout);
router.put("/", protect, restrictToSuperAdmin, aboutController.updateAbout);

module.exports = router;