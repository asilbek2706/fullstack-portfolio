const fs = require("fs");
const path = require("path");

// 1. Rasm yuklash (POST)
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Rasm yuklanmadi" });
  }

  const host = req.get("host");
  const imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;

  res.status(200).json({ success: true, url: imageUrl });
};

// 2. Rasm olish (GET) - Eng oxirgi yuklangan rasmni qaytaradi
exports.getImage = (req, res) => {
  const directoryPath = path.join(__dirname, "../uploads/");

  fs.readdir(directoryPath, (err, files) => {
    if (err || files.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Hali rasm yuklanmagan" });
    }

    // Fayllarni vaqt bo'yicha saralash (eng oxirgisini olish)
    const sortedFiles = files
      .map((file) => ({
        name: file,
        time: fs.statSync(path.join(directoryPath, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    const latestFile = sortedFiles[0].name;
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${latestFile}`;

    res.status(200).json({ success: true, url: imageUrl });
  });
};
