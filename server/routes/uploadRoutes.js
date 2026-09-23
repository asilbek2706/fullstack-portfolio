const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middlewares/uploadMiddleware");
const validateImageFile = require("../middlewares/validateImageFile");
const cleanupFailedUpload = require("../middlewares/cleanupFailedUpload");
const createImageKitUpload = require("../middlewares/uploadToImageKit");

const uploadGeneralToImageKit = createImageKitUpload("uploads");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  protect,
  restrictToSuperAdmin,
  upload.single("image"),
  validateImageFile,
  uploadGeneralToImageKit,
  cleanupFailedUpload,
  uploadImage,
);
module.exports = router;
