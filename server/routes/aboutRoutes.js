const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");
const aboutImage = require("../middlewares/aboutImage");
const validateImageFile = require("../middlewares/validateImageFile");
const cleanupFailedUpload = require("../middlewares/cleanupFailedUpload");
const createImageKitUpload = require("../middlewares/uploadToImageKit");

const uploadAboutToImageKit = createImageKitUpload("about");
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
  uploadAboutToImageKit,
  cleanupFailedUpload,
  aboutController.updateAbout,
);

module.exports = router;
