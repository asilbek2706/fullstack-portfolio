const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");

const swaggerSpec = require("./swagger");
const logger = require("./utils/logger");
const { corsOptions } = require("./config/cors");

const requestLogger = require("./middlewares/requestLogger");
const sanitizeRequest = require("./middlewares/sanitizeRequest");
const { globalLimiter } = require("./middlewares/rateLimiters");

const apiRoutes = require("./routes");
const systemRoutes = require("./routes/systemRoutes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info({ uploadDir }, "Uploads papkasi yaratildi.");
}

app.set("trust proxy", 1);

app.use(requestLogger);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(uploadDir, {
    dotfiles: "deny",
    index: false,
    etag: true,
    lastModified: true,
    maxAge: "1y",
    immutable: true,
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

app.use(sanitizeRequest);

// Hosting health-checklari rate limitdan mustasno.
app.use(systemRoutes);

app.use(globalLimiter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
