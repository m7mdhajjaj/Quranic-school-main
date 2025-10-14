// سكريبت للتحقق من كلمة مرور طالب معين
// كيفية الاستخدام: node checkStudentPassword.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// الاتصال بقاعدة البيانات
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quranic_school";

const studentSchema = new mongoose.Schema(
  {
    studentId: Number,
    idNumber: String,
    password: String,
    firstName: String,
    lastName: String,
  },
  { collection: "students" }
);

const Student = mongoose.model("Student", studentSchema);

async function checkStudent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ تم الاتصال بقاعدة البيانات\n");

    // استبدل برقم الطالب الذي تريد التحقق منه
    const STUDENT_ID = 134886;
    const ID_NUMBER_TO_TEST = "123456789"; // ضع رقم الهوية الذي تحاول تسجيل الدخول به

    console.log("🔍 البحث عن الطالب برقم:", STUDENT_ID);
    const student = await Student.findOne({ studentId: STUDENT_ID });

    if (!student) {
      console.log("❌ الطالب غير موجود\n");
      process.exit(1);
    }

    console.log("\n📋 معلومات الطالب:");
    console.log("   - الاسم:", student.firstName, student.lastName);
    console.log("   - رقم الطالب:", student.studentId);
    console.log("   - رقم الهوية في DB:", student.idNumber);
    console.log("   - كلمة المرور موجودة:", !!student.password);
    console.log(
      "   - طول كلمة المرور:",
      student.password ? student.password.length : 0
    );
    console.log(
      "   - كلمة المرور تبدأ بـ:",
      student.password ? student.password.substring(0, 10) : "لا يوجد"
    );

    console.log("\n🔐 اختبار كلمة المرور:");
    console.log("   - رقم الهوية المُدخل للاختبار:", ID_NUMBER_TO_TEST);

    if (student.password && student.password.startsWith("$2")) {
      // كلمة المرور مشفرة
      console.log("   - كلمة المرور: مشفرة ✅");

      const isValid = await bcrypt.compare(ID_NUMBER_TO_TEST, student.password);
      console.log("   - نتيجة المقارنة:", isValid ? "✅ صحيح" : "❌ خاطئ");

      if (!isValid) {
        console.log("\n💡 جرب رقم الهوية الفعلي من قاعدة البيانات:");
        console.log("   - رقم الهوية في DB:", student.idNumber);

        if (student.idNumber) {
          const isValidWithDB = await bcrypt.compare(
            student.idNumber,
            student.password
          );
          console.log(
            "   - نتيجة المقارنة برقم الهوية من DB:",
            isValidWithDB ? "✅ صحيح" : "❌ خاطئ"
          );
        }
      }
    } else if (student.password) {
      // كلمة المرور غير مشفرة
      console.log("   - كلمة المرور: غير مشفرة (نص عادي) ⚠️");
      console.log("   - كلمة المرور في DB:", student.password);

      const isValid = ID_NUMBER_TO_TEST === student.password;
      console.log("   - نتيجة المقارنة:", isValid ? "✅ صحيح" : "❌ خاطئ");

      if (!isValid && student.idNumber) {
        const isValidWithDB = student.idNumber === student.password;
        console.log(
          "   - نتيجة المقارنة برقم الهوية من DB:",
          isValidWithDB ? "✅ صحيح" : "❌ خاطئ"
        );
      }
    } else {
      console.log("   - ❌ لا يوجد حقل password في قاعدة البيانات!");
    }

    console.log("\n" + "=".repeat(60));
    console.log("الخلاصة:");
    console.log("=".repeat(60));
    console.log("رقم الطالب للدخول:", student.studentId);
    console.log(
      "رقم الهوية الصحيح للدخول:",
      student.idNumber || student.password || "غير محدد"
    );
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ تم قطع الاتصال بقاعدة البيانات");
    process.exit(0);
  }
}

checkStudent();
