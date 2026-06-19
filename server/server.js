const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(helmet()); 
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj instanceof Object) {
            for (let key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
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
  message: { message: "So'rovlar juda ko'p, iltimos 15 daqiqadan keyin urinib ko'ring." },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

app.use(
  cors({ 
    origin: ["http://localhost:5000", "https://shaxsiy_saytingiz.uz"],
    credentials: true
  }),
);

app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB-ga muvaffaqiyatli ulandik! 🍃"))
  .catch((err) => console.error("MongoDB ulanishda xatolik:", err));

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () =>
  console.log(`Xavfsiz server ${PORT}-portda gurlab ishlamoqda... 🚀`),
);