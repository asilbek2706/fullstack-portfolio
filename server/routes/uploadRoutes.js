const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, upload, uploadImage);

module.exports = router;
