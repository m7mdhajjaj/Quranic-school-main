/**
 * Get Edit Limits Controller
 * Returns edit limits information for restricted fields (like birthDate)
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

/**
 * @desc    Get edit limits for a specific field
 * @route   GET /api/profile/edit-limits/:field
 * @access  Private
 */
const getEditLimits = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || "student";
    const { field } = req.params;

    // Only allow birthDate for now
    if (field !== "birthDate") {
      return res.status(400).json({
        success: false,
        message: "الحقل غير مدعوم",
      });
    }

    // Get user with edit history
    let user;
    if (userType === "student") {
      user = await Student.findById(userId).select("birthDateEditHistory");
    } else if (userType === "admin") {
      user = await Admin.findById(userId).select("birthDateEditHistory");
    } else {
      user = await Teacher.findById(userId).select("birthDateEditHistory");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Calculate edit limits
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentEdits =
      user.birthDateEditHistory?.filter(
        (edit) => new Date(edit.editDate) >= oneMonthAgo
      ) || [];

    const editCount = recentEdits.length;
    const allowed = editCount < 2;
    const remaining = Math.max(0, 2 - editCount);

    res.json({
      success: true,
      field: "birthDate",
      editLimit: {
        allowed,
        remaining,
        count: editCount,
        maxEdits: 2,
        periodDays: 30,
      },
    });
  } catch (error) {
    console.error("Error getting edit limits:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

module.exports = {
  getEditLimits,
};
