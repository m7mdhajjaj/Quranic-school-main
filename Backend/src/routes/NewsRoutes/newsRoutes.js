const express = require("express");
const router = express.Router();
const newsController = require("../../controllers/News/newsController");
const { protect } = require("../../middleware/authMiddleware");
const { validateNewsData } = require("../../Validation/NewsValidation");

// Get all news - require authentication
router.get("/", protect, newsController.getAllNews);

// Get news by ID - require authentication
router.get("/:id", protect, newsController.getNewsById);

// Create news - expects JSON data with imageUrl
router.post("/", protect, validateNewsData, newsController.createNews);

// Update news - expects JSON data with imageUrl
router.put("/:id", protect, validateNewsData, newsController.updateNews);

// Delete news
router.delete("/:id", protect, newsController.deleteNews);

module.exports = router;
