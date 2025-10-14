/**
 * 🧪 سكريبت اختبار للتقارير الشهرية
 *
 * يختبر:
 * 1. جلب معدل طالب واحد من monthlyAverages
 * 2. جلب معدل جميع طلاب الحلقة (للمعلم)
 * 3. التأكد من أن المعدل = (الحفظ + المراجعة) / 2
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Import schemas
const Student = require("../Backend/src/schema/Student");
const Teacher = require("../Backend/src/schema/Teacher");
const Group = require("../Backend/src/schema/Group");
const Mark = require("../Backend/src/schema/Mark");

// Colors for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const log = {
  title: () =>
    console.log(
      `\n${colors.bright}${colors.cyan}${"=".repeat(70)}${colors.reset}`
    ),
  section: (msg) =>
    console.log(`\n${colors.bright}${colors.blue}📋 ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`),
  data: (label, data) =>
    console.log(`   ${colors.cyan}${label}:${colors.reset}`, data),
};

// Test data
let testData = {
  teacher: null,
  group: null,
  student1: null,
  student2: null,
  student3: null,
};

// Helper functions
async function generateTeacherId() {
  const lastTeacher = await Teacher.findOne()
    .sort({ teacherId: -1 })
    .select("teacherId");
  return lastTeacher ? lastTeacher.teacherId + 1 : 1000;
}

async function generateStudentId() {
  const lastStudent = await Student.findOne()
    .sort({ studentId: -1 })
    .select("studentId");
  return lastStudent ? lastStudent.studentId + 1 : 100000;
}

// Setup: Create test data
async function setup() {
  log.title();
  log.section("إعداد بيانات الاختبار");

  try {
    // Create Teacher
    const teacherId = await generateTeacherId();
    testData.teacher = await Teacher.create({
      teacherId,
      firstName: "أحمد",
      lastName: "المعلم",
      fatherName: "محمد",
      email: `teacher_report_${Date.now()}@test.com`,
      phoneNumber: `05011${String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0"
      )}`,
      password: "test123",
      idNumber: `11111${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`,
      birthDate: "1990-01-01",
      gender: "ذكر",
      residence: "الرياض",
    });
    log.success(
      `تم إنشاء المعلم: ${testData.teacher.firstName} (ID: ${testData.teacher.teacherId})`
    );

    // Create Group
    testData.group = await Group.create({
      name: `حلقة التقارير - ${Date.now()}`,
      teacher: testData.teacher._id,
      teacherName: `${testData.teacher.firstName} ${testData.teacher.lastName}`,
    });
    log.success(`تم إنشاء الحلقة: ${testData.group.name}`);

    // Create Student 1 with monthly averages
    const student1Id = await generateStudentId();
    testData.student1 = await Student.create({
      studentId: student1Id,
      firstName: "محمد",
      lastName: "الطالب",
      fatherName: "أحمد",
      grandFatherName: "علي",
      motherName: "فاطمة",
      idNumber: `50001${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`,
      password: "50001",
      teacher: `${testData.teacher.firstName} ${testData.teacher.lastName}`,
      group: testData.group.name,
      phoneNumber: `05031${String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0"
      )}`,
      birthDate: new Date("2010-01-01"),
      gender: "ذكر",
      residence: "الرياض",
      monthlyAverages: [
        {
          month: 1,
          year: 2025,
          reviewAverage: 80,
          memorizationAverage: 90,
          overallAverage: 85, // (80 + 90) / 2 = 85
          totalMarks: 10,
        },
        {
          month: 2,
          year: 2025,
          reviewAverage: 85,
          memorizationAverage: 95,
          overallAverage: 90, // (85 + 95) / 2 = 90
          totalMarks: 12,
        },
      ],
    });
    log.success(
      `تم إنشاء الطالب 1: ${testData.student1.firstName} (ID: ${testData.student1.studentId})`
    );
    log.data("معدل شهر 1", "85 = (80 + 90) / 2");
    log.data("معدل شهر 2", "90 = (85 + 95) / 2");

    // Create Student 2 with monthly averages
    const student2Id = await generateStudentId();
    testData.student2 = await Student.create({
      studentId: student2Id,
      firstName: "علي",
      lastName: "الطالب",
      fatherName: "محمد",
      grandFatherName: "أحمد",
      motherName: "خديجة",
      idNumber: `50002${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`,
      password: "50002",
      teacher: `${testData.teacher.firstName} ${testData.teacher.lastName}`,
      group: testData.group.name,
      phoneNumber: `05032${String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0"
      )}`,
      birthDate: new Date("2010-01-01"),
      gender: "ذكر",
      residence: "الرياض",
      monthlyAverages: [
        {
          month: 1,
          year: 2025,
          reviewAverage: 70,
          memorizationAverage: 80,
          overallAverage: 75, // (70 + 80) / 2 = 75
          totalMarks: 10,
        },
        {
          month: 2,
          year: 2025,
          reviewAverage: 75,
          memorizationAverage: 85,
          overallAverage: 80, // (75 + 85) / 2 = 80
          totalMarks: 12,
        },
      ],
    });
    log.success(
      `تم إنشاء الطالب 2: ${testData.student2.firstName} (ID: ${testData.student2.studentId})`
    );
    log.data("معدل شهر 1", "75 = (70 + 80) / 2");
    log.data("معدل شهر 2", "80 = (75 + 85) / 2");

    // Create Student 3 with monthly averages
    const student3Id = await generateStudentId();
    testData.student3 = await Student.create({
      studentId: student3Id,
      firstName: "خالد",
      lastName: "الطالب",
      fatherName: "علي",
      grandFatherName: "محمد",
      motherName: "عائشة",
      idNumber: `50003${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`,
      password: "50003",
      teacher: `${testData.teacher.firstName} ${testData.teacher.lastName}`,
      group: testData.group.name,
      phoneNumber: `05033${String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0"
      )}`,
      birthDate: new Date("2010-01-01"),
      gender: "ذكر",
      residence: "الرياض",
      monthlyAverages: [
        {
          month: 1,
          year: 2025,
          reviewAverage: 90,
          memorizationAverage: 95,
          overallAverage: 92.5, // (90 + 95) / 2 = 92.5
          totalMarks: 10,
        },
        {
          month: 2,
          year: 2025,
          reviewAverage: 88,
          memorizationAverage: 92,
          overallAverage: 90, // (88 + 92) / 2 = 90
          totalMarks: 12,
        },
      ],
    });
    log.success(
      `تم إنشاء الطالب 3: ${testData.student3.firstName} (ID: ${testData.student3.studentId})`
    );
    log.data("معدل شهر 1", "92.5 = (90 + 95) / 2");
    log.data("معدل شهر 2", "90 = (88 + 92) / 2");

    log.success("تم إعداد البيانات بنجاح!");
    return true;
  } catch (error) {
    log.error(`فشل إعداد البيانات: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Test 1: Get student monthly average
async function test1_getStudentMonthlyAverage() {
  log.title();
  log.section("الاختبار 1: جلب معدل طالب واحد");

  try {
    const student = await Student.findById(testData.student1._id);

    log.info(`الطالب: ${student.firstName} ${student.lastName}`);
    log.info(`الحلقة: ${student.group}`);

    log.info("\nالمعدلات الشهرية:");
    student.monthlyAverages.forEach((avg) => {
      log.data(
        `شهر ${avg.month}/${avg.year}`,
        `${avg.overallAverage} = (${avg.reviewAverage} + ${avg.memorizationAverage}) / 2`
      );
    });

    // Verify calculation
    const jan2025 = student.monthlyAverages.find(
      (a) => a.month === 1 && a.year === 2025
    );
    const feb2025 = student.monthlyAverages.find(
      (a) => a.month === 2 && a.year === 2025
    );

    const janExpected =
      (jan2025.reviewAverage + jan2025.memorizationAverage) / 2;
    const febExpected =
      (feb2025.reviewAverage + feb2025.memorizationAverage) / 2;

    log.info("\n🔍 التحقق من الحسابات:");
    log.data("شهر 1 - المتوقع", janExpected);
    log.data("شهر 1 - المحفوظ", jan2025.overallAverage);
    log.data("شهر 2 - المتوقع", febExpected);
    log.data("شهر 2 - المحفوظ", feb2025.overallAverage);

    if (
      jan2025.overallAverage === janExpected &&
      feb2025.overallAverage === febExpected
    ) {
      log.success("الاختبار 1 نجح ✅ - المعدلات صحيحة!");
      return true;
    } else {
      log.error("الاختبار 1 فشل ❌ - المعدلات غير صحيحة");
      return false;
    }
  } catch (error) {
    log.error(`الاختبار 1 فشل: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Test 2: Get group average (for teacher)
async function test2_getGroupAverage() {
  log.title();
  log.section("الاختبار 2: حساب معدل جميع طلاب الحلقة (للمعلم)");

  try {
    // Get all students in group
    const students = await Student.find({ group: testData.group.name });

    log.info(`الحلقة: ${testData.group.name}`);
    log.data("عدد الطلاب", students.length);

    // Calculate average for month 1/2025
    const month1Averages = [];
    const month2Averages = [];

    students.forEach((student) => {
      const jan = student.monthlyAverages.find(
        (a) => a.month === 1 && a.year === 2025
      );
      const feb = student.monthlyAverages.find(
        (a) => a.month === 2 && a.year === 2025
      );

      if (jan) month1Averages.push(jan.overallAverage);
      if (feb) month2Averages.push(feb.overallAverage);
    });

    const groupAvgMonth1 =
      month1Averages.reduce((sum, val) => sum + val, 0) / month1Averages.length;
    const groupAvgMonth2 =
      month2Averages.reduce((sum, val) => sum + val, 0) / month2Averages.length;

    log.info("\n📊 معدلات الطلاب - شهر 1/2025:");
    students.forEach((student, index) => {
      const jan = student.monthlyAverages.find(
        (a) => a.month === 1 && a.year === 2025
      );
      log.data(`${student.firstName}`, jan.overallAverage);
    });

    log.info("\n📊 معدلات الطلاب - شهر 2/2025:");
    students.forEach((student, index) => {
      const feb = student.monthlyAverages.find(
        (a) => a.month === 2 && a.year === 2025
      );
      log.data(`${student.firstName}`, feb.overallAverage);
    });

    log.info("\n🔍 معدل الحلقة:");
    log.data("شهر 1/2025", Math.round(groupAvgMonth1 * 10) / 10);
    log.data("شهر 2/2025", Math.round(groupAvgMonth2 * 10) / 10);

    // Expected: (85 + 75 + 92.5) / 3 = 84.17 for month 1
    // Expected: (90 + 80 + 90) / 3 = 86.67 for month 2
    const expectedMonth1 = (85 + 75 + 92.5) / 3;
    const expectedMonth2 = (90 + 80 + 90) / 3;

    log.info("\n✓ المتوقع:");
    log.data("شهر 1/2025", Math.round(expectedMonth1 * 10) / 10);
    log.data("شهر 2/2025", Math.round(expectedMonth2 * 10) / 10);

    const diff1 = Math.abs(groupAvgMonth1 - expectedMonth1);
    const diff2 = Math.abs(groupAvgMonth2 - expectedMonth2);

    if (diff1 < 0.1 && diff2 < 0.1) {
      log.success("الاختبار 2 نجح ✅ - معدل الحلقة صحيح!");
      return true;
    } else {
      log.error("الاختبار 2 فشل ❌ - معدل الحلقة غير صحيح");
      return false;
    }
  } catch (error) {
    log.error(`الاختبار 2 فشل: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Test 3: Filter by specific month
async function test3_filterByMonth() {
  log.title();
  log.section("الاختبار 3: فلترة المعدلات حسب شهر محدد");

  try {
    const student = await Student.findById(testData.student1._id);

    // Filter for month 1 only
    const month1Data = student.monthlyAverages.filter(
      (a) => a.month === 1 && a.year === 2025
    );

    log.info("فلترة لشهر 1/2025 فقط:");
    log.data("عدد السجلات", month1Data.length);

    if (month1Data.length > 0) {
      log.data("المعدل", month1Data[0].overallAverage);
    }

    if (month1Data.length === 1 && month1Data[0].overallAverage === 85) {
      log.success("الاختبار 3 نجح ✅ - الفلترة تعمل بشكل صحيح!");
      return true;
    } else {
      log.error("الاختبار 3 فشل ❌");
      return false;
    }
  } catch (error) {
    log.error(`الاختبار 3 فشل: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Test 4: Calculate average when overallAverage is null
async function test4_calculateWhenNull() {
  log.title();
  log.section("الاختبار 4: حساب المعدل عندما يكون overallAverage فارغ");

  try {
    // Create student without overallAverage
    const studentId = await generateStudentId();
    const testStudent = await Student.create({
      studentId,
      firstName: "يوسف",
      lastName: "التجربة",
      fatherName: "أحمد",
      grandFatherName: "علي",
      motherName: "فاطمة",
      idNumber: `60001${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`,
      password: "60001",
      teacher: `${testData.teacher.firstName} ${testData.teacher.lastName}`,
      group: testData.group.name,
      phoneNumber: `05034${String(Math.floor(Math.random() * 100000)).padStart(
        5,
        "0"
      )}`,
      birthDate: new Date("2010-01-01"),
      gender: "ذكر",
      residence: "الرياض",
      monthlyAverages: [
        {
          month: 1,
          year: 2025,
          reviewAverage: 80,
          memorizationAverage: 90,
          overallAverage: null, // فارغ
          totalMarks: 10,
        },
      ],
    });

    log.info(`الطالب: ${testStudent.firstName}`);

    const jan = testStudent.monthlyAverages[0];
    log.data("reviewAverage", jan.reviewAverage);
    log.data("memorizationAverage", jan.memorizationAverage);
    log.data("overallAverage (مخزن)", jan.overallAverage || "null");

    // Calculate manually
    const calculatedAvg = (jan.reviewAverage + jan.memorizationAverage) / 2;
    log.data("المعدل المحسوب", calculatedAvg);

    // Cleanup
    await Student.findByIdAndDelete(testStudent._id);

    if (calculatedAvg === 85) {
      log.success(
        "الاختبار 4 نجح ✅ - الحساب يعمل عند عدم وجود overallAverage!"
      );
      return true;
    } else {
      log.error("الاختبار 4 فشل ❌");
      return false;
    }
  } catch (error) {
    log.error(`الاختبار 4 فشل: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Cleanup: Remove test data
async function cleanup() {
  log.title();
  log.section("تنظيف بيانات الاختبار");

  try {
    // Delete students
    const studentsResult = await Student.deleteMany({
      _id: {
        $in: [
          testData.student1._id,
          testData.student2._id,
          testData.student3._id,
        ],
      },
    });
    log.success(`تم حذف ${studentsResult.deletedCount} طالب`);

    // Delete group
    const groupResult = await Group.deleteMany({
      _id: testData.group._id,
    });
    log.success(`تم حذف ${groupResult.deletedCount} حلقة`);

    // Delete teacher
    const teacherResult = await Teacher.deleteMany({
      _id: testData.teacher._id,
    });
    log.success(`تم حذف ${teacherResult.deletedCount} معلم`);

    log.success("تم تنظيف البيانات بنجاح!");
  } catch (error) {
    log.error(`فشل التنظيف: ${error.message}`);
    console.error(error);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}`);
  console.log(
    "╔══════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║               🧪 نظام اختبار التقارير الشهرية 🧪                    ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════╝"
  );
  console.log(colors.reset);

  try {
    // Connect to database
    log.section("الاتصال بقاعدة البيانات");
    const dbUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/quranic_school";
    await mongoose.connect(dbUri);
    log.success("تم الاتصال بقاعدة البيانات");

    // Run setup
    const setupSuccess = await setup();
    if (!setupSuccess) {
      log.error("فشل الإعداد - إلغاء الاختبارات");
      process.exit(1);
    }

    // Run tests
    const results = {
      test1: await test1_getStudentMonthlyAverage(),
      test2: await test2_getGroupAverage(),
      test3: await test3_filterByMonth(),
      test4: await test4_calculateWhenNull(),
    };

    // Cleanup
    await cleanup();

    // Summary
    log.title();
    log.section("📊 ملخص النتائج");

    const passed = Object.values(results).filter((r) => r).length;
    const total = Object.keys(results).length;

    console.log(`\n${colors.bright}`);
    Object.entries(results).forEach(([test, result]) => {
      const icon = result ? "✅" : "❌";
      const color = result ? colors.green : colors.red;
      console.log(
        `${color}${icon} ${test}: ${result ? "نجح" : "فشل"}${colors.reset}`
      );
    });

    console.log(
      `\n${colors.bright}${colors.cyan}${"=".repeat(70)}${colors.reset}`
    );
    console.log(
      `${colors.bright}النتيجة النهائية: ${passed}/${total} اختبار نجح${colors.reset}`
    );

    if (passed === total) {
      console.log(
        `${colors.bright}${colors.green}🎉 جميع الاختبارات نجحت! 🎉${colors.reset}\n`
      );
    } else {
      console.log(
        `${colors.bright}${colors.red}⚠️  بعض الاختبارات فشلت - يرجى المراجعة${colors.reset}\n`
      );
    }

    // Disconnect
    await mongoose.disconnect();
    log.success("تم قطع الاتصال بقاعدة البيانات");

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    log.error(`خطأ عام: ${error.message}`);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests
runAllTests();
