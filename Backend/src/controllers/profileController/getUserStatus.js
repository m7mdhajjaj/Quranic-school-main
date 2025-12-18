/**
 * Get User Status Controller
 * Handles fetching user online status and last seen
 * 
 * ✅ Updated to use PresenceService (Real-time Socket.io)
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const { isUserOnline } = require("../../services/PresenceService");

/**
 * @desc    Get user status by ID
 * @route   GET /api/profile/users/:id/status
 * @access  Private
 */
const getUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "معرف المستخدم مطلوب",
      });
    }

    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "معرف المستخدم غير صالح",
      });
    }

    // Try to find in students first, then teachers, then admins
    // Only get lastSeen from DB - isActive comes from PresenceService
    let user = await Student.findById(userId).select("lastSeen").lean();

    if (!user) {
      user = await Teacher.findById(userId).select("lastSeen").lean();
    }

    if (!user) {
      user = await Admin.findById(userId).select("lastSeen").lean();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // ✅ Get real-time status from PresenceService (Socket.io)
    const isActive = isUserOnline(userId);

    res.json({
      success: true,
      isActive, // Real-time from Socket.io
      lastSeen: user.lastSeen || null,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    console.error("Error details:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب حالة المستخدم",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserStatus,
};
