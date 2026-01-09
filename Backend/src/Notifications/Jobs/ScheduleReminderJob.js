const cron = require("node-cron");
const mongoose = require("mongoose");
const Section = require("../../schema/DailyMark/Section");
const Teacher = require("../../schema/Teacher");

/**
 * Schedule Reminder Job
 * Runs every 3 hours to remind teachers to set schedules for their sections.
 */
class ScheduleReminderJob {
  /**
   * @param {NotificationManager} notificationManager
   */
  constructor(notificationManager) {
    this.notificationManager = notificationManager;
  }

  /**
   * Setup the cron job
   */
  setupScheduleReminders() {
    // Run every 3 hours: minute=0, hour=*/3 (0,3,6,9,12,15,18,21)
    cron.schedule("0 */3 * * *", () => {
      console.log("🕒 Running Schedule Reminder Job...");
      this.checkAndNotifyUnscheduledSections();
    });
    
    console.log("✅ Schedule Reminder Job initialized (Every 3 Hours)");
  }

  /**
   * Logic to find unscheduled sections and notify teachers
   */
  async checkAndNotifyUnscheduledSections() {
    try {
      // Logic:
      // 1. Timetable is missing/null
      // 2. Section date is >= Today (Not expired)
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today (00:00)

      const unscheduledSections = await Section.find({
        $and: [
          {
            $or: [
              { timetableId: { $exists: false } },
              { timetableId: null }
            ]
          },
          { date: { $gte: today } } 
        ]
      });

      if (unscheduledSections.length === 0) {
        return;
      }

      console.log(`Found ${unscheduledSections.length} unscheduled sections. Sending reminders...`);

      for (const section of unscheduledSections) {
        if (!section.teacher) continue;

        let recipientId = section.teacher;

        // Ensure teacher is a valid ID since Notification requires ObjectId
        if (!mongoose.Types.ObjectId.isValid(section.teacher)) {
             // Try to resolve teacher by name (Legacy support)
             // Assumes format "First Last"
             const nameParts = section.teacher.trim().split(/\s+/);
             if (nameParts.length >= 2) {
                 const firstName = nameParts[0];
                 const lastName = nameParts[nameParts.length - 1]; // Fallback simple matching
                 
                 // Try to find teacher
                 const teacherDoc = await Teacher.findOne({
                     firstName: new RegExp(firstName, 'i'),
                     lastName: new RegExp(lastName, 'i')
                 });

                 if (teacherDoc) {
                     recipientId = teacherDoc._id;
                     console.log(`✅ Resolved teacher name '${section.teacher}' to ID: ${recipientId}`);
                 } else {
                     console.warn(`⚠️ Skipped section ${section._id}: Could not resolve Name '${section.teacher}' to a Teacher ID.`);
                     continue;
                 }
             } else {
                 console.warn(`⚠️ Skipped section ${section._id}: Teacher '${section.teacher}' is not a valid ObjectId and name parsing failed.`);
                 continue;
             }
        }

        // Create notification
        try {
          await this.notificationManager.createNotification({
             recipient: recipientId,
             recipientModel: "Teacher",
             title: "تذكير: تحديد موعد للحلقة",
             message: "يرجى تحديد موعد لهذه الحلقة في الجدول.",
             type: "system", 
             link: "/daily-marks",
             relatedId: section._id,
             isRead: false,
             createdAt: new Date()
          });
        } catch (err) {
          console.error(`Failed to send reminder for section ${section._id}:`, err.message);
        }
      }

    } catch (error) {
       console.error("❌ Schedule Reminder Job Error:", error);
    }
  }
}

module.exports = ScheduleReminderJob;
