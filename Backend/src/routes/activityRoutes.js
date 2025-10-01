const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

// Create directories for uploads if they don't exist
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "../../public/uploads/activities");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created activities uploads directory:", uploadDir);
} else {
  console.log("Activities uploads directory exists:", uploadDir);
}

// Get all activities - require authentication
router.get("/", protect, activityController.getAllActivities);

// Get activity by ID - require authentication
router.get("/:id", protect, activityController.getActivityById);

// Create activity (with image upload)
router.post(
  "/",
  activityController.uploadActivityImage,
  activityController.createActivity,
);

// Update activity (with optional image upload)
router.put(
  "/:id",
  activityController.uploadActivityImage,
  activityController.updateActivity,
);

// Delete activity
router.delete("/:id", activityController.deleteActivity);

module.exports = router;
