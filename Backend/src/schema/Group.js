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
    // مساعد المدرس المرتبط بالحلقة (اختياري - حلقة واحدة لمساعد واحد فقط)
    teacherAssistant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherAssistant',
      default: null,
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

    // ============================================================================
    // نظام السور الفعالة (Active Surah System)
    // ============================================================================
    
    // السورة الفعالة للحفظ - لا يمكن البدء بسورة جديدة حتى تكتمل
    activeMemorizationSurah: {
      surahNumber: { type: Number, min: 1, max: 114, default: null },
      surahName: { type: String, trim: true, default: null },
      startedAt: { type: Date, default: null },
      lastAyahEnd: { type: Number, default: 0 }, // آخر آية تم الوصول إليها
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },
    
    // السورة الفعالة للمراجعة - لا يمكن البدء بسورة جديدة حتى تكتمل
    activeReviewSurah: {
      surahNumber: { type: Number, min: 1, max: 114, default: null },
      surahName: { type: String, trim: true, default: null },
      startedAt: { type: Date, default: null },
      lastAyahEnd: { type: Number, default: 0 },
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },
    
    // سجل السور المكتملة
    completedSurahs: {
      memorization: [{
        surahNumber: { type: Number },
        surahName: { type: String },
        completedAt: { type: Date },
        totalSegments: { type: Number },
      }],
      review: [{
        surahNumber: { type: Number },
        surahName: { type: String },
        completedAt: { type: Date },
        totalSegments: { type: Number },
      }],
    },
  },
  { timestamps: true }
);

// فهرس للمعلم للبحث السريع عن حلقاته
// ملاحظة: الفهرس على name تم إنشاؤه تلقائياً عبر unique: true
groupSchema.index({ teacher: 1 });
// فهرس لمساعد المدرس للبحث السريع
groupSchema.index({ teacherAssistant: 1 });

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

// ============================================================================
// ACTIVE SURAH MANAGEMENT - إدارة السور الفعالة
// ============================================================================

/**
 * التحقق من إمكانية إضافة مقطع جديد (حفظ أو مراجعة)
 * ✅ يفحص وجود مقاطع فعلية للسورة الفعالة قبل الرفض
 * @param {string} groupId - معرف الحلقة
 * @param {number} surahNumber - رقم السورة
 * @param {string} type - 'memorization' أو 'review'
 * @returns {Promise<{allowed: boolean, reason?: string, activeSurah?: object}>}
 */
groupSchema.statics.canAddSegment = async function (groupId, surahNumber, type) {
  const Section = require("./DailyMark/Section");
  
  const group = await this.findById(groupId);
  if (!group) {
    return { allowed: false, reason: "الحلقة غير موجودة" };
  }

  const activeSurah = type === 'memorization' 
    ? group.activeMemorizationSurah 
    : group.activeReviewSurah;

  // إذا لا توجد سورة فعالة، يمكن البدء بأي سورة
  if (!activeSurah || !activeSurah.surahNumber) {
    return { allowed: true };
  }

  // إذا السورة الفعالة مكتملة، يمكن البدء بأي سورة
  if (activeSurah.isCompleted) {
    return { allowed: true };
  }

  // إذا السورة المطلوبة هي نفس السورة الفعالة، مسموح
  if (activeSurah.surahNumber === surahNumber) {
    return { allowed: true, activeSurah };
  }

  // ✅ NEW: فحص وجود مقاطع فعلية للسورة الفعالة
  // إذا لم توجد مقاطع، نمسح السورة الفعالة ونسمح بالإضافة
  const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
  const existingSections = await Section.countDocuments({
    groupId: groupId,
    [`${metaField}.surahNumber`]: activeSurah.surahNumber
  });

  if (existingSections === 0) {
    // لا توجد مقاطع للسورة الفعالة - مسح السورة الفعالة والسماح
    const updateField = type === 'memorization' ? 'activeMemorizationSurah' : 'activeReviewSurah';
    await this.findByIdAndUpdate(groupId, { [updateField]: null });
    console.log(`🧹 [canAddSegment] Cleared orphaned ${type} surah for group ${groupId} (no sections found)`);
    return { allowed: true };
  }

  // لا يمكن البدء بسورة جديدة قبل إكمال الحالية
  return { 
    allowed: false, 
    reason: `يجب إكمال سورة ${activeSurah.surahName || activeSurah.surahNumber} أولاً قبل البدء بسورة جديدة`,
    activeSurah
  };
};

/**
 * تفعيل سورة جديدة (عند إضافة أول مقطع من سورة)
 * @param {string} groupId - معرف الحلقة
 * @param {number} surahNumber - رقم السورة
 * @param {string} surahName - اسم السورة
 * @param {number} ayahEnd - آخر آية في المقطع
 * @param {string} type - 'memorization' أو 'review'
 */
groupSchema.statics.activateSurah = async function (groupId, surahNumber, surahName, ayahEnd, type) {
  const updateField = type === 'memorization' ? 'activeMemorizationSurah' : 'activeReviewSurah';
  
  await this.findByIdAndUpdate(groupId, {
    [updateField]: {
      surahNumber,
      surahName,
      startedAt: new Date(),
      lastAyahEnd: ayahEnd,
      isCompleted: false,
      completedAt: null,
    }
  });
  
  console.log(`📖 [activateSurah] Group ${groupId}: Activated ${type} surah ${surahName} (${surahNumber})`);
};

/**
 * تحديث آخر آية في السورة الفعالة
 * @param {string} groupId - معرف الحلقة
 * @param {number} ayahEnd - آخر آية جديدة
 * @param {string} type - 'memorization' أو 'review'
 */
groupSchema.statics.updateLastAyah = async function (groupId, ayahEnd, type) {
  const updateField = type === 'memorization' 
    ? 'activeMemorizationSurah.lastAyahEnd' 
    : 'activeReviewSurah.lastAyahEnd';
  
  await this.findByIdAndUpdate(groupId, {
    [updateField]: ayahEnd
  });
};

/**
 * إكمال السورة الفعالة ونقلها للسجل
 * @param {string} groupId - معرف الحلقة
 * @param {string} type - 'memorization' أو 'review'
 * @param {number} totalSegments - عدد المقاطع الكلي
 */
groupSchema.statics.completeSurah = async function (groupId, type, totalSegments = 0) {
  const group = await this.findById(groupId);
  if (!group) return;

  const activeSurah = type === 'memorization' 
    ? group.activeMemorizationSurah 
    : group.activeReviewSurah;

  if (!activeSurah || !activeSurah.surahNumber) return;

  const completedSurahEntry = {
    surahNumber: activeSurah.surahNumber,
    surahName: activeSurah.surahName,
    completedAt: new Date(),
    totalSegments,
  };

  const updateField = type === 'memorization' ? 'activeMemorizationSurah' : 'activeReviewSurah';
  const completedArrayField = type === 'memorization' ? 'completedSurahs.memorization' : 'completedSurahs.review';

  await this.findByIdAndUpdate(groupId, {
    $set: {
      [`${updateField}.isCompleted`]: true,
      [`${updateField}.completedAt`]: new Date(),
    },
    $push: {
      [completedArrayField]: completedSurahEntry
    }
  });

  console.log(`✅ [completeSurah] Group ${groupId}: Completed ${type} surah ${activeSurah.surahName}`);
};

/**
 * الحصول على السور الفعالة للحلقة
 * @param {string} groupId - معرف الحلقة
 */
groupSchema.statics.getActiveSurahs = async function (groupId) {
  const group = await this.findById(groupId).select('activeMemorizationSurah activeReviewSurah completedSurahs');
  if (!group) return null;
  
  return {
    memorization: group.activeMemorizationSurah,
    review: group.activeReviewSurah,
    completedSurahs: group.completedSurahs,
  };
};

/**
 * فحص وتحديث إكمال السورة تلقائياً
 * @param {string} groupId - معرف الحلقة
 * @param {number} ayahEnd - آخر آية تم الوصول إليها
 * @param {number} totalAyahs - عدد آيات السورة الكلي
 * @param {string} type - 'memorization' أو 'review'
 * @returns {Promise<{completed: boolean, surahName?: string}>}
 */
groupSchema.statics.checkAndCompleteSurah = async function (groupId, ayahEnd, totalAyahs, type) {
  const group = await this.findById(groupId);
  if (!group) return { completed: false };

  const activeSurah = type === 'memorization' 
    ? group.activeMemorizationSurah 
    : group.activeReviewSurah;

  // إذا لا توجد سورة فعالة أو السورة مكتملة بالفعل
  if (!activeSurah?.surahNumber || activeSurah.isCompleted) {
    return { completed: false };
  }

  // فحص إذا وصلنا لآخر آية في السورة
  if (ayahEnd >= totalAyahs) {
    // إكمال السورة
    const Section = mongoose.model('Section');
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    
    // حساب عدد المقاطع
    const totalSegments = await Section.countDocuments({
      groupId,
      [`${metaField}.surahNumber`]: activeSurah.surahNumber
    });

    await this.completeSurah(groupId, type, totalSegments);
    
    console.log(`🎉 [AutoComplete] Surah ${activeSurah.surahName} (${type}) completed for group ${groupId}`);
    
    return {
      completed: true,
      surahNumber: activeSurah.surahNumber,
      surahName: activeSurah.surahName,
      totalSegments
    };
  }

  return { completed: false };
};

/**
 * الحصول على معلومات تفصيلية عن السور الفعالة للحلقة
 * يشمل نسبة التقدم والآيات المتبقية
 * @param {string} groupId - معرف الحلقة
 */
groupSchema.statics.getActiveSurahInfo = async function (groupId) {
  const group = await this.findById(groupId).select(
    'activeMemorizationSurah activeReviewSurah completedSurahs name'
  );
  
  if (!group) return null;

  // مساعد لحساب التفاصيل
  const calculateProgress = (activeSurah, surahData) => {
    if (!activeSurah?.surahNumber) {
      return {
        isActive: false,
        canStartNewSurah: true,
        message: 'يمكن البدء بأي سورة جديدة'
      };
    }

    if (activeSurah.isCompleted) {
      return {
        isActive: false,
        canStartNewSurah: true,
        lastCompleted: {
          surahNumber: activeSurah.surahNumber,
          surahName: activeSurah.surahName,
          completedAt: activeSurah.completedAt
        },
        message: 'السورة السابقة مكتملة - يمكن البدء بسورة جديدة'
      };
    }

    // إيجاد عدد آيات السورة من البيانات
    const surahInfo = surahData?.find(s => s.number === activeSurah.surahNumber);
    const totalAyahs = surahInfo?.ayahCount || 0;
    const remainingAyahs = totalAyahs - (activeSurah.lastAyahEnd || 0);
    const progressPercent = totalAyahs > 0 
      ? Math.round((activeSurah.lastAyahEnd / totalAyahs) * 100) 
      : 0;

    return {
      isActive: true,
      canStartNewSurah: false,
      surahNumber: activeSurah.surahNumber,
      surahName: activeSurah.surahName,
      lastAyahEnd: activeSurah.lastAyahEnd || 0,
      totalAyahs,
      remainingAyahs: Math.max(0, remainingAyahs),
      progressPercent,
      nextAyahStart: (activeSurah.lastAyahEnd || 0) + 1,
      startedAt: activeSurah.startedAt,
      message: `يجب إكمال سورة ${activeSurah.surahName} أولاً (${progressPercent}% مكتمل، متبقي ${remainingAyahs} آية)`
    };
  };

  // جلب بيانات السور للحساب
  let surahData = [];
  try {
    const quranMeta = require('../utils/Quran/dailyMarkQuranMetadata');
    surahData = quranMeta.surahData || [];
  } catch (e) {
    console.warn('Could not load surah data for progress calculation');
  }

  return {
    groupId: group._id,
    groupName: group.name,
    memorization: calculateProgress(group.activeMemorizationSurah, surahData),
    review: calculateProgress(group.activeReviewSurah, surahData),
    completedSurahs: {
      memorization: group.completedSurahs?.memorization || [],
      review: group.completedSurahs?.review || []
    }
  };
};

/**
 * إعادة تعيين السورة الفعالة (للاستخدام في حالات الطوارئ أو التصحيح)
 * @param {string} groupId - معرف الحلقة
 * @param {string} type - 'memorization' أو 'review'
 */
groupSchema.statics.resetActiveSurah = async function (groupId, type) {
  const updateField = type === 'memorization' ? 'activeMemorizationSurah' : 'activeReviewSurah';
  
  await this.findByIdAndUpdate(groupId, {
    [updateField]: {
      surahNumber: null,
      surahName: null,
      startedAt: null,
      lastAyahEnd: 0,
      isCompleted: false,
      completedAt: null,
    }
  });
  
  console.log(`🔄 [resetActiveSurah] Group ${groupId}: Reset ${type} active surah`);
};

// ============================================================================
// Middleware لإزالة الحلقة من allowedGroups عند حذفها
// ============================================================================

/**
 * عند حذف حلقة - إزالتها من allowedGroups لجميع مساعدي المدرسين
 */
groupSchema.pre('findOneAndDelete', async function(next) {
  try {
    const groupId = this.getQuery()._id;
    if (groupId) {
      const TeacherAssistant = mongoose.model('TeacherAssistant');
      await TeacherAssistant.updateMany(
        { allowedGroups: groupId },
        { $pull: { allowedGroups: groupId } }
      );
      console.log(`🔄 [Group Delete] Removed group ${groupId} from all teacher assistants' allowedGroups`);
    }
  } catch (error) {
    console.error('Error in Group pre-delete middleware:', error);
  }
  next();
});

groupSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
  try {
    const groupId = this.getQuery()._id;
    if (groupId) {
      const TeacherAssistant = mongoose.model('TeacherAssistant');
      await TeacherAssistant.updateMany(
        { allowedGroups: groupId },
        { $pull: { allowedGroups: groupId } }
      );
      console.log(`🔄 [Group Delete] Removed group ${groupId} from all teacher assistants' allowedGroups`);
    }
  } catch (error) {
    console.error('Error in Group pre-delete middleware:', error);
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
