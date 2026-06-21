const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");

router
  .route("/")
  .get(faqController.getFAQs)
  .post(protect, restrictToSuperAdmin, faqController.createFAQ);

router
  .route("/:id")
  .put(protect, restrictToSuperAdmin, faqController.updateFAQ)
  .delete(protect, restrictToSuperAdmin, faqController.deleteFAQ);

module.exports = router;
