const express = require("express");
const router = express.Router();
const newsController = require("../../controllers/NewsController");
const { protect } = require("../../middleware/authMiddleware");
const { uploadNews } = require("../../config/multer");
const { validateNewsData } = require("../../Validation/NewsValidation");

// ============================================================================
// GET ROUTES
// ============================================================================

// Get all news with pagination and status filter
router.get("/", protect, newsController.getAllNews);

// Get published news only
router.get("/published", protect, newsController.getPublishedNews);

// Search news by title or content
router.get("/search/:query", protect, newsController.searchNews);

// Get single news by ID
router.get("/:id", protect, newsController.getNewsById);

// ============================================================================
// POST ROUTES
// ============================================================================

// Create single news item with image upload
router.post("/", protect, uploadNews.single("image"), validateNewsData, newsController.createNews);

// Create multiple news items (bulk)
router.post("/bulk", protect, newsController.createBulkNews);

// ============================================================================
// PUT ROUTES
// ============================================================================

// Publish news item
router.put("/:id/publish", protect, newsController.publishNews);

// Update single news item
router.put("/:id", protect, uploadNews.single("image"), validateNewsData, newsController.updateNews);

// Update multiple news items (bulk)
router.put("/bulk", protect, newsController.updateBulkNews);

// Increment news view count
router.put("/:id/view", newsController.incrementViews);

// Archive news item (soft delete)
router.put("/:id/archive", protect, newsController.archiveNews);

// ============================================================================
// DELETE ROUTES
// ============================================================================

// Delete single news item
router.delete("/:id", protect, newsController.deleteNews);

// Delete multiple news items (bulk)
router.delete("/bulk", protect, newsController.deleteBulkNews);

// Clear all archived news
router.delete("/clear-archived", protect, newsController.clearArchivedNews);

module.exports = router;
