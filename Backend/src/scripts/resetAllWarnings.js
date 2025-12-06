// ============================================================================
// resetAllWarnings.js - سكربت لحذف جميع الإنذارات وإعادة الطلاب لحلقاتهم
// ============================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Warning = require('../schema/Warning');
const Student = require('../schema/Student');

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// دالة لإعادة الطلاب المفصولين إلى حلقاتهم الأصلية
const restoreSuspendedStudents = async () => {
  try {
    console.log('\n🔄 جاري البحث عن الطلاب المفصولين...');

    // جلب جميع الإنذارات النشطة التي تحتوي على فصل
    const activeWarnings = await Warning.find({
      isActive: true,
      suspensionType: { $in: ['temporary', 'permanent'] },
      originalGroup: { $exists: true, $ne: null },
    }).populate('studentId');

    console.log(`📋 تم العثور على ${activeWarnings.length} طالب مفصول`);

    if (activeWarnings.length === 0) {
      console.log('✅ لا يوجد طلاب مفصولين حالياً');
      return 0;
    }

    let restoredCount = 0;

    for (const warning of activeWarnings) {
      const student = warning.studentId;

      if (student && warning.originalGroup) {
        // إعادة الطالب إلى حلقته الأصلية
        student.group = warning.originalGroup;
        await student.save();

        console.log(
          `✅ تمت إعادة الطالب ${student.firstName} ${student.lastName} إلى الحلقة ${warning.originalGroup}`
        );
        restoredCount++;
      }
    }

    return restoredCount;
  } catch (error) {
    console.error('❌ خطأ أثناء إعادة الطلاب:', error.message);
    throw error;
  }
};

// دالة لحذف جميع الإنذارات
const deleteAllWarnings = async () => {
  try {
    console.log('\n🗑️  جاري حذف جميع الإنذارات...');

    // حذف جميع الإنذارات
    const result = await Warning.deleteMany({});

    console.log(`✅ تم حذف ${result.deletedCount} إنذار بنجاح`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ خطأ أثناء حذف الإنذارات:', error.message);
    throw error;
  }
};

// دالة رئيسية لتنفيذ السكربت
const resetAllWarnings = async () => {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 بدء عملية إعادة تعيين جميع الإنذارات');
    console.log('═══════════════════════════════════════════════════════');

    // 1. إعادة الطلاب المفصولين إلى حلقاتهم
    const restoredStudents = await restoreSuspendedStudents();

    // 2. حذف جميع الإنذارات
    const deletedWarnings = await deleteAllWarnings();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ تمت عملية إعادة التعيين بنجاح!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 الإحصائيات:`);
    console.log(`   - عدد الطلاب المعادين: ${restoredStudents}`);
    console.log(`   - عدد الإنذارات المحذوفة: ${deletedWarnings}`);
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ فشلت عملية إعادة التعيين:', error.message);
    process.exit(1);
  }
};

// تشغيل السكربت
(async () => {
  await connectDB();
  await resetAllWarnings();
})();
