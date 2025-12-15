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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, "معرف المعلم مطلوب"],
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
      match: [/^[\u0600-\u06FF\s0-9:,،|-]*$/, "صيغة الجدول غير صحيحة"],
      trim: true,
      maxlength: [200, "الجدول الزمني يجب ألا يتجاوز 200 حرف"],
    },

    // حالة الحلقة (فعالة إذا كان لها معلم وفيها طالب واحد على الأقل)
    activeStatus: {
      type: Boolean,
      default: false,
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

// فهرس للمعلم للبحث السريع عن حلقاته
// ملاحظة: الفهرس على name تم إنشاؤه تلقائياً عبر unique: true
groupSchema.index({ teacher: 1 });

// middleware للتحقق من تفرد اسم الحلقة قبل الحفظ
groupSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    // التحقق من وجود حلقة بنفس الاسم
    const existingGroup = await this.constructor.findOne({
      name: this.name,
      _id: { $ne: this._id },
    });

    if (existingGroup) {
      const error = new Error(
        `الحلقة "${this.name}" موجودة بالفعل. اسم الحلقة يجب أن يكون فريداً.`
      );
      error.code = "DUPLICATE_GROUP_NAME";
      return next(error);
    }
  }

  // التحقق من صحة معرف المعلم
  if (this.isNew || this.isModified("teacher")) {
    const Teacher = mongoose.model('Teacher');
    const teacherExists = await Teacher.findById(this.teacher);
    
    if (!teacherExists) {
      const error = new Error(
        `المعلم غير موجود. يرجى التحقق من معرف المعلم.`
      );
      error.code = "TEACHER_NOT_FOUND";
      return next(error);
    }
  }
  
  next();
});

// ============================================================================
// STATIC METHODS - مصدر الحقيقة الواحد لتحديث activeStatus
// ============================================================================

/**
 * إعادة حساب وتحديث activeStatus لحلقة معينة
 * القاعدة: الحلقة فعالة = لها معلم + فيها طالب واحد على الأقل
 * @param {string} groupName - اسم الحلقة
 * @returns {Promise<boolean>} الحالة الجديدة
 */
groupSchema.statics.recalculateActiveStatusByName = async function (groupName) {
  if (!groupName || groupName === "غير محدد" || groupName === "") {
    return false;
  }

  try {
    const Student = mongoose.model("Student");

    // عد الطلاب المرتبطين بالحلقة
    const studentsCount = await Student.countDocuments({ group: groupName });

    // جلب الحلقة
    const group = await this.findOne({ name: groupName }).select("_id teacher activeStatus name");
    if (!group) {
      console.log(`⚠️ [recalculateActiveStatus] Group not found: ${groupName}`);
      return false;
    }

    // حساب الحالة الجديدة
    const shouldBeActive = Boolean(group.teacher) && studentsCount > 0;

    // تحديث فقط إذا تغيرت الحالة
    if (group.activeStatus !== shouldBeActive) {
      await this.updateOne(
        { _id: group._id },
        { $set: { activeStatus: shouldBeActive } }
      );
      console.log(`♻️ [recalculateActiveStatus] "${groupName}": ${shouldBeActive ? 'فعالة ✅' : 'غير فعالة ❌'} (معلم: ${Boolean(group.teacher)}, طلاب: ${studentsCount})`);
    }

    return shouldBeActive;
  } catch (error) {
    console.error(`❌ [recalculateActiveStatus] Error for group "${groupName}":`, error);
    return false;
  }
};

/**
 * تحديث activeStatus لحلقتين (عند نقل طالب من حلقة لأخرى)
 * @param {string} oldGroupName - اسم الحلقة القديمة
 * @param {string} newGroupName - اسم الحلقة الجديدة
 */
groupSchema.statics.recalculateActiveStatusOnStudentMove = async function (oldGroupName, newGroupName) {
  try {
    const tasks = [];

    if (oldGroupName && oldGroupName !== "غير محدد") {
      tasks.push(this.recalculateActiveStatusByName(oldGroupName));
    }

    if (newGroupName && newGroupName !== "غير محدد" && newGroupName !== oldGroupName) {
      tasks.push(this.recalculateActiveStatusByName(newGroupName));
    }

    await Promise.all(tasks);
  } catch (error) {
    console.error("❌ [recalculateActiveStatusOnStudentMove] Error:", error);
  }
};

/**
 * تحديث activeStatus لعدة حلقات دفعة واحدة
 * @param {Array<string>} groupNames - أسماء الحلقات
 */
groupSchema.statics.recalculateMultipleActiveStatus = async function (groupNames) {
  if (!Array.isArray(groupNames) || groupNames.length === 0) {
    return;
  }

  const validNames = [...new Set(groupNames)].filter(
    name => name && name !== "غير محدد" && name !== ""
  );

  if (validNames.length === 0) {
    return;
  }

  console.log(`🔄 [recalculateMultipleActiveStatus] Updating ${validNames.length} groups...`);

  await Promise.all(
    validNames.map(name => 
      this.recalculateActiveStatusByName(name).catch(err =>
        console.error(`❌ Error updating ${name}:`, err)
      )
    )
  );
};

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
