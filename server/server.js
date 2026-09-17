require("dotenv").config({ quiet: true });

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
const crypto = require("crypto");
const { Server } = require("socket.io");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger");


const projectRoutes = require("./routes/projectRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const faqRoutes = require("./routes/faqRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info({ uploadDir }, "Uploads papkasi yaratildi.");
}

const app = express();
const server = http.createServer(app);

server.on("error", async (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      { port: process.env.PORT || 8080 },
      "Port boshqa process tomonidan ishlatilmoqda.",
    );
  } else {
    logger.error({ err: error }, "HTTP server xatoligi.");
  }

  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,

    genReqId: (req, res) => {
      const incomingId = req.headers["x-request-id"];

      const requestId =
        typeof incomingId === "string" &&
        /^[A-Za-z0-9._-]{1,100}$/.test(incomingId)
          ? incomingId
          : crypto.randomUUID();

      res.setHeader("X-Request-Id", requestId);
      return requestId;
    },

    customLogLevel: (req, res, error) => {
      if (error || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },

    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} completed`,

    customErrorMessage: (req, res) =>
      `${req.method} ${req.url} failed`,
  }),
);

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
  logger.debug(
    { socketId: socket.id },
    "Socket foydalanuvchisi ulandi.",
  );
  socket.on("disconnect", (reason) => {
    logger.debug(
      { socketId: socket.id, reason },
      "Socket foydalanuvchisi uzildi.",
    );
  });
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

    logger.info("MongoDB-ga muvaffaqiyatli ulandi.");

    server.listen(PORT, () => {
      logger.info({ port: PORT }, "Server ishga tushdi.");
    });
  } catch (error) {
    logger.fatal({ err: error }, "Server ishga tushmadi.");
    process.exit(1);
  }
};

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, "Server yopilmoqda.");

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
    logger.info("MongoDB ulanishi yopildi.");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Serverni yopishda xatolik.");
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
