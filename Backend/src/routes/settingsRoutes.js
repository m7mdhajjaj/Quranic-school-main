// ============================================================================
// Settings Routes - Hero Image and Site Settings
// ============================================================================

const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { uploadHero, uploadLogo } = require("../config/multer");
const { protect } = require("../middleware/authMiddleware");

// ========== Hero Image Routes ==========
// Get hero image (public - no auth required)
router.get("/hero-image", settingsController.getHeroImage);

// Upload/Update hero image (admin only)
router.post(
  "/hero-image",
  protect,
  uploadHero.single("image"),
  settingsController.uploadHeroImage
);

// ========== Logo Routes ==========
// Get logo (public - no auth required)
router.get("/logo", settingsController.getLogo);

// Upload/Update logo (admin only)
router.post(
  "/logo",
  protect,
  uploadLogo.single("image"),
  settingsController.uploadLogo
);

module.exports = router;
