const express = require("express");

const authRoutes = require("./authRoutes");
const aboutRoutes = require("./aboutRoutes");
const faqRoutes = require("./faqRoutes");
const projectRoutes = require("./projectRoutes");
const contactRoutes = require("./contactRoutes");
const uploadRoutes = require("./uploadRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/about", aboutRoutes);
router.use("/faq", faqRoutes);
router.use("/projects", projectRoutes);
router.use("/contact", contactRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
