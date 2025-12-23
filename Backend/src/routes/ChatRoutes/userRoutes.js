const express = require("express");
const router = express.Router();
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const { protect } = require("../../middleware/auth");

/**
 * Get user status (lastSeen)
 * @route GET /api/users/:id/status
 */
router.get("/:id/status", protect, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Try to find user in all collections
    let user = await Student.findById(userId).select("lastSeen");
    if (!user) {
      user = await Teacher.findById(userId).select("lastSeen");
    }
    if (!user) {
      user = await Admin.findById(userId).select("lastSeen");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
