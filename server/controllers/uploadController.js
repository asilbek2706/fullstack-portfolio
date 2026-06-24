exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Rasm yuklanmadi" });
  }

  const host = req.get("host");
  const imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;

  res.status(200).json({ success: true, url: imageUrl });
};
