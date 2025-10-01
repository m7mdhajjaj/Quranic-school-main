const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { restrictAdmin } = require("../middleware/authMiddleware");

// Create directories for uploads if they don't exist
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "../../public/uploads/news");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory:", uploadDir);
} else {
  console.log("Uploads directory exists:", uploadDir);
}

// Get all news - منع الأدمن من الوصول
router.get("/", restrictAdmin, newsController.getAllNews);

// Get news by ID - منع الأدمن من الوصول
router.get("/:id", restrictAdmin, newsController.getNewsById);

// Create news (with image upload)
router.post("/", newsController.uploadNewsImage, newsController.createNews);

// Update news (with optional image upload)
router.put("/:id", newsController.uploadNewsImage, newsController.updateNews);

// Delete news
router.delete("/:id", newsController.deleteNews);

module.exports = router;
