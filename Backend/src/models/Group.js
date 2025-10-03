const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الحلقة مطلوب'],
      unique: true,
      trim: true,
      index: true, // فهرس لتحسين البحث
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
      maxlength: [500, 'الوصف يجب ألا يتجاوز 500 حرف'],
    },

   
   
    capacity: {
      type: Number,
      min: [0, 'السعة يجب أن تكون 0 أو أكثر'],
      max: [50, 'السعة يجب ألا تتجاوز 50 طالب'],
      default: 30,
    },

    schedule: {
      type: String,
      match: [/^[\u0600-\u06FF\s0-9:-]*$/, 'صيغة الجدول غير صحيحة'],
      trim: true,
      maxlength: [100, 'الجدول الزمني يجب ألا يتجاوز 100 حرف'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
