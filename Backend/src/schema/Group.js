// schema/Group.js
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
      unique: true,
      trim: true,
    },

    // ✅ Proper relation to Teacher (populate-friendly)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: false, // keep false to support existing groups without teacher for now
    },

    // Optional: temporary for legacy data (can remove later after migration)
    teacherName: {
      type: String,
      trim: true,
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

    // Timetable (linked to Session model)
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

    // Attendance stats for current month
    currentMonthStats: {
      month: {
        type: String, // "YYYY-MM"
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

// Ensure (group name + teacher) combination is unique
groupSchema.index({ name: 1, teacher: 1 }, { unique: true });

/**
 * Pre-save middleware:
 * Ensure that a group name is not attached to multiple different teachers.
 */
groupSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("name") || this.isModified("teacher")) {
      const existingGroup = await this.constructor.findOne({
        name: this.name,
        teacher: {
          $ne: this.teacher,
          $exists: true,
          $ne: null,
          $ne: "",
        },
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
  } catch (err) {
    next(err);
  }
});

/**
 * Pre findOneAndUpdate:
 * Store old group name before updating, so we can sync across collections.
 */
groupSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
      this._oldGroupName = docToUpdate.name;
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Post findOneAndUpdate:
 * If group name changed, sync new name into:
 *  - Student.group (string name)
 *  - Teacher.groups[].name
 *
 * NOTE: This assumes Student.group & Teacher.groups.name still store names.
 * If you later migrate them to ObjectId only, you can simplify or remove this.
 */
groupSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  const update = this.getUpdate();
  const newName = update.$set?.name || update.name;
  const oldName = this._oldGroupName;

  if (newName && oldName && newName !== oldName) {
    console.log(`🔄 Syncing group name change: "${oldName}" → "${newName}"`);

    try {
      const Student = require("./Student");
      const Teacher = require("./Teacher");

      // Update all students in this group (by name)
      const studentUpdate = await Student.updateMany(
        { groupName: oldName }, // if you keep a string field for legacy
        { $set: { groupName: newName } }
      );
      console.log(`✅ Updated ${studentUpdate.modifiedCount} students`);

      // Update all teachers with this group in their groups array
      const teacherUpdate = await Teacher.updateMany(
        { "groups.name": oldName },
        { $set: { "groups.$[elem].name": newName } },
        { arrayFilters: [{ "elem.name": oldName }] }
      );
      console.log(`✅ Updated ${teacherUpdate.modifiedCount} teachers`);

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

module.exports = mongoose.model("Group", groupSchema);
