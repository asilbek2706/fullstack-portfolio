const express = require("express");
const router = express.Router();

const {
  getHealth,
  getReadiness,
} = require("../controllers/healthController");

router.get("/health", getHealth);
router.get("/ready", getReadiness);

module.exports = router;
