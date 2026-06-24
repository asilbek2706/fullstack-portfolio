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

const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const projectRoutes = require("./routes/projectRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const faqRoutes = require("./routes/faqRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://fullstack-portfolio-81mm.onrender.com",
];
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

app.use(helmet());

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (let key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB-ga muvaffaqiyatli ulandik! 🍃"))
  .catch((err) => console.error("MongoDB ulanishda xatolik:", err));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(
    `Xavfsiz server HTTP va Websocket bilan ${PORT}-portda gurlab ishlamoqda... 🚀`,
  ),
);
