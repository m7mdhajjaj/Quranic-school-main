/**
 * Script للتحقق من جميع المجموعات والطلاب في قاعدة البيانات
 */

// تحميل متغيرات البيئة
require("dotenv").config();

const mongoose = require("mongoose");
const Group = require("../models/Group");
const Student = require("../models/Student");

// إعداد الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ تم الاتصال بقاعدة البيانات: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", error);
    process.exit(1);
  }
};

const checkDatabase = async () => {
  try {
    console.log("🔍 فحص قاعدة البيانات...");

    // عرض جميع المجموعات
    const allGroups = await Group.find().select("name");
    console.log("\n📋 المجموعات الموجودة:");
    allGroups.forEach((group, index) => {
      console.log(`   ${index + 1}. "${group.name}"`);
    });

    // عرض إحصائيات الطلاب حسب المجموعة
    const studentsByGroup = await Student.aggregate([
      {
        $group: {
          _id: "$group",
          count: { $sum: 1 },
          students: {
            $push: {
              studentId: "$studentId",
              name: {
                $concat: [
                  "$firstName",
                  " ",
                  "$fatherName",
                  " ",
                  "$grandFatherName",
                  " ",
                  "$lastName",
                ],
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("\n👥 إحصائيات الطلاب حسب المجموعة:");
    studentsByGroup.forEach((group, index) => {
      console.log(`\n   ${index + 1}. المجموعة: "${group._id}"`);
      console.log(`      عدد الطلاب: ${group.count}`);
      if (group.count <= 10) {
        // عرض أسماء الطلاب إذا كان العدد قليل
        console.log(`      الطلاب:`);
        group.students.forEach((student, i) => {
          console.log(
            `        ${i + 1}. ${student.name} (${student.studentId})`
          );
        });
      }
    });

    // البحث عن الطلاب من رقم 100009 وما بعده
    const studentsFrom100009 = await Student.find({
      studentId: { $gte: 100009 },
    })
      .select("studentId firstName fatherName grandFatherName lastName group")
      .sort({ studentId: 1 });

    console.log("\n🔢 الطلاب من رقم 100009 وما بعده:");
    studentsFrom100009.forEach((student, index) => {
      console.log(
        `   ${index + 1}. ${student.firstName} ${student.fatherName} ${
          student.grandFatherName
        } ${student.lastName} (${student.studentId}) - المجموعة: "${
          student.group
        }"`
      );
    });
  } catch (error) {
    console.error("❌ خطأ أثناء فحص قاعدة البيانات:", error);
  }
};

// تشغيل الـ script
const run = async () => {
  await connectDB();
  await checkDatabase();

  console.log("\n🔚 إغلاق الاتصال بقاعدة البيانات...");
  await mongoose.connection.close();
  process.exit(0);
};

// تشغيل الـ script إذا تم استدعاؤه مباشرة
if (require.main === module) {
  run();
}

module.exports = { checkDatabase };
