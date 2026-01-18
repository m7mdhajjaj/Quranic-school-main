// scripts/updateTeacherAssistantGroups.js
// سكريبت لتحديث حلقات مساعد المدرس

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    process.exit(1);
  }
};

const TeacherAssistant = require('../schema/TeacherAssistant');
const Group = require('../schema/Group');
const Teacher = require('../schema/Teacher');

const updateAssistantGroups = async () => {
  try {
    // جلب المساعد
    const assistant = await TeacherAssistant.findOne({ assistantId: 601 });
    
    if (!assistant) {
      console.log('❌ مساعد المدرس غير موجود!');
      return;
    }

    console.log('📋 بيانات المساعد الحالية:');
    console.log('   - الاسم:', assistant.firstName, assistant.lastName);
    console.log('   - المعلم المعين:', assistant.assignedTeacher || 'غير محدد');
    console.log('   - الحلقات المسموحة:', assistant.allowedGroups?.length || 0);

    // جلب جميع الحلقات
    const groups = await Group.find({}).select('_id name teacher').lean();
    console.log('\n📚 الحلقات الموجودة:');
    groups.forEach(g => {
      console.log(`   - ${g.name} (المعلم: ${g.teacher || 'غير محدد'})`);
    });

    if (groups.length === 0) {
      console.log('❌ لا توجد حلقات في النظام!');
      return;
    }

    // تحديث المساعد بجميع الحلقات
    const allGroupIds = groups.map(g => g._id);
    
    const updateData = {
      allowedGroups: allGroupIds, // إضافة جميع الحلقات
    };

    // إذا كان لأول حلقة معلم، نضيفه كمعلم معين
    const firstGroup = groups[0];
    if (firstGroup.teacher) {
      updateData.assignedTeacher = firstGroup.teacher;
    }

    const updatedAssistant = await TeacherAssistant.findByIdAndUpdate(
      assistant._id,
      updateData,
      { new: true }
    ).populate('allowedGroups', 'name teacher')
     .populate('assignedTeacher', 'firstName lastName');

    console.log('\n✅ تم تحديث بيانات المساعد:');
    console.log('   - المعلم المعين:', updatedAssistant.assignedTeacher 
      ? `${updatedAssistant.assignedTeacher.firstName} ${updatedAssistant.assignedTeacher.lastName}`
      : 'غير محدد');
    console.log('   - الحلقات المسموحة:', updatedAssistant.allowedGroups?.map(g => g.name).join(', ') || 'لا يوجد');

  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

const run = async () => {
  await connectDB();
  await updateAssistantGroups();
  
  setTimeout(() => {
    mongoose.connection.close();
    console.log('\n✅ تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
  }, 1000);
};

run();
