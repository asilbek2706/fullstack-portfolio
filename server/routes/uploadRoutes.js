const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", upload.single("image"), uploadImage);
router.get("/", require("../controllers/uploadController").getImage);
module.exports = router;
