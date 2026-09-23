const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");

const swaggerSpec = require("./swagger");
const logger = require("./utils/logger");
const { env } = require("./config/env");
const { httpCorsOptions } = require("./config/cors");

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

app.use(cors(httpCorsOptions));
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

const swaggerCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://www.recaptcha.net",
    ],
    frameSrc: [
      "'self'",
      "https://www.google.com",
      "https://www.recaptcha.net",
      "https://recaptcha.google.com",
    ],
    connectSrc: [
      "'self'",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://www.recaptcha.net",
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "data:", "https:"],
    upgradeInsecureRequests: null,
  },
});

const swaggerUiOptions = {
  customCss: ".grecaptcha-badge { visibility: hidden !important; }",
  customJs: [
    `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
      env.recaptchaSiteKey,
    )}`,
    "/swagger/recaptcha-config.js",
  ],
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
    requestInterceptor: async (request) => {
      const requestUrl = new URL(request.url, globalThis.location.origin);
      const method = String(request.method || "").toUpperCase();

      if (method !== "POST" || requestUrl.pathname !== "/api/contact") {
        return request;
      }

      const config = globalThis.__SWAGGER_RECAPTCHA__;

      if (!config?.siteKey || !globalThis.grecaptcha) {
        throw new Error("reCAPTCHA Swagger UI ichida yuklanmadi.");
      }

      await new Promise((resolve) => {
        globalThis.grecaptcha.ready(resolve);
      });

      const token = await globalThis.grecaptcha.execute(config.siteKey, {
        action: config.action,
      });

      const body =
        typeof request.body === "string"
          ? JSON.parse(request.body)
          : { ...(request.body || {}) };

      request.body = JSON.stringify({
        ...body,
        recaptchaToken: token,
      });

      return request;
    },
  },
};

app.use("/swagger", swaggerCsp);

app.get("/swagger/recaptcha-config.js", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.type("application/javascript");

  return res.send(
    `globalThis.__SWAGGER_RECAPTCHA__ = ${JSON.stringify({
      siteKey: env.recaptchaSiteKey,
      action: env.recaptchaAction,
    })};`,
  );
});

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
