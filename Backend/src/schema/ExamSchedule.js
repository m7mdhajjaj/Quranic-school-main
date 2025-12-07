const mongoose = require("mongoose");

// Sub-schema for exam marks
const examMarkSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  mark: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number, // النسبة المئوية للعلامة
  },
  detail: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
  _id: true // Each mark has its own ID
});

const examScheduleSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true }, // Kept for backward compatibility
  title: { type: String }, // New: primary title field
  
  // Date & Time
  date: { type: Date, required: true }, // Changed to Date type for better handling
  time: { type: String },
  
  // Exam Details
  subject: { type: String }, // المادة
  type: { type: String, default: "شفهي" }, // نوع الامتحان: شفهي، كتابي، عملي، مشروع
  duration: { type: Number }, // المدة بالدقائق
  totalMarks: { type: Number, default: 100 }, // مجموع الدرجات
  passingMarks: { type: Number }, // درجة النجاح
  
  // Assignment
  group: { type: String }, // اسم الحلقة التي ينتمي لها الامتحان
  teacher: { type: String }, // معرف المعلم المسؤول
  
  // Marks - Now embedded as subdocuments
  marks: [examMarkSchema],
  
  // Status & Results
  result: { type: String },
  examAverage: { type: Number, default: null }, // متوسط علامات الامتحان
  isPublished: { type: Boolean, default: false }, // هل تم نشر النتائج
  isActive: { type: Boolean, default: true }, // حالة الامتحان

}, {
  timestamps: true // createdAt, updatedAt
});

// Index for faster queries
examScheduleSchema.index({ group: 1, date: 1 });
examScheduleSchema.index({ teacher: 1, date: 1 });
examScheduleSchema.index({ "marks.student": 1 });

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);
