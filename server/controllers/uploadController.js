exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Rasm yuklanmadi.",
    });
  }

  return res.status(201).json({
    success: true,
    url: req.file.imageKitUrl || `/uploads/${req.file.filename}`,
  });
};
