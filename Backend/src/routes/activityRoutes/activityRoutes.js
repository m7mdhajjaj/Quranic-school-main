const express = require("express");
const router = express.Router();
const activityController = require("../../controllers/activityController");
const { protect } = require("../../middleware/auth");
const { uploadActivity } = require("../../config/multer");
const { validateActivityData } = require("../../Validation/Activity");

// Get all activities - require authentication
router.get("/", protect, activityController.getAllActivities);

// Get activity by ID - require authentication
router.get("/:id", protect, activityController.getActivityById);

// Create activity - with image upload and validation
router.post("/", protect, uploadActivity.single("image"), validateActivityData, activityController.createActivity);

// Update activity - with image upload and validation
router.put("/:id", protect, uploadActivity.single("image"), validateActivityData, activityController.updateActivity);

// Delete activity
router.delete("/:id", protect, activityController.deleteActivity);

module.exports = router;
