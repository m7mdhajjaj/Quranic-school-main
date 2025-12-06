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
        // ✅ التحقق من أن الوقت بين 12:00 PM و 9:00 PM فقط
        const hour = parseInt(v.split(':')[0]);
        const isPM = v.toLowerCase().includes('pm');
        
        if (isPM) {
          // مسموح: 12:00 PM إلى 9:00 PM فقط
          return hour === 12 || (hour >= 1 && hour <= 9);
        }
        return false;
      },
      message: 'أوقات العمل من 12:00 PM إلى 9:00 PM فقط'
    }
  },
  endHour: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        // ✅ التحقق من أن الوقت بين 12:00 PM و 9:00 PM فقط
        const hour = parseInt(v.split(':')[0]);
        const isPM = v.toLowerCase().includes('pm');
        
        if (isPM) {
          // مسموح: 12:00 PM إلى 9:00 PM فقط
          return hour === 12 || (hour >= 1 && hour <= 9);
        }
        return false;
      },
      message: 'أوقات العمل من 12:00 PM إلى 9:00 PM فقط'
    }
  },
  note: { type: String },

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
