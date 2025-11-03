// ============================================
// GET TIMETABLE OPERATIONS
// ============================================

const Session = require("../../schema/Session");

/**
 * الحصول على جميع المواعيد
 */
exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Session.find();
    res.json(timetables);
  } catch (err) {
    console.error("Error fetching timetables:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "حدث خطأ أثناء جلب المواعيد"
    });
  }
};
