const cron = require("node-cron");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const Warning = require("../../schema/Warning");

/**
 * Warning Job Module
 * Handles automated tasks related to warnings and suspensions
 */
class WarningJob {
  constructor() {
    // No specific initialization needed
  }

  /**
   * Setup warning related cron jobs
   */
  setupWarningJobs() {
    // Run every day at 3:00 AM
    // Check for students with permanent suspension (3rd warning) who are still in groups
    cron.schedule("0 3 * * *", () => {
      console.log("🚫 Running permanent suspension enforcement job...");
      this.enforcePermanentSuspensions();
    });

    console.log("🛡️ Warning enforcement jobs scheduled");
  }

  /**
   * Enforce permanent suspensions
   * Removes students from groups if they have an active 'third' or 'expulsion' warning
   */
  async enforcePermanentSuspensions() {
    try {
      // 1. Find all active permanent suspension warnings
      const suspensionWarnings = await Warning.find({
        type: { $in: ["third", "expulsion"] },
        isActive: true
      }).select("studentId");

      if (suspensionWarnings.length === 0) {
        return;
      }

      const suspendedStudentIds = suspensionWarnings.map(w => w.studentId);

      // 2. Find students who are supposed to be suspended but are currently in a group
      const studentsInViolation = await Student.find({
        _id: { $in: suspendedStudentIds },
        group: { $ne: null } // Student has a group assigned
      }).populate("group");

      console.log(`🔍 Found ${studentsInViolation.length} students violating suspension terms`);

      // 3. Remove them from groups
      for (const student of studentsInViolation) {
        if (!student.group) continue;

        const groupName = student.group.name;
        const groupId = student.group._id;

        console.log(`⚠️ Enforcing suspension for student: ${student.firstName} ${student.lastName} (Removing from ${groupName})`);

        // Remove from Group students array
        await Group.findByIdAndUpdate(groupId, {
          $pull: { students: student._id }
        });

        // Remove group from Student
        student.group = null;
        student.teacher = null; // ✅ إزالة المعلم أيضاً عند الفصل التلقائي
        await student.save();

        console.log(`✅ Suspension enforced for ${student._id}`);
      }

    } catch (error) {
      console.error("❌ Error in enforcePermanentSuspensions:", error);
    }
  }
}

module.exports = new WarningJob();
