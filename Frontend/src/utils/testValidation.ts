// ملف تجريبي للتأكد من عمل الـ validation
import { validateStudentWithYup, normalizeGender, calculateAge } from "./studentValidationYup";

// بيانات تجريبية
const testStudentData = {
  firstName: "أحمد",
  fatherName: "محمد",
  grandFatherName: "علي", 
  motherName: "فاطمة",
  lastName: "السالم",
  idNumber: "123456789",
  birthDate: "2010-01-15",
  gender: "ذكر",
  residence: "الرياض",
  teacher: "6507f1f77bcf86cd799439aa",
  group: "6507f1f77bcf86cd799439bb",
  email: "ahmed@test.com",
  phoneNumber: "0501234567",
  password: "123456789",
  age: calculateAge("2010-01-15"),
  avatar: null,
  isActive: true,
  lastSeen: new Date()
};

async function testValidation() {
  console.log("🧪 اختبار الـ validation...");
  
  const result = await validateStudentWithYup(testStudentData, true);
  
  if (result.isValid) {
    console.log("✅ نجح الـ validation!");
    console.log("البيانات المتحققة:", result.data);
  } else {
    console.log("❌ فشل الـ validation:");
    console.log("الأخطاء:", result.errors);
  }
  
  // اختبار تطبيع الجنس
  console.log("\n🔄 اختبار تطبيع الجنس:");
  console.log("'male' ->", normalizeGender("male"));
  console.log("'ذكر' ->", normalizeGender("ذكر"));
  console.log("'female' ->", normalizeGender("female"));
  console.log("'أنثى' ->", normalizeGender("أنثى"));
  
  // اختبار حساب العمر
  console.log("\n📅 اختبار حساب العمر:");
  console.log("تاريخ الميلاد 2010-01-15 -> العمر:", calculateAge("2010-01-15"));
}

// تشغيل الاختبار تلقائياً
testValidation();

export { testValidation };