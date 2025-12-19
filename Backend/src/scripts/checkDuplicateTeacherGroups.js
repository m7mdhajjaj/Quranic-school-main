// ============================================================================
// scripts/checkDuplicateTeacherGroups.js
// سكريبت للتحقق من الحلقات المشتركة بين المعلمين
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Teacher = require('../schema/Teacher');
const Group = require('../schema/Group');

/**
 * فحص الحلقات المشتركة بين المعلمين
 */
async function checkDuplicateTeacherGroups() {
  try {
    console.log('🔍 جاري فحص الحلقات المشتركة بين المعلمين...\n');

    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI أو MONGO_URI غير موجود في ملف .env');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    // جلب جميع المعلمين مع حلقاتهم
    const teachers = await Teacher.find({}).select('firstName lastName groups').lean();
    
    if (!teachers || teachers.length === 0) {
      console.log('⚠️ لا يوجد معلمين في النظام');
      return;
    }

    console.log(`📊 إجمالي عدد المعلمين: ${teachers.length}\n`);

    // تجميع الحلقات حسب المعلمين
    const groupToTeachers = new Map();

    for (const teacher of teachers) {
      if (teacher.groups && Array.isArray(teacher.groups)) {
        for (const groupItem of teacher.groups) {
          // التعامل مع كلا الحالتين: ObjectId مباشر أو object مع id
          let groupIdStr;
          
          if (typeof groupItem === 'object' && groupItem !== null) {
            // إذا كان object، استخرج id أو _id
            groupIdStr = (groupItem.id || groupItem._id || groupItem).toString();
          } else {
            // إذا كان ObjectId مباشر
            groupIdStr = groupItem.toString();
          }
          
          if (!groupToTeachers.has(groupIdStr)) {
            groupToTeachers.set(groupIdStr, []);
          }
          
          groupToTeachers.get(groupIdStr).push({
            id: teacher._id.toString(),
            name: `${teacher.firstName} ${teacher.lastName}`
          });
        }
      }
    }

    // البحث عن الحلقات المشتركة
    const duplicateGroups = [];
    
    for (const [groupId, teachersList] of groupToTeachers.entries()) {
      if (teachersList.length > 1) {
        const group = await Group.findById(groupId).select('name').lean();
        
        duplicateGroups.push({
          groupId,
          groupName: group?.name || 'حلقة محذوفة',
          teachers: teachersList,
          count: teachersList.length
        });
      }
    }

    // عرض النتائج
    console.log('=' .repeat(70));
    console.log('📋 نتائج الفحص:');
    console.log('=' .repeat(70) + '\n');

    if (duplicateGroups.length === 0) {
      console.log('✅ رائع! لا توجد حلقات مشتركة بين المعلمين\n');
      console.log('جميع الحلقات مخصصة لمعلم واحد فقط ✓\n');
    } else {
      console.log(`⚠️ تم العثور على ${duplicateGroups.length} حلقة مشتركة بين أكثر من معلم:\n`);
      
      duplicateGroups.forEach((item, index) => {
        console.log(`${index + 1}. الحلقة: "${item.groupName}"`);
        console.log(`   🆔 ID: ${item.groupId}`);
        console.log(`   👥 عدد المعلمين المشاركين: ${item.count}`);
        console.log(`   المعلمين:`);
        
        item.teachers.forEach((teacher, tIndex) => {
          console.log(`      ${tIndex + 1}. ${teacher.name} (${teacher.id})`);
        });
        
        console.log('');
      });

      console.log('=' .repeat(70));
      console.log('💡 التوصيات:');
      console.log('=' .repeat(70));
      console.log('1. يجب تعيين كل حلقة لمعلم واحد فقط');
      console.log('2. راجع بيانات المعلمين وقم بإزالة الحلقات المكررة');
      console.log('3. استخدم لوحة التحكم لتحديث بيانات المعلمين\n');
    }

    // إحصائيات إضافية
    console.log('=' .repeat(70));
    console.log('📊 إحصائيات عامة:');
    console.log('=' .repeat(70));
    
    const totalGroups = groupToTeachers.size;
    const teachersWithGroups = teachers.filter(t => t.groups && t.groups.length > 0).length;
    const teachersWithoutGroups = teachers.length - teachersWithGroups;
    
    console.log(`✓ إجمالي الحلقات: ${totalGroups}`);
    console.log(`✓ معلمين لديهم حلقات: ${teachersWithGroups}`);
    console.log(`✓ معلمين بدون حلقات: ${teachersWithoutGroups}`);
    console.log(`✓ حلقات مشتركة: ${duplicateGroups.length}`);
    console.log(`✓ حلقات صحيحة: ${totalGroups - duplicateGroups.length}\n`);

  } catch (error) {
    console.error('❌ حدث خطأ أثناء الفحص:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 تم إغلاق الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
if (require.main === module) {
  checkDuplicateTeacherGroups().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ فشل تشغيل السكريبت:', error);
    process.exit(1);
  });
}

module.exports = checkDuplicateTeacherGroups;
