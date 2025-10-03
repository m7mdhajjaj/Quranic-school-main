/**
 * Script لحل مشكلة أسماء المجموعات المتضاربة
 * يقوم بتحديث اسم المجموعة "ازهار الحمد" إلى "ازهار الحمد المهاجرين ب"
 * ويحديث جميع الطلاب المرتبطين بها
 */

const mongoose = require("mongoose");
const Group = require("../models/Group");
const Student = require("../models/Student");

// إعداد الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/quranic-school",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ تم الاتصال بقاعدة البيانات: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", error);
    process.exit(1);
  }
};

const fixGroupNames = async () => {
  try {
    console.log("🔄 بدء تحديث أسماء المجموعات...");

    // البحث عن المجموعة "ازهار الحمد"
    const oldGroupName = "ازهار الحمد";
    const newGroupName = "ازهار الحمد المهاجرين ب";

    const group = await Group.findOne({ name: oldGroupName });

    if (!group) {
      console.log(`⚠️  لم يتم العثور على المجموعة "${oldGroupName}"`);

      // عرض جميع المجموعات الموجودة
      const allGroups = await Group.find().select("name");
      console.log("📋 المجموعات الموجودة:");
      allGroups.forEach((g, index) => {
        console.log(`   ${index + 1}. ${g.name}`);
      });

      return;
    }

    console.log(`📝 تم العثور على المجموعة: "${oldGroupName}"`);

    // التحقق من عدد الطلاب في المجموعة القديمة
    const studentsCount = await Student.countDocuments({ group: oldGroupName });
    console.log(`👥 عدد الطلاب في المجموعة: ${studentsCount}`);

    // التحقق من وجود مجموعة بالاسم الجديد
    const existingNewGroup = await Group.findOne({ name: newGroupName });

    if (existingNewGroup) {
      console.log(`⚠️  يوجد مجموعة بالاسم "${newGroupName}" بالفعل`);
      console.log("🔄 دمج الطلاب في المجموعة الموجودة...");

      // نقل جميع الطلاب إلى المجموعة الجديدة
      const updateResult = await Student.updateMany(
        { group: oldGroupName },
        { group: newGroupName }
      );

      console.log(
        `✅ تم نقل ${updateResult.modifiedCount} طالب إلى المجموعة "${newGroupName}"`
      );

      // حذف المجموعة القديمة
      await Group.findByIdAndDelete(group._id);
      console.log(`🗑️  تم حذف المجموعة القديمة "${oldGroupName}"`);
    } else {
      console.log("🔄 إعادة تسمية المجموعة...");

      // إعادة تسمية المجموعة
      await Group.findByIdAndUpdate(group._id, { name: newGroupName });
      console.log(`✅ تم تحديث اسم المجموعة إلى "${newGroupName}"`);

      // تحديث جميع الطلاب
      const updateResult = await Student.updateMany(
        { group: oldGroupName },
        { group: newGroupName }
      );

      console.log(`✅ تم تحديث ${updateResult.modifiedCount} طالب`);
    }

    // التحقق من النتيجة النهائية
    const finalCount = await Student.countDocuments({ group: newGroupName });
    console.log(
      `🎉 العدد النهائي للطلاب في المجموعة "${newGroupName}": ${finalCount}`
    );

    console.log("✅ تم الانتهاء من تحديث أسماء المجموعات بنجاح!");
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث أسماء المجموعات:", error);
  }
};

// تشغيل الـ script
const run = async () => {
  await connectDB();
  await fixGroupNames();

  console.log("🔚 إغلاق الاتصال بقاعدة البيانات...");
  await mongoose.connection.close();
  process.exit(0);
};

// تشغيل الـ script إذا تم استدعاؤه مباشرة
if (require.main === module) {
  run();
}

module.exports = { fixGroupNames };
