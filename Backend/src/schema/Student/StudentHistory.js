// ============================================================================
// schema/Student/StudentHistory.js - Student History Schema
// ============================================================================
// Moved from root schema folder for better organization

const mongoose = require("mongoose");

const studentHistorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // نوع الحدث
    eventType: {
      type: String,
      enum: [
        "WARNING",        // إنذار (تنبيه، أول، ثاني، ثالث)
        "GROUP_CHANGE",   // نقل من حلقة لأخرى
        "GROUP_REMOVAL",  // إزالة من حلقة
        "EXPULSION",      // فصل نهائي
        "RESTORATION"     // إعادة بعد فصل
      ],
      required: true,
      index: true,
    },

    // مستوى الإنذار (فقط إذا eventType = "WARNING")
    warningLevel: {
      type: String,
      enum: ["warning", "first", "second", "third"],
      required: function() {
        return this.eventType === "WARNING";
      }
    },

    reason: {
      type: String,
      required: true,
    },

    // 🔐 Snapshot ثابت - معلومات الحلقة والمعلم وقت الحدث
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false, // قد لا يكون موجود في حالة الفصل
    },
    groupName: {
      type: String,
      required: false,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: false,
    },
    teacherName: {
      type: String,
      required: false,
    },

    // في حالة النقل بين حلقات (GROUP_CHANGE)
    previousGroup: {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
      groupName: String,
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
      teacherName: String,
    },

    // من قام بهذا الإجراء
    actionBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "actionBy.userModel"
      },
      userModel: {
        type: String,
        enum: ["Admin", "Teacher"],
        required: true,
      },
      userName: {
        type: String,
        required: true,
      }
    },

    // ربط بالإنذار الأصلي (إذا كان الحدث مرتبط بإنذار)
    warningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warning",
      required: false,
    }
  },
  { timestamps: true }
);

// فهرس مركب لتسريع الاستعلامات
studentHistorySchema.index({ studentId: 1, createdAt: -1 });
studentHistorySchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model("StudentHistory", studentHistorySchema);
