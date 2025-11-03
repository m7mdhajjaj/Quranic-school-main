const Attendance = require("../../schema/Attendance");

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);

    // Emit Socket.IO event for attendance deletion
    if (global.io && deletedAttendance) {
      console.log("📡 Broadcasting attendance deleted event");
      global.io.to("attendance").emit("attendanceDeleted", {
        _id: req.params.id,
        studentId: deletedAttendance.studentId,
        date: deletedAttendance.date,
        timestamp: Date.now(),
      });
    }

    res.json({ message: "تم حذف سجل الحضور بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
