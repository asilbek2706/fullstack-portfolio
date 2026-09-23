const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { env } = require("../config/env");
const { isOriginAllowed, isSameOrigin } = require("../config/cors");

// 1. Token va qurilmani tekshirish (Kuki tizimida avtomatik)
const protect = async (req, res, next) => {
  try {
    let token;

    // 🍪 1. Tokenni avtomatik Cookie (Kuki) ichidan qidiramiz
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;

      const unsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(req.method);

      const requestOrigin = req.get("origin");

      if (
        unsafeMethod &&
        (!requestOrigin ||
          (!isOriginAllowed(requestOrigin) &&
            !isSameOrigin(req, requestOrigin)))
      ) {
        return res.status(403).json({
          message: "So'rov manbasi tasdiqlanmadi.",
        });
      }
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
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "portfolio-api",
      audience: "portfolio-admin",
    });

    // Admin har bir requestda bazadan qayta tekshiriladi.
    const admin = await Admin.findById(decoded.id).select("+tokenVersion");

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Foydalanuvchi tizimda mavjud emas!" });
    }

    if (
      !Number.isInteger(decoded.tokenVersion) ||
      decoded.tokenVersion !== admin.tokenVersion
    ) {
      return res.status(401).json({
        message: "Sessiya bekor qilingan. Iltimos, qayta tizimga kiring.",
      });
    }

    // 🔑 Ikkala variantda ham xato bermasligi uchun req.user ga ham, req.admin ga ham yuklab qo'yamiz
    req.admin = admin;
    req.user = admin;

    next();
  } catch {
    return res.status(401).json({
      message: "Token yaroqsiz yoki muddati o'tgan!",
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
