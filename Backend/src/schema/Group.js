const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
      unique: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.Mixed, // يدعم ObjectId أو String
      required: false, // اختياري لدعم البيانات القديمة
    },
    teacherName: {
      type: String,
      trim: true,
      // حقل مؤقت لدعم البيانات القديمة
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "الوصف يجب ألا يتجاوز 500 حرف"],
    },

    capacity: {
      type: Number,
      min: [0, "السعة يجب أن تكون 0 أو أكثر"],
      max: [50, "السعة يجب ألا تتجاوز 50 طالب"],
      default: 30,
    },

    schedule: {
      type: String,
      match: [/^[\u0600-\u06FF\s0-9:-]*$/, "صيغة الجدول غير صحيحة"],
      trim: true,
      maxlength: [100, "الجدول الزمني يجب ألا يتجاوز 100 حرف"],
    },

    // مواعيد الحلقة (مرتبطة بـ Sessions)
    timetable: [
      {
        day: {
          type: String,
          required: true,
        },
        startHour: {
          type: String,
          required: true,
        },
        endHour: {
          type: String,
          required: true,
        },
        sessionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Session",
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    // إحصائيات الحضور للشهر الحالي
    currentMonthStats: {
      month: {
        type: String, // بصيغة "YYYY-MM" مثل "2025-10"
      },
      absenceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      attendanceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalDays: {
        type: Number,
        default: 0,
      },
      totalAbsences: {
        type: Number,
        default: 0,
      },
      totalPresences: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// إضافة فهرس مركب للتأكد من أن كل حلقة لها معلم واحد فقط
// هذا الفهرس يضمن عدم تكرار (اسم الحلقة + المعلم)
groupSchema.index({ name: 1, teacher: 1 }, { unique: true });

// middleware للتحقق من أن الحلقة لها معلم واحد فقط قبل الحفظ
groupSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name") || this.isModified("teacher")) {
    // التحقق من وجود حلقة بنفس الاسم مع معلم مختلف
    const existingGroup = await this.constructor.findOne({
      name: this.name,
      teacher: { $ne: this.teacher, $exists: true, $ne: null, $ne: "" },
      _id: { $ne: this._id },
    });

    if (existingGroup) {
      const error = new Error(
        `الحلقة "${this.name}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`
      );
      error.code = "DUPLICATE_GROUP_TEACHER";
      return next(error);
    }
  }
  next();
});

// Middleware for synchronizing group name changes across all collections
// Pre-hook to store old name before update
groupSchema.pre("findOneAndUpdate", async function (next) {
  try {
    // Get the document before update
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
      this._oldGroupName = docToUpdate.name;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Post-hook to sync name changes after update
groupSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  // Get the update that was applied
  const update = this.getUpdate();
  const newName = update.$set?.name || update.name;
  const oldName = this._oldGroupName;

  // If name was changed, sync across all collections
  if (newName && oldName && newName !== oldName) {
    console.log(`🔄 Syncing group name change: "${oldName}" → "${newName}"`);

    try {
      const Student = require("./Student");
      const Teacher = require("./Teacher");

      // Update all students in this group
      const studentUpdate = await Student.updateMany(
        { group: oldName },
        { $set: { group: newName } }
      );
      console.log(`✅ Updated ${studentUpdate.modifiedCount} students`);

      // Update all teachers with this group in their groups array
      const teacherUpdate = await Teacher.updateMany(
        { "groups.name": oldName },
        { $set: { "groups.$[elem].name": newName } },
        { arrayFilters: [{ "elem.name": oldName }] }
      );
      console.log(`✅ Updated ${teacherUpdate.modifiedCount} teachers`);

      // Emit socket event if available
      if (global.io) {
        global.io.emit("groupRenamed", {
          oldName,
          newName,
          studentsUpdated: studentUpdate.modifiedCount,
          teachersUpdated: teacherUpdate.modifiedCount,
        });
      }
    } catch (error) {
      console.error("❌ Error syncing group name change:", error);
    }
  }
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
