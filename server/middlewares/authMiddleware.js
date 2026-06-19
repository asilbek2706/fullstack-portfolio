const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// 1. Token va qurilmani tekshirish (Umumiy himoya)
const protect = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Ruxsat rad etildi! Token topilmadi." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🛡️ Xakerlikka qarshi: Qurilma (User-Agent) va IP nazorati
    const currentIp = req.ip || req.headers["x-forwarded-for"];
    if (
      decoded.userAgent !== req.headers["user-agent"] ||
      decoded.ip !== currentIp
    ) {
      return res
        .status(403)
        .json({
          message:
            "Xavfsizlik tizimi: Token boshqa qurilma yoki IP'dan o'g'irlangan!",
        });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Foydalanuvchi mavjud emas!" });
    }

    req.admin = admin; // Admin ma'lumotlarini keyingi bosqichga uzatamiz
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token yaroqsiz yoki muddati o'tgan!" });
  }
};

// 2. Faqat SuperAdminga ruxsat beruvchi filtr
const restrictToSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Ruxsat berilmagan! Bu amal faqat SuperAdmin uchun." });
  }
  next();
};

module.exports = { protect, restrictToSuperAdmin };
