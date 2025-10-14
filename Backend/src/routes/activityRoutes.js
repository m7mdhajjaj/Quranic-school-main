const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");
const { validateActivityData } = require("../Validation/ActivityValidation");

// Get all activities - require authentication
router.get("/", protect, activityController.getAllActivities);

// Get activity by ID - require authentication
router.get("/:id", protect, activityController.getActivityById);

// Create activity - تعطيل الـ validation مؤقتاً
router.post("/", activityController.createActivity);

// Update activity - تعطيل الـ validation مؤقتاً
router.put("/:id", activityController.updateActivity);

// Delete activity
router.delete("/:id", activityController.deleteActivity);

module.exports = router;
