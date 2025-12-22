const express = require("express");
const router = express.Router();
const newsController = require("../../controllers/NewsController");
const { protect } = require("../../middleware/auth");
const { uploadNews } = require("../../config/multer");
const { validateNewsData } = require("../../Validation/News/NewsValidation");

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

// Create single news item with multiple images upload (up to 10)
router.post("/", protect, (req, res, next) => {
  console.log('🔍 POST /api/news route hit');
  console.log('📋 Headers:', req.headers);
  uploadNews.array("images", 10)(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'خطأ في رفع الصور',
        error: err.message
      });
    }
    console.log('✅ Multer processed successfully');
    console.log('📎 Files:', req.files?.length || 0);
    console.log('📋 Body:', req.body);
    next();
  });
}, validateNewsData, newsController.createNews);

// Create multiple news items (bulk)
router.post("/bulk", protect, newsController.createBulkNews);

// ============================================================================
// PUT ROUTES
// ============================================================================

// Publish news item
router.put("/:id/publish", protect, newsController.publishNews);

// Update single news item with multiple images
router.put("/:id", protect, uploadNews.array("images", 10), validateNewsData, newsController.updateNews);

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
