const About = require("../models/About"); // Sening About modeling

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Rasm yuklanmadi" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  try {
    // 1. Bazada oxirgi ma'lumotni topamiz va rasmni yangilaymiz
    // 'About' modeli bitta deb faraz qilamiz
    await About.findOneAndUpdate(
      {},
      { avatar: imageUrl },
      { new: true, upsert: true },
    );

    res.status(200).json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bazaga yozishda xato" });
  }
};

// 2. GET endi fs.readdir emas, bazadan o'qiydi
exports.getImage = async (req, res) => {
  try {
    const data = await About.findOne({});
    if (!data || !data.avatar)
      return res.status(404).json({ message: "Rasm yo'q" });

    res.status(200).json({ success: true, url: data.avatar });
  } catch (error) {
    res.status(500).json({ message: "Bazadan o'qishda xato" });
  }
};
