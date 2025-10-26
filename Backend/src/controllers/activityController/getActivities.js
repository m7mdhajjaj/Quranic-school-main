const Activity = require("../../schema/Activity");

/**
 * Get all activities
 * Returns activities sorted by date (newest first)
 */
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date: -1 }); // Newest first
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error getting activities:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب الأنشطة", error: error.message });
  }
};

/**
 * Get a single activity by ID
 */
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "النشاط غير موجود" });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error getting activity by ID:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب النشاط", error: error.message });
  }
};
