const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const ScheduleReminderJob = require("../Notifications/Jobs/ScheduleReminderJob");
const NotificationManager = require("../Notifications/Core/NotificationManager");

async function runTest() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quranic-school");
    console.log("✅ Connected to MongoDB");

    // Mock IO object since we are running a script, not the server
    const mockIo = {
      to: () => ({ emit: () => {} }),
      emit: () => {}
    };

    console.log("🔧 Initializing Notification Manager...");
    const notificationManager = new NotificationManager(mockIo);
    
    // Disable other jobs that might auto-start in NotificationManager constructor if necessary
    // (In this case, PrayerJob starts, but the process will exit soon anyway)

    console.log("🚀 Initializing Schedule Reminder Job...");
    const reminderJob = new ScheduleReminderJob(notificationManager);

    console.log("▶️ Manually triggering checkAndNotifyUnscheduledSections()...");
    await reminderJob.checkAndNotifyUnscheduledSections();

    console.log("✅ Test completed successfully.");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected.");
    process.exit(0);
  }
}

runTest();
