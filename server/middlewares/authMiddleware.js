const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// 1. Token va qurilmani tekshirish (Kuki tizimida avtomatik)
const protect = async (req, res, next) => {
  try {
    let token;

    // 🍪 1. Tokenni avtomatik Cookie (Kuki) ichidan qidiramiz
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Agar kuki o'chirilgan bo'lsa (yoki eski front-end uchun zaxira usul bo'lib tursin)
    if (
      !token &&
      req.header("Authorization") &&
      req.header("Authorization").startsWith("Bearer ")
    ) {
      token = req.header("Authorization").split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message:
          "Ruxsat rad etildi! Iltimos, tizimga kiring (Token topilmadi).",
      });
    }

    // 2. Tokenni shifrdan ochamiz
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🛡️ Xavfsizlik nazorati: Qurilma (User-Agent) va IP tekshiruvi
    const currentIp = req.ip || req.headers["x-forwarded-for"];
    console.log("=== XAVFSIZLIK TEKSHIRUVI ===");
    console.log("Token ichidagi IP:", decoded.ip, " | Hozirgi IP:", currentIp);
    console.log(
      "Token ichidagi UA:",
      decoded.userAgent,
      " | Hozirgi UA:",
      req.headers["user-agent"],
    );
    console.log("=============================");
    
    // LOYIHA LOCALHOST-DA MUAMMOSIZ ISHLASHI UCHUN FAQAT USER-AGENT TEKSHIRILADI
    if (
      decoded.userAgent !== req.headers["user-agent"]
    ) {
      return res.status(403).json({
        message:
          "Xavfsizlik tizimi: Token boshqa qurilma yoki IP-manzildan o'g'irlangan!",
      });
    }

    // 3. Bazadan adminni qidiramiz
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Foydalanuvchi tizimda mavjud emas!" });
    }

    // 🔑 Ikkala variantda ham xato bermasligi uchun req.user ga ham, req.admin ga ham yuklab qo'yamiz
    req.admin = admin;
    req.user = admin;

    next();
  } catch (error) {
    // 🚨 KONSOLGA HAQIQIY XATOLIKNI CHIQARISH (BU SIZGA TERMINALDA MUAMMONI KO'RSATADI)
    console.error("❌ JWT VERIFY XATOLIGI:", error.message);
    
    return res
      .status(401)
      .json({ 
        message: "Token yaroqsiz yoki muddati o'tgan!",
        error: error.message // muammo nimadaligini bilish uchun javobga ham qo'shildi
      });
  }
};

// 2. Faqat SuperAdminga ruxsat beruvchi filtr
const restrictToSuperAdmin = (req, res, next) => {
  const currentUser = req.admin || req.user;

  if (!currentUser || currentUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Ruxsat berilmagan! Bu amal faqat SuperAdmin uchun." });
  }
  next();
};

module.exports = { protect, restrictToSuperAdmin };