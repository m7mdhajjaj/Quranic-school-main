const mongoose = require("mongoose");

const TimeTableSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], // ✅ أيام الأسبوع فقط
  },
  startHour: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        // ✅ التحقق من صحة الصيغة والنطاق الزمني
        // صيفي: 12:00 PM - 9:00 PM
        // شتوي: 11:00 AM - 8:00 PM
        const cleanTime = v.trim().toLowerCase();
        const hour = parseInt(v.split(':')[0]);
        const isAM = cleanTime.includes('am');
        const isPM = cleanTime.includes('pm');
        
        if (isAM) {
          // مسموح: 11:00 AM و 11:30 AM فقط (التوقيت الشتوي)
          return hour === 11;
        }
        
        if (isPM) {
          // مسموح: 12:00 PM إلى 9:00 PM (صيفي وشتوي)
          return hour === 12 || (hour >= 1 && hour <= 9);
        }
        
        return false;
      },
      message: 'أوقات العمل: صيفي (12:00 PM - 9:00 PM) أو شتوي (11:00 AM - 8:00 PM)'
    }
  },
  endHour: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        // ✅ التحقق من صحة الصيغة والنطاق الزمني
        // صيفي: 12:00 PM - 9:00 PM
        // شتوي: 11:00 AM - 8:00 PM
        const cleanTime = v.trim().toLowerCase();
        const hour = parseInt(v.split(':')[0]);
        const isAM = cleanTime.includes('am');
        const isPM = cleanTime.includes('pm');
        
        if (isAM) {
          // مسموح: 11:00 AM و 11:30 AM فقط (التوقيت الشتوي)
          return hour === 11;
        }
        
        if (isPM) {
          // مسموح: 12:00 PM إلى 9:00 PM (صيفي وشتوي)
          return hour === 12 || (hour >= 1 && hour <= 9);
        }
        
        return false;
      },
      message: 'أوقات العمل: صيفي (12:00 PM - 9:00 PM) أو شتوي (11:00 AM - 8:00 PM)'
    }
  },
  note: { type: String }, // اسم الحلقة أو ملاحظة عامة
  
  description: { 
    type: String, 
    default: "",
    maxlength: 500, // حد أقصى 500 حرف للوصف
  }, // وصف تفصيلي أو ملاحظات إضافية عن الحلقة

  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group", 
    required: false, // ✅ مش required لأنه ممكن يكون موعد بدون حلقة
  },

  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher", 
    required: true, // ✅ المعلم مطلوب لكل موعد
  },

  sessionType: {
    type: String,
    enum: ["hifz", "murajaah", "both"], // حفظ، مراجعة، أو الاثنين
    required: true, // ✅ نوع الحصة إجباري
  },
}, {
  timestamps: true // ✅ إضافة timestamps للتتبع
});

// ✅ إنشاء index مركب لتحسين الأداء عند البحث عن التعارض
TimeTableSchema.index({ day: 1, startHour: 1, endHour: 1 });
TimeTableSchema.index({ groupId: 1 });
TimeTableSchema.index({ teacherId: 1 });
TimeTableSchema.index({ note: 1 });

module.exports = mongoose.model("TimeTable", TimeTableSchema);
