

const mongoose = require("mongoose");

const TimeTableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
    },

    startHour: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          const cleanTime = v.trim().toLowerCase();
          const hour = parseInt(v.split(":")[0]);
          const isAM = cleanTime.includes("am");
          const isPM = cleanTime.includes("pm");

          // ✅ أوقات العمل الموحدة: 11:00 AM - 8:00 PM
          if (isAM) return hour === 11; // 11:00 AM فقط
          if (isPM) return hour === 12 || (hour >= 1 && hour <= 8); // 12:00 PM - 8:00 PM
          return false;
        },
        message: "أوقات العمل: 11:00 AM - 8:00 PM",
      },
    },

    endHour: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          const cleanTime = v.trim().toLowerCase();
          const hour = parseInt(v.split(":")[0]);
          const minutes = parseInt(v.split(":")[1]) || 0;
          const isAM = cleanTime.includes("am");
          const isPM = cleanTime.includes("pm");

          // ✅ أوقات العمل الموحدة: 11:00 AM - 9:00 PM (تمديد للنهاية)
          if (isAM) return hour === 11;
          if (isPM) {
            // السماح حتى 9:00 PM لتغطية نهاية الحلقات التي تبدأ 8:00 PM
            if (hour === 12 || (hour >= 1 && hour <= 8)) return true;
            if (hour === 9 && minutes === 0) return true; // 9:00 PM كنهاية فقط
          }
          return false;
        },
        message: "أوقات العمل: 11:00 AM - 8:00 PM (الحلقات تنتهي حتى 9:00 PM)",
      },
    },

    note: { type: String },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    sessionType: {
      type: String,
      enum: ["hifz", "murajaah", "both"],
      required: true,
    },

    // =========================
    // ✅ الربط مع المقطع (Section)
    // العلاقة: Section 1 ──→ 1 TimeTable
    // كل مقطع له موعد واحد فقط
    // =========================

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: false,
      unique: true, // ✅ كل مقطع له موعد واحد فقط
      sparse: true, // ✅ عشان يسمح بسجلات بدون sectionId
      index: true,
    },

    // ✅ تاريخ المقطع (يُنسخ من Section.date)
    sessionDate: {
      type: Date,
      required: false,
      index: true,
    },

    // ✅ نوع الموعد: متكرر أسبوعياً (true) أو محدد بتاريخ (false)
    isRecurring: {
      type: Boolean,
      default: false, // ✅ الافتراضي: محدد بتاريخ (لأن كل مقطع له تاريخ)
      index: true,
    },
    
    // ✅ معلومات المقطع المنسوخة (للعرض السريع بدون populate)
    sectionInfo: {
      memorizationSection: { type: String }, // مقطع الحفظ
      reviewSection: { type: String },       // مقطع المراجعة
      marksStatus: { type: String },         // حالة الدرجات
    },
  },
  { timestamps: true }
);

// ✅ Indexes عندك + أضفت indexes للربط
TimeTableSchema.index({ day: 1, startHour: 1, endHour: 1 });
TimeTableSchema.index({ groupId: 1 });
TimeTableSchema.index({ teacherId: 1 });
TimeTableSchema.index({ note: 1 });
TimeTableSchema.index({ sectionId: 1, sessionDate: 1 }); // ✅ للبحث السريع بالمقطع والتاريخ

// ✅ عند حفظ TimeTable: مزامنة البيانات مع Section
TimeTableSchema.pre("save", async function (next) {
  // إذا كان هناك sectionId، انسخ معلومات المقطع
  if (this.sectionId && this.isModified("sectionId")) {
    try {
      const Section = mongoose.model("Section");
      const section = await Section.findById(this.sectionId);
      
      if (section) {
        // نسخ معلومات المقطع للعرض السريع
        this.sectionInfo = {
          memorizationSection: section.memorizationSection,
          reviewSection: section.reviewSection,
          marksStatus: section.marksStatus,
        };
        
        // نسخ التاريخ من المقطع
        if (section.date && !this.sessionDate) {
          this.sessionDate = section.date;
        }
        
        // نسخ groupId من المقطع إذا موجود
        if (section.groupId && !this.groupId) {
          this.groupId = section.groupId;
        }
        
        // نسخ اسم الحلقة من المقطع
        if (section.group && !this.note) {
          this.note = section.group;
        }
        
        // Note: تم نسخ معلومات المقطع - use logger in production
      }
    } catch (err) {
      // Error syncing TimeTable with Section - logged silently
    }
  }
  next();
});

// ✅ بعد حفظ TimeTable: تحديث Section المرتبط
TimeTableSchema.post("save", async function (doc) {
  if (doc.sectionId) {
    try {
      const Section = mongoose.model("Section");
      await Section.findByIdAndUpdate(doc.sectionId, {
        hasSchedule: true,
        scheduleStatus: "scheduled",
        timetableId: doc._id,
        scheduleInfo: {
          day: doc.day,
          startHour: doc.startHour,
          endHour: doc.endHour,
        },
      });
      // Note: Section linked to TimeTable - use logger in production
    } catch (err) {
      // Error updating Section after TimeTable save - logged silently
    }
  }
});

// ✅ إذا حذفنا TimeTable: نفك الربط من Section تلقائيًا
TimeTableSchema.pre("findOneAndDelete", async function (next) {
  const tt = await this.model.findOne(this.getFilter());
  if (tt?.sectionId) {
    await mongoose.model("Section").findByIdAndUpdate(tt.sectionId, {
      hasSchedule: false,
      scheduleStatus: "needs_schedule",
      timetableId: null,
    });
  }
  next();
});

module.exports = mongoose.model("TimeTable", TimeTableSchema);
