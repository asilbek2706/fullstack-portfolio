const upload = require("../middlewares/uploadMiddleware"); // Multer config

exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Rasm yuklanmadi" });
  }
  // Rasm saqlangan yo'l (URL)
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url: imageUrl });
};
