// scripts/initializeCounters.js
/**
 * سكريبت تهيئة العدادات
 * ======================
 * 
 * يُشغّل مرة واحدة فقط عند الترقية من النظام القديم
 * يقوم بـ:
 * 1. قراءة جميع الـ IDs الموجودة في قاعدة البيانات
 * 2. حساب أعلى ID لكل نوع
 * 3. اكتشاف الفجوات (الأرقام المحذوفة)
 * 4. إنشاء العدادات مع الأرقام المتاحة للتدوير
 * 
 * الاستخدام:
 * ---------
 * node scripts/initializeCounters.js
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// استيراد الموديلات
const Counter = require("../src/schema/Counter");
const Student = require("../src/schema/Student/Student");
const Teacher = require("../src/schema/Teacher");
const Admin = require("../src/schema/Admin");
const Secretary = require("../src/schema/Secretary");

async function initializeCounters() {
  try {
    console.log("🔄 Connecting to database...");
    
    // الاتصال بقاعدة البيانات
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }
    
    await mongoose.connect(uri);
    
    console.log("✅ Connected to database");
    console.log("🔄 Initializing counters...\n");

    // ========================================
    // تعريف النطاقات لكل نوع
    // ========================================
    const RANGES = {
      student: { minValue: 100001 }, // الطلاب: 100001, 100002, 100003...
      teacher: { minValue: 1001 },   // المعلمين: 1001, 1002, 1003...
      admin: { minValue: 1 },        // المشرفين: 1, 2, 3...
      secretary: { minValue: 501 },  // السكرتيرين: 501, 502, 503...
    };

    // ========================================
    // 1. تهيئة عداد الطلاب
    // ========================================
    console.log("📊 Processing Students...");
    const students = await Student.find({}, { studentId: 1 }).lean();
    const studentIds = students.map((s) => s.studentId).filter((id) => id);
    const maxStudentId = studentIds.length > 0 ? Math.max(...studentIds) : RANGES.student.minValue - 1;
    
    // اكتشاف الفجوات ضمن النطاق فقط
    const studentGaps = [];
    for (let i = RANGES.student.minValue; i <= maxStudentId; i++) {
      if (!studentIds.includes(i)) {
        studentGaps.push(i);
      }
    }

    await Counter.findOneAndUpdate(
      { name: "student" },
      {
        $set: {
          currentValue: maxStudentId,
          minValue: RANGES.student.minValue,
          recycledIds: studentGaps.sort((a, b) => a - b),
          "stats.totalCreated": studentIds.length,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`   ✅ Students: ${studentIds.length} records`);
    console.log(`   📈 Range: ${RANGES.student.minValue} - ${maxStudentId}`);
    console.log(`   ♻️  Available for recycling: ${studentGaps.length} IDs`);
    if (studentGaps.length > 0 && studentGaps.length <= 10) {
      console.log(`   📋 Gaps: [${studentGaps.join(", ")}]`);
    }
    console.log();

    // ========================================
    // 2. تهيئة عداد المعلمين
    // ========================================
    console.log("📊 Processing Teachers...");
    const teachers = await Teacher.find({}, { teacherId: 1 }).lean();
    const teacherIds = teachers.map((t) => t.teacherId).filter((id) => id);
    const maxTeacherId = teacherIds.length > 0 ? Math.max(...teacherIds) : RANGES.teacher.minValue - 1;
    
    const teacherGaps = [];
    for (let i = RANGES.teacher.minValue; i <= maxTeacherId; i++) {
      if (!teacherIds.includes(i)) {
        teacherGaps.push(i);
      }
    }

    await Counter.findOneAndUpdate(
      { name: "teacher" },
      {
        $set: {
          currentValue: maxTeacherId,
          minValue: RANGES.teacher.minValue,
          recycledIds: teacherGaps.sort((a, b) => a - b),
          "stats.totalCreated": teacherIds.length,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`   ✅ Teachers: ${teacherIds.length} records`);
    console.log(`   📈 Range: ${RANGES.teacher.minValue} - ${maxTeacherId}`);
    console.log(`   ♻️  Available for recycling: ${teacherGaps.length} IDs`);
    if (teacherGaps.length > 0 && teacherGaps.length <= 10) {
      console.log(`   📋 Gaps: [${teacherGaps.join(", ")}]`);
    }
    console.log();

    // ========================================
    // 3. تهيئة عداد المشرفين
    // ========================================
    console.log("📊 Processing Admins...");
    const admins = await Admin.find({}, { adminId: 1 }).lean();
    const adminIds = admins.map((a) => a.adminId).filter((id) => id);
    const maxAdminId = adminIds.length > 0 ? Math.max(...adminIds) : RANGES.admin.minValue - 1;
    
    const adminGaps = [];
    for (let i = RANGES.admin.minValue; i <= maxAdminId; i++) {
      if (!adminIds.includes(i)) {
        adminGaps.push(i);
      }
    }

    await Counter.findOneAndUpdate(
      { name: "admin" },
      {
        $set: {
          currentValue: maxAdminId,
          minValue: RANGES.admin.minValue,
          recycledIds: adminGaps.sort((a, b) => a - b),
          "stats.totalCreated": adminIds.length,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`   ✅ Admins: ${adminIds.length} records`);
    console.log(`   📈 Range: ${RANGES.admin.minValue} - ${maxAdminId}`);
    console.log(`   ♻️  Available for recycling: ${adminGaps.length} IDs`);
    if (adminGaps.length > 0 && adminGaps.length <= 10) {
      console.log(`   📋 Gaps: [${adminGaps.join(", ")}]`);
    }
    console.log();

    // ========================================
    // 4. تهيئة عداد السكرتيرين
    // ========================================
    console.log("📊 Processing Secretaries...");
    const secretaries = await Secretary.find({}, { secretaryId: 1 }).lean();
    const secretaryIds = secretaries.map((s) => s.secretaryId).filter((id) => id);
    const maxSecretaryId = secretaryIds.length > 0 ? Math.max(...secretaryIds) : RANGES.secretary.minValue - 1;
    
    const secretaryGaps = [];
    for (let i = RANGES.secretary.minValue; i <= maxSecretaryId; i++) {
      if (!secretaryIds.includes(i)) {
        secretaryGaps.push(i);
      }
    }

    await Counter.findOneAndUpdate(
      { name: "secretary" },
      {
        $set: {
          currentValue: maxSecretaryId,
          minValue: RANGES.secretary.minValue,
          recycledIds: secretaryGaps.sort((a, b) => a - b),
          "stats.totalCreated": secretaryIds.length,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`   ✅ Secretaries: ${secretaryIds.length} records`);
    console.log(`   📈 Range: ${RANGES.secretary.minValue} - ${maxSecretaryId}`);
    console.log(`   ♻️  Available for recycling: ${secretaryGaps.length} IDs`);
    if (secretaryGaps.length > 0 && secretaryGaps.length <= 10) {
      console.log(`   📋 Gaps: [${secretaryGaps.join(", ")}]`);
    }
    console.log();

    // ========================================
    // ملخص نهائي
    // ========================================
    console.log("═".repeat(50));
    console.log("📋 SUMMARY");
    console.log("═".repeat(50));

    const allCounters = await Counter.find({});
    for (const counter of allCounters) {
      console.log(`\n🔢 ${counter.name.toUpperCase()}`);
      console.log(`   Current Value: ${counter.currentValue}`);
      console.log(`   Recycled IDs: ${counter.recycledIds.length}`);
      console.log(`   Total Created: ${counter.stats?.totalCreated || 0}`);
    }

    console.log("\n✅ Initialization complete!");
    console.log("═".repeat(50));

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from database");
    process.exit(0);
  }
}

// تشغيل السكريبت
initializeCounters();
