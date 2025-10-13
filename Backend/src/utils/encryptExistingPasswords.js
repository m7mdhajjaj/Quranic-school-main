// utils/encryptExistingPasswords.js
// سكريبت لتشفير كلمات سر الطلاب الموجودة في قاعدة البيانات

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../schema/Student");
require("dotenv").config();

async function encryptExistingPasswords() {
  try {
    console.log("🔄 بدء عملية تشفير كلمات سر الطلاب الموجودة...");

    // الاتصال بقاعدة البيانات
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/quranic-school";
    await mongoose.connect(dbUri);
    console.log("✅ تم الاتصال بقاعدة البيانات");

    // جلب جميع الطلاب
    const students = await Student.find({});
    console.log(`📊 عدد الطلاب الإجمالي: ${students.length}`);

    let updatedCount = 0;
    let alreadyEncryptedCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // التحقق إذا كانت كلمة المرور مشفرة بالفعل
        // كلمات المرور المشفرة ببcrypt تكون طويلة (60 حرف تقريباً)
        if (student.password && student.password.length > 20) {
          console.log(`⏭️  الطالب ${student.firstName} ${student.lastName} (ID: ${student.studentId}) - كلمة المرور مشفرة بالفعل`);
          alreadyEncryptedCount++;
          continue;
        }

        // إذا لم يكن هناك كلمة مرور، استخدم رقم الهوية
        const rawPassword = student.password || student.idNumber;
        
        if (!rawPassword) {
          console.log(`⚠️  الطالب ${student.firstName} ${student.lastName} (ID: ${student.studentId}) - لا يوجد كلمة مرور أو رقم هوية`);
          errorCount++;
          continue;
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // تحديث السجل
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });

        console.log(`✅ تم تشفير كلمة سر الطالب: ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ خطأ في معالجة الطالب ${student.studentId}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 ملخص النتائج:");
    console.log(`   • إجمالي الطلاب: ${students.length}`);
    console.log(`   • تم التشفير: ${updatedCount}`);
    console.log(`   • مشفرة مسبقاً: ${alreadyEncryptedCount}`);
    console.log(`   • أخطاء: ${errorCount}`);
    console.log("=".repeat(60));

    if (updatedCount > 0) {
      console.log("\n✅ تم تشفير كلمات السر بنجاح!");
      console.log("⚠️  تنبيه: يجب على الطلاب استخدام كلمات المرور القديمة (أو رقم الهوية) لتسجيل الدخول");
    }

  } catch (error) {
    console.error("❌ خطأ في عملية التشفير:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 تم إغلاق الاتصال بقاعدة البيانات");
  }
}

// تشغيل السكريبت
if (require.main === module) {
  encryptExistingPasswords()
    .then(() => {
      console.log("\n✅ انتهت العملية بنجاح");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ فشلت العملية:", error);
      process.exit(1);
    });
}

module.exports = encryptExistingPasswords;
