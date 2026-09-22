const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const {
  protect,
  restrictToSuperAdmin,
} = require("../middlewares/authMiddleware");
const validateFaq = require("../middlewares/validateFaq");

router
  .route("/")
  .get(faqController.getFAQs)
  .post(protect, restrictToSuperAdmin, validateFaq, faqController.createFAQ);

router
  .route("/:id")
  .put(protect, restrictToSuperAdmin, validateFaq, faqController.updateFAQ)
  .delete(protect, restrictToSuperAdmin, faqController.deleteFAQ);

module.exports = router;
