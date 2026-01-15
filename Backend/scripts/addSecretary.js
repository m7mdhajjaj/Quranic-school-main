// scripts/addSecretary.js
/**
 * سكريبت إضافة سكرتير جديد
 * =========================
 * 
 * يقوم بإضافة سكرتير جديد إلى قاعدة البيانات
 * 
 * الاستخدام:
 * ---------
 * node scripts/addSecretary.js
 * 
 * أو مع تمرير البيانات:
 * node scripts/addSecretary.js --firstName="أحمد" --lastName="محمد" --email="ahmed@example.com" --phoneNumber="0512345678" --password="123456" --residence="الرياض" --gender="male"
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const readline = require("readline");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// استيراد الموديلات
const Secretary = require("../src/schema/Secretary");
const Counter = require("../src/schema/Counter");

// واجهة القراءة من المستخدم
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// دالة للسؤال
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
};

// دالة تحليل الـ arguments
const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  });
  return args;
};

// دالة التحقق من صحة البريد الإلكتروني
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};

// دالة التحقق من صحة رقم الهاتف
const isValidPhone = (phone) => {
  const phoneRegex = /^05\d{8}$/;
  return phoneRegex.test(phone);
};

async function addSecretary() {
  try {
    console.log("\n========================================");
    console.log("   🔐 إضافة سكرتير جديد");
    console.log("========================================\n");

    // الاتصال بقاعدة البيانات
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("❌ MONGODB_URI غير موجود في ملف .env");
    }

    console.log("🔄 جاري الاتصال بقاعدة البيانات...");
    await mongoose.connect(uri);
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح\n");

    // الحصول على البيانات من الـ arguments أو من المستخدم
    const args = parseArgs();
    let secretaryData = {};

    // الاسم الأول (مطلوب)
    secretaryData.firstName = args.firstName || await question("📝 الاسم الأول *: ");
    if (!secretaryData.firstName) {
      throw new Error("❌ الاسم الأول مطلوب");
    }

    // الاسم الأخير (مطلوب)
    secretaryData.lastName = args.lastName || await question("📝 اسم العائلة *: ");
    if (!secretaryData.lastName) {
      throw new Error("❌ اسم العائلة مطلوب");
    }

    // اسم الأب (اختياري)
    secretaryData.fatherName = args.fatherName || await question("📝 اسم الأب (اختياري): ");

    // اسم الجد (اختياري)
    secretaryData.grandFatherName = args.grandFatherName || await question("📝 اسم الجد (اختياري): ");

    // اسم الأم (اختياري)
    secretaryData.motherName = args.motherName || await question("📝 اسم الأم (اختياري): ");

    // البريد الإلكتروني (مطلوب)
    secretaryData.email = args.email || await question("📧 البريد الإلكتروني *: ");
    if (!secretaryData.email || !isValidEmail(secretaryData.email)) {
      throw new Error("❌ البريد الإلكتروني غير صالح");
    }

    // التحقق من عدم وجود البريد مسبقاً
    const existingEmail = await Secretary.findOne({ email: secretaryData.email.toLowerCase() });
    if (existingEmail) {
      throw new Error("❌ البريد الإلكتروني مستخدم بالفعل");
    }

    // رقم الهاتف (مطلوب)
    secretaryData.phoneNumber = args.phoneNumber || await question("📱 رقم الهاتف (يبدأ بـ 05) *: ");
    if (!secretaryData.phoneNumber || !isValidPhone(secretaryData.phoneNumber)) {
      throw new Error("❌ رقم الهاتف غير صالح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)");
    }

    // التحقق من عدم وجود رقم الهاتف مسبقاً
    const existingPhone = await Secretary.findOne({ phoneNumber: secretaryData.phoneNumber });
    if (existingPhone) {
      throw new Error("❌ رقم الهاتف مستخدم بالفعل");
    }

    // كلمة المرور (مطلوب)
    secretaryData.password = args.password || await question("🔑 كلمة المرور (6 أحرف على الأقل) *: ");
    if (!secretaryData.password || secretaryData.password.length < 6) {
      throw new Error("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    // مكان السكن (مطلوب)
    secretaryData.residence = args.residence || await question("🏠 مكان السكن *: ");
    if (!secretaryData.residence) {
      throw new Error("❌ مكان السكن مطلوب");
    }

    // الجنس (اختياري)
    const genderInput = args.gender || await question("👤 الجنس (male/female أو ذكر/أنثى) - اختياري: ");
    if (genderInput) {
      const validGenders = ['male', 'female', 'ذكر', 'أنثى'];
      if (!validGenders.includes(genderInput.toLowerCase())) {
        throw new Error("❌ الجنس يجب أن يكون male/female أو ذكر/أنثى");
      }
      secretaryData.gender = genderInput.toLowerCase();
    }

    // تاريخ الميلاد (اختياري)
    secretaryData.birthDate = args.birthDate || await question("📅 تاريخ الميلاد (YYYY-MM-DD) - اختياري: ");

    // رقم الهوية (اختياري)
    secretaryData.idNumber = args.idNumber || await question("🆔 رقم الهوية (اختياري): ");

    console.log("\n🔄 جاري إنشاء حساب السكرتير...\n");

    // الحصول على الـ ID التالي
    const secretaryId = await Counter.getNextId("secretary");
    console.log(`📌 رقم السكرتير: ${secretaryId}`);

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(secretaryData.password, salt);

    // تنظيف البيانات
    const cleanData = {
      secretaryId,
      firstName: secretaryData.firstName,
      lastName: secretaryData.lastName,
      email: secretaryData.email.toLowerCase(),
      phoneNumber: secretaryData.phoneNumber,
      password: hashedPassword,
      residence: secretaryData.residence,
      permissions: {
        canManageStudents: true,
        canManageAttendance: true,
        canManageNews: true,
        canViewReports: true,
        canManageTimetable: false,
        canManageMessages: true,
      },
    };

    // إضافة الحقول الاختيارية
    if (secretaryData.fatherName) cleanData.fatherName = secretaryData.fatherName;
    if (secretaryData.grandFatherName) cleanData.grandFatherName = secretaryData.grandFatherName;
    if (secretaryData.motherName) cleanData.motherName = secretaryData.motherName;
    if (secretaryData.gender) cleanData.gender = secretaryData.gender;
    if (secretaryData.birthDate) cleanData.birthDate = secretaryData.birthDate;
    if (secretaryData.idNumber) cleanData.idNumber = secretaryData.idNumber;

    // إنشاء السكرتير
    const secretary = await Secretary.create(cleanData);

    console.log("\n========================================");
    console.log("   ✅ تم إنشاء حساب السكرتير بنجاح!");
    console.log("========================================");
    console.log(`\n📌 رقم السكرتير: ${secretary.secretaryId}`);
    console.log(`👤 الاسم: ${secretary.firstName} ${secretary.lastName}`);
    console.log(`📧 البريد: ${secretary.email}`);
    console.log(`📱 الهاتف: ${secretary.phoneNumber}`);
    console.log(`🏠 السكن: ${secretary.residence}`);
    console.log(`\n🔐 يمكن تسجيل الدخول باستخدام:`);
    console.log(`   - المعرف: ${secretary.secretaryId}`);
    console.log(`   - كلمة المرور: ${secretaryData.password}`);
    console.log("\n========================================\n");

  } catch (error) {
    console.error("\n❌ خطأ:", error.message);
    
    // معالجة أخطاء MongoDB المحددة
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.error(`❌ الحقل "${field}" موجود مسبقاً في قاعدة البيانات`);
    }
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("📴 تم قطع الاتصال بقاعدة البيانات");
    process.exit(0);
  }
}

// تشغيل السكريبت
addSecretary();
