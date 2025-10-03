/**
 * Script لنقل الطلاب من "ازهار الحمد المهاجرين ب" إلى "ازهار الحمد"
 */

// تحميل متغيرات البيئة
require('dotenv').config();

const mongoose = require('mongoose');
const Group = require('../models/Group');
const Student = require('../models/Student');

// إعداد الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ تم الاتصال بقاعدة البيانات: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

const moveStudentsToCorrectGroup = async () => {
  try {
    console.log('🔄 بدء جمع كل الطلاب في مجموعة ازهار الحمد الواحدة...');

    // المجموعة الصحيحة (الوجهة)
    const correctGroupName = 'ازهار الحمد';

    // البحث عن جميع الطلاب الذين في أي مجموعة تحتوي على "ازهار الحمد"
    const studentsInSimilarGroups = await Student.find({ 
      group: { $regex: 'ازهار الحمد', $options: 'i' },
      group: { $ne: correctGroupName } // ما عدا اللي في المجموعة الصحيحة أصلاً
    });
    
    console.log(`👥 عدد الطلاب في مجموعات تحتوي على "ازهار الحمد": ${studentsInSimilarGroups.length}`);

    // عرض المجموعات المختلفة الموجودة
    const differentGroups = [...new Set(studentsInSimilarGroups.map(s => s.group))];
    console.log('📋 المجموعات التي تحتوي على "ازهار الحمد":');
    differentGroups.forEach((groupName, index) => {
      const count = studentsInSimilarGroups.filter(s => s.group === groupName).length;
      console.log(`   ${index + 1}. "${groupName}" - ${count} طالب`);
    });

    if (studentsInSimilarGroups.length === 0) {
      console.log('✅ جميع الطلاب في المجموعة الصحيحة بالفعل');
      return;
    }

    // عرض أسماء الطلاب الذين سيتم نقلهم
    console.log('📋 الطلاب الذين سيتم نقلهم:');
    studentsInSimilarGroups.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.firstName} ${student.fatherName} ${student.grandFatherName} ${student.lastName} (رقم: ${student.studentId}) - من "${student.group}"`);
    });

    // التحقق من وجود المجموعة الصحيحة
    let correctGroup = await Group.findOne({ name: correctGroupName });
    if (!correctGroup) {
      console.log(`📝 إنشاء المجموعة "${correctGroupName}"...`);
      correctGroup = await Group.create({
        name: correctGroupName,
        teacher: 'محمد حجاج', 
        description: `مجموعة ${correctGroupName}`,
        capacity: 50, // زيادة السعة لاستيعاب كل الطلاب
        isActive: true
      });
      console.log(`✅ تم إنشاء المجموعة "${correctGroupName}"`);
    } else {
      console.log(`✅ المجموعة "${correctGroupName}" موجودة بالفعل`);
    }

    // نقل جميع الطلاب إلى المجموعة الصحيحة
    const updateResult = await Student.updateMany(
      { 
        group: { $regex: 'ازهار الحمد', $options: 'i' },
        group: { $ne: correctGroupName }
      },
      { group: correctGroupName }
    );

    console.log(`✅ تم نقل ${updateResult.modifiedCount} طالب إلى المجموعة "${correctGroupName}"`);

    // التحقق من النتيجة النهائية
    const studentsInCorrectGroup = await Student.countDocuments({ group: correctGroupName });
    console.log(`📊 النتيجة النهائية:`);
    console.log(`   - إجمالي الطلاب في "${correctGroupName}": ${studentsInCorrectGroup}`);

    // حذف المجموعات الفارغة التي تحتوي على "ازهار الحمد"
    for (const groupName of differentGroups) {
      const remainingStudents = await Student.countDocuments({ group: groupName });
      if (remainingStudents === 0) {
        const emptyGroup = await Group.findOne({ name: groupName });
        if (emptyGroup) {
          await Group.findByIdAndDelete(emptyGroup._id);
          console.log(`🗑️ تم حذف المجموعة الفارغة "${groupName}"`);
        }
      }
    }

    console.log('🎉 تم الانتهاء من نقل الطلاب بنجاح!');

  } catch (error) {
    console.error('❌ خطأ أثناء نقل الطلاب:', error);
  }
};

// تشغيل الـ script
const run = async () => {
  await connectDB();
  await moveStudentsToCorrectGroup();
  
  console.log('🔚 إغلاق الاتصال بقاعدة البيانات...');
  await mongoose.connection.close();
  process.exit(0);
};

// تشغيل الـ script إذا تم استدعاؤه مباشرة
if (require.main === module) {
  run();
}

module.exports = { moveStudentsToCorrectGroup };