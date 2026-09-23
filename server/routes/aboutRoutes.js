const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");
const aboutImage = require("../middlewares/aboutImage");
const validateImageFile = require("../middlewares/validateImageFile");
const cleanupFailedUpload = require("../middlewares/cleanupFailedUpload");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");

router.get("/", aboutController.getAbout);

router.put(
  "/",
  protect,
  restrictToSuperAdmin,
  aboutImage.single("avatar"),
  validateImageFile,
  cleanupFailedUpload,
  aboutController.updateAbout,
);

module.exports = router;
