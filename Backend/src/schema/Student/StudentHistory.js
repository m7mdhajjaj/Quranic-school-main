// ============================================================================
// schema/Student/StudentHistory.js - Student History Schema
// ============================================================================

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
        // Discipline
        "WARNING",          // إنذار
        "WARNING_ESCALATION", // تصعيد إنذار
        "WARNING_REMOVAL",  // حذف إنذار
        "SUSPENSION",       // تعليق مؤقت
        "EXPULSION",        // فصل نهائي
        "RESTORATION",      // إعادة بعد فصل / تعليق

        // Group
        "GROUP_ASSIGNMENT", // تسجيل بحلقة
        "GROUP_CHANGE",     // نقل بين حلقات
        "GROUP_REMOVAL",    // إزالة من حلقة
      ],
      required: true,
      index: true,
    },

    // مستوى الإنذار (فقط إذا eventType = "WARNING")
    warningLevel: {
      type: String,
      enum: ["warning", "first", "second", "third"],
      required: function () {
        return this.eventType === "WARNING";
      },
    },

    reason: {
      type: String,
      required: true,
    },

    // Snapshot ثابت - معلومات الحلقة والمعلم وقت الحدث
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    groupName: {
      type: String,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    teacherName: {
      type: String,
    },

    // في حالة النقل بين حلقات
    previousGroup: {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
      groupName: String,
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
      teacherName: String,
    },

    // من قام بالإجراء
    actionBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "actionBy.userModel",
      },
      userModel: {
        type: String,
        enum: ["Admin", "Teacher"],
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
    },

    // ربط بالإنذار الأصلي
    warningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warning",
    },
  },
  { timestamps: true }
);

// Indexes
studentHistorySchema.index({ studentId: 1, createdAt: -1 });
studentHistorySchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model("StudentHistory", studentHistorySchema);
