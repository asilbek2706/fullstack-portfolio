const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middlewares/uploadMiddleware");
const validateImageFile = require("../middlewares/validateImageFile");
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
  uploadImage,
);
router.get("/", require("../controllers/uploadController").getImage);
module.exports = router;
