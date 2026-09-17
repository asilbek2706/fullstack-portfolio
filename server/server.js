const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const path = require("path");
const fs = require("fs");

const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const projectRoutes = require("./routes/projectRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const faqRoutes = require("./routes/faqRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Uploads papkasi yaratildi!");
}

const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log(`Foydalanuvchi tarmoqqa ulandi: ${socket.id}`);
  socket.on("disconnect", () => console.log("Foydalanuvchi uzildi"));
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use((req, res, next) => {
  const blockedKeys = new Set([
    "__proto__",
    "prototype",
    "constructor",
  ]);

  const sanitize = (value) => {
    if (!value || typeof value !== "object") return;

    for (const key of Object.keys(value)) {
      if (
        key.startsWith("$") ||
        key.includes(".") ||
        blockedKeys.has(key)
      ) {
        delete value[key];
        continue;
      }

      sanitize(value[key]);
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    message: "So'rovlar juda ko'p, iltimos 15 daqiqadan keyin urinib ko'ring.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    message: "Xabar yuborish limiti tugadi. Iltimos, birozdan keyin urining.",
  },
});
app.use("/api/contact", contactLimiter);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Routerlar
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    const requiredEnv = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];
    const missingEnv = requiredEnv.filter((name) => !process.env[name]);

    if (missingEnv.length > 0) {
      throw new Error(
        `Majburiy environment qiymatlari topilmadi: ${missingEnv.join(", ")}`,
      );
    }

    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET kamida 32 ta belgidan iborat bo'lishi kerak.",
      );
    }

    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 10000,
    });

    if (isShuttingDown) {
      await mongoose.disconnect();
      return;
    }

    console.log("MongoDB-ga muvaffaqiyatli ulandik! 🍃");

    server.listen(PORT, () => {
      console.log(`Server ${PORT}-portda ishlamoqda. 🚀`);
    });
  } catch (error) {
    console.error("Server ishga tushmadi:", error.message);
    process.exit(1);
  }
};

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} qabul qilindi. Server yopilmoqda...`);

  try {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) return reject(error);
          resolve();
        });
      });
    }

    await mongoose.disconnect();
    console.log("MongoDB ulanishi yopildi.");
    process.exit(0);
  } catch (error) {
    console.error("Serverni yopishda xatolik:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
