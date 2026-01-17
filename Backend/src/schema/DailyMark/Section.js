const mongoose = require("mongoose");
const { toDateKey } = require("../../config/timezone");

// ============================================================================
// Quran Segment Schema (New Structured Data)
// ============================================================================

const quranRangeSchema = new mongoose.Schema(
  {
    // Identification
    surahNumber: {
      type: Number,
      required: true,
      min: [1, "Surah number must be between 1 and 114"],
      max: [114, "Surah number must be between 1 and 114"],
      index: true,
    },
    surahNameCanonical: { type: String, trim: true },
    surahNameInput: { type: String, trim: true },

    // Range
    ayahStart: { type: Number, required: true, min: [1, "Ayah start must be at least 1"] },
    ayahEnd: { type: Number, required: true, min: [1, "Ayah end must be at least 1"] },

    // Uniqueness Key
    canonicalKey: { type: String, trim: true, required: true, index: true },

    // Validation Context
    surahAyahCount: { type: Number, min: 1 },

    // Completion Tracking
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },
    completedAt: { type: Date, default: null, index: true },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completionNote: { type: String, trim: true },
  },
  { _id: true, timestamps: false } // ✅ اختياري: خففنا حجم الدوك (بدون كسر أسماء)
);

// ✅ 1) canonicalKey backend-generated (ما بنغير الاسم، بس بنضمن صحته)
quranRangeSchema.pre("validate", function (next) {
  if (this.surahNumber && this.ayahStart && this.ayahEnd) {
    this.canonicalKey = `${this.surahNumber}:${this.ayahStart}-${this.ayahEnd}`;
  }
  next();
});

// Basic range validation (End >= Start)
quranRangeSchema.path("ayahEnd").validate(function (value) {
  return this.ayahStart <= value;
}, "Ayah End must be greater than or equal to Ayah Start");

// ✅ 2) لو surahAyahCount موجود: امنع end يتجاوز عدد آيات السورة
quranRangeSchema.path("ayahEnd").validate(function (value) {
  if (!this.surahAyahCount) return true;
  return value <= this.surahAyahCount;
}, "Ayah End exceeds Surah Ayah Count");

quranRangeSchema.path("ayahStart").validate(function (value) {
  if (!this.surahAyahCount) return true;
  return value <= this.surahAyahCount;
}, "Ayah Start exceeds Surah Ayah Count");

// ============================================================================
// Section Schema (Daily Record)
// ============================================================================

const sectionSchema = new mongoose.Schema(
  {
    // 1. Core Section Fields
    date: {
      type: Date,
      required: [true, "تاريخ المقطع مطلوب"],
      default: Date.now,
      index: true,
    },

    // ✅ 3) إضافة غير كاسرة: مفتاح يومي لتطبيق same-day rules بدقة
    // ما بنغيّر date ولا أي اسم قديم—بس بنضيف field جديد
    dateKey: { type: String, index: true },

    group: { type: String, index: true, trim: true }, // اسم الحلقة (للتوافق مع الكود القديم)
    
    // ✅ ربط مباشر بالحلقة عبر ObjectId
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      index: true,
    },
    
    teacher: { type: String, trim: true }, // اسم المعلم (للتوافق مع الكود القديم)
    
    // ✅ ربط مباشر بالمعلم عبر ObjectId
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      index: true,
    },

    // 2. Legacy Text Fields
    reviewSection: { type: String, trim: true },
    memorizationSection: { type: String, trim: true },

    // 3. Status & Progress (Section Level)
    marksStatus: {
      type: String,
      enum: ["completed", "in_progress", "not_started"],
      default: "not_started",
      index: true,
    },
    marksProgress: {
      totalStudents: { type: Number, default: 0 },
      studentsWithMarks: { type: Number, default: 0 },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
    },

    // 4. Scheduling Integration (ربط المقطع بالموعد)
    hasSchedule: { type: Boolean, default: false, index: true },
    scheduleStatus: {
      type: String,
      enum: ["scheduled", "needs_schedule"],
      default: "needs_schedule",
      index: true,
    },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeTable",
      index: true,
      unique: true, // ✅ كل مقطع له موعد واحد فقط
      sparse: true, // ✅ السماح بمقاطع بدون موعد
    },
    
    // ✅ معلومات الموعد المنسوخة من TimeTable (للعرض السريع)
    scheduleInfo: {
      day: { type: String, enum: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] },
      startHour: { type: String },
      endHour: { type: String },
    },

    // 5. New Structured Data (Source of Truth)
    memorizationMeta: { type: [quranRangeSchema], default: [] },
    reviewMeta: { type: [quranRangeSchema], default: [] },

    progressSummary: {
      memorization: {
        totalSegments: { type: Number, default: 0 },
        completedSegments: { type: Number, default: 0 },
      },
      review: {
        totalSegments: { type: Number, default: 0 },
        completedSegments: { type: Number, default: 0 },
      },
      lastUpdatedAt: { type: Date, default: null },
    },

    quranMetaVersion: { type: Number, default: 3, index: true }, // ✅ v3: Date-Aware Sequence + Backfilling
  },
  { timestamps: true }
);

// ============================================================================
// Indexes (بنضيف بدون ما نشيل)
// ============================================================================

sectionSchema.index({ group: 1, teacher: 1, "memorizationMeta.canonicalKey": 1 });
sectionSchema.index({ group: 1, teacher: 1, "reviewMeta.canonicalKey": 1 });

sectionSchema.index({ group: 1, "memorizationMeta.surahNumber": 1, date: -1 });
sectionSchema.index({ group: 1, "reviewMeta.surahNumber": 1, date: -1 });

sectionSchema.index({ group: 1, "memorizationMeta.surahNumber": 1, "memorizationMeta.ayahStart": 1 });
sectionSchema.index({ group: 1, "reviewMeta.surahNumber": 1, "reviewMeta.ayahStart": 1 });

// ✅ index إضافي لـ same-day checks (اختياري ومفيد)
sectionSchema.index({ group: 1, dateKey: 1, "memorizationMeta.canonicalKey": 1 });
sectionSchema.index({ group: 1, dateKey: 1, "reviewMeta.canonicalKey": 1 });

// ============================================================================
// Middleware & Hooks
// ============================================================================

// ✅ استخدام توقيت فلسطين من ملف التكوين المركزي
// toDateKey مستوردة من config/timezone.js

// ✅ 4) بدل pre("save") خليه pre("validate") (ما غيرت أسماء—بس نقلت مكان التنفيذ)
sectionSchema.pre("validate", function (next) {
  // dateKey - استخدام توقيت فلسطين
  if (this.date) this.dateKey = toDateKey(this.date);

  // A. Duplication Checks (Intra-document)
  if (this.memorizationMeta && this.memorizationMeta.length > 0) {
    const memKeys = new Set();
    for (const seg of this.memorizationMeta) {
      if (memKeys.has(seg.canonicalKey)) {
        return next(
          new Error(
            `Duplicate memorization segment found: ${seg.canonicalKey} (Cannot memorize the same part twice in one section)`
          )
        );
      }
      memKeys.add(seg.canonicalKey);
    }
  }

  if (this.reviewMeta && this.reviewMeta.length > 0) {
    const revKeys = new Set();
    for (const seg of this.reviewMeta) {
      if (revKeys.has(seg.canonicalKey)) {
        return next(new Error(`Duplicate review segment found: ${seg.canonicalKey}`));
      }
      revKeys.add(seg.canonicalKey);
    }
  }

  // B. Update Progress Summary
  const memTotal = this.memorizationMeta?.length || 0;
  const memDone = (this.memorizationMeta || []).filter((s) => s.status === "completed").length;

  const revTotal = this.reviewMeta?.length || 0;
  const revDone = (this.reviewMeta || []).filter((s) => s.status === "completed").length;

  this.progressSummary = {
    memorization: { totalSegments: memTotal, completedSegments: memDone },
    review: { totalSegments: revTotal, completedSegments: revDone },
    lastUpdatedAt: new Date(),
  };

  next();
});

// ✅ مزامنة بيانات Section مع TimeTable المرتبط عند التحديث
// ✅ تحديث السور الفعالة في الحلقة تلقائياً
sectionSchema.post("save", async function (doc) {
  // 1. مزامنة مع TimeTable
  if (doc.timetableId) {
    try {
      const TimeTable = mongoose.model("TimeTable");
      await TimeTable.findByIdAndUpdate(doc.timetableId, {
        sessionDate: doc.date,
        groupId: doc.groupId,
        note: doc.group,
        sectionInfo: {
          memorizationSection: doc.memorizationSection,
          reviewSection: doc.reviewSection,
          marksStatus: doc.marksStatus,
        },
      });
      console.log(`🔄 TimeTable ${doc.timetableId}: تم تحديث معلومات المقطع`);
    } catch (err) {
      console.error("خطأ في مزامنة Section مع TimeTable:", err);
    }
  }

  // 2. ✅ تحديث السور الفعالة في الحلقة
  if (doc.groupId) {
    try {
      const Group = mongoose.model("Group");
      
      // تحديث سورة الحفظ الفعالة
      if (doc.memorizationMeta && doc.memorizationMeta.length > 0) {
        const lastSegment = doc.memorizationMeta[doc.memorizationMeta.length - 1];
        const activeSurahs = await Group.getActiveSurahs(doc.groupId);
        
        // إذا لا توجد سورة فعالة أو السورة مكتملة → تفعيل سورة جديدة
        if (!activeSurahs?.memorization?.surahNumber || activeSurahs.memorization.isCompleted) {
          await Group.activateSurah(
            doc.groupId,
            lastSegment.surahNumber,
            lastSegment.surahNameCanonical || lastSegment.surahNameInput,
            lastSegment.ayahEnd,
            'memorization'
          );
        } else if (activeSurahs.memorization.surahNumber === lastSegment.surahNumber) {
          // تحديث آخر آية فقط إذا نفس السورة
          const maxAyahEnd = Math.max(...doc.memorizationMeta.map(s => s.ayahEnd));
          await Group.updateLastAyah(doc.groupId, maxAyahEnd, 'memorization');
          
          // ✅ فحص إكمال السورة تلقائياً
          if (lastSegment.surahAyahCount && maxAyahEnd >= lastSegment.surahAyahCount) {
            await Group.checkAndCompleteSurah(
              doc.groupId, 
              maxAyahEnd, 
              lastSegment.surahAyahCount, 
              'memorization'
            );
          }
        }
      }

      // تحديث سورة المراجعة الفعالة
      if (doc.reviewMeta && doc.reviewMeta.length > 0) {
        const lastSegment = doc.reviewMeta[doc.reviewMeta.length - 1];
        const activeSurahs = await Group.getActiveSurahs(doc.groupId);
        
        if (!activeSurahs?.review?.surahNumber || activeSurahs.review.isCompleted) {
          await Group.activateSurah(
            doc.groupId,
            lastSegment.surahNumber,
            lastSegment.surahNameCanonical || lastSegment.surahNameInput,
            lastSegment.ayahEnd,
            'review'
          );
        } else if (activeSurahs.review.surahNumber === lastSegment.surahNumber) {
          const maxAyahEnd = Math.max(...doc.reviewMeta.map(s => s.ayahEnd));
          await Group.updateLastAyah(doc.groupId, maxAyahEnd, 'review');
          
          // ✅ فحص إكمال السورة تلقائياً
          if (lastSegment.surahAyahCount && maxAyahEnd >= lastSegment.surahAyahCount) {
            await Group.checkAndCompleteSurah(
              doc.groupId, 
              maxAyahEnd, 
              lastSegment.surahAyahCount, 
              'review'
            );
          }
        }
      }
      
      console.log(`📖 Section ${doc._id}: تم تحديث السور الفعالة للحلقة ${doc.groupId}`);
    } catch (err) {
      console.error("❌ خطأ في تحديث السور الفعالة:", err);
    }
  }
});

// Clean up TimeTable if Section is deleted
sectionSchema.pre("findOneAndDelete", async function (next) {
  try {
    const section = await this.model.findOne(this.getFilter());
    if (section?.timetableId) {
      await mongoose.model("TimeTable").findByIdAndDelete(section.timetableId);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
