/**
 * اختبار شامل لنظام الترتيب مع التحقق من عزل الحلقات
 * يختبر أن المعلم يمكنه إضافة طلاب من حلقاته فقط
 */

const axios = require("axios");

// إعدادات الاتصال
const BASE_URL = "http://localhost:5000/api";

// ألوان للنص في الـ console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  magenta: "\x1b[35m",
};

// دوال مساعدة للطباعة الملونة
const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(
      `\n${colors.magenta}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${
        colors.reset
      }\n`
    ),
};

// متغيرات عامة للاختبار
let adminToken = "";
let teacherToken = "";
let teacher2Token = "";
let teacherId = "";
let teacher2Id = "";
let group1Name = "";
let group2Name = "";
let studentsGroup1 = [];
let studentsGroup2 = [];

/**
 * تسجيل الدخول كمسؤول
 */
async function loginAsAdmin() {
  try {
    log.info("تسجيل الدخول كمسؤول...");
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: "admin@admin.com",
      password: "admin123",
    });

    if (response.data.success) {
      adminToken = response.data.token;
      log.success("تم تسجيل الدخول كمسؤول بنجاح");
      return true;
    }

    log.error("فشل تسجيل الدخول كمسؤول");
    return false;
  } catch (error) {
    log.error(
      `خطأ في تسجيل الدخول كمسؤول: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

/**
 * الحصول على جميع الحلقات واختيار حلقتين مختلفتين
 */
async function getGroups() {
  try {
    log.info("جلب قائمة الحلقات...");
    const response = await axios.get(`${BASE_URL}/groups`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success && response.data.data.length >= 2) {
      const groups = response.data.data;
      group1Name = groups[0].name;
      group2Name = groups[1].name;

      log.success(`تم العثور على الحلقات: ${group1Name} و ${group2Name}`);
      return true;
    }

    log.error("يجب أن يكون هناك حلقتان على الأقل في النظام");
    return false;
  } catch (error) {
    log.error(
      `خطأ في جلب الحلقات: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

/**
 * الحصول على جميع الطلاب وتصنيفهم حسب الحلقة
 */
async function getStudents() {
  try {
    log.info("جلب قائمة الطلاب...");
    const response = await axios.get(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success && response.data.data) {
      const allStudents = response.data.data;

      studentsGroup1 = allStudents
        .filter((s) => s.group === group1Name)
        .slice(0, 5);
      studentsGroup2 = allStudents
        .filter((s) => s.group === group2Name)
        .slice(0, 5);

      if (studentsGroup1.length === 0 || studentsGroup2.length === 0) {
        log.error("يجب أن يكون هناك طلاب في كلا الحلقتين");
        return false;
      }

      log.success(
        `تم جلب ${studentsGroup1.length} طلاب من ${group1Name} و ${studentsGroup2.length} طلاب من ${group2Name}`
      );
      return true;
    }

    log.error("لم يتم العثور على طلاب");
    return false;
  } catch (error) {
    log.error(
      `خطأ في جلب الطلاب: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

/**
 * إنشاء معلم للحلقة الأولى
 */
async function createTeacher1() {
  try {
    log.info(`إنشاء معلم للحلقة ${group1Name}...`);

    const teacherData = {
      firstName: "محمد",
      lastName: "أحمد",
      fatherName: "علي",
      idNumber: "123456789",
      phoneNumber: "0501234567",
      birthDate: "1990-01-01",
      email: `teacher1_${Date.now()}@test.com`,
      password: "teacher123",
      groups: [{ name: group1Name, number: 1, id: "test-id-1" }],
    };

    const response = await axios.post(`${BASE_URL}/teachers`, teacherData, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      teacherId = response.data.data._id;
      log.success(`تم إنشاء المعلم الأول بنجاح (ID: ${teacherId})`);
      return true;
    }

    log.error("فشل إنشاء المعلم الأول");
    return false;
  } catch (error) {
    log.error(
      `خطأ في إنشاء المعلم الأول: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

/**
 * إنشاء معلم للحلقة الثانية
 */
async function createTeacher2() {
  try {
    log.info(`إنشاء معلم للحلقة ${group2Name}...`);

    const teacherData = {
      firstName: "خالد",
      lastName: "محمود",
      fatherName: "عمر",
      idNumber: "987654321",
      phoneNumber: "0509876543",
      birthDate: "1988-05-15",
      email: `teacher2_${Date.now()}@test.com`,
      password: "teacher123",
      groups: [{ name: group2Name, number: 2, id: "test-id-2" }],
    };

    const response = await axios.post(`${BASE_URL}/teachers`, teacherData, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      teacher2Id = response.data.data._id;
      log.success(`تم إنشاء المعلم الثاني بنجاح (ID: ${teacher2Id})`);
      return true;
    }

    log.error("فشل إنشاء المعلم الثاني");
    return false;
  } catch (error) {
    log.error(
      `خطأ في إنشاء المعلم الثاني: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

/**
 * تسجيل الدخول كمعلم أول
 */
async function loginAsTeacher1() {
  try {
    log.info("تسجيل الدخول كمعلم أول...");

    // Get teacher data first
    const teacherResponse = await axios.get(
      `${BASE_URL}/teachers/${teacherId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const teacher = teacherResponse.data.data;

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: teacher.teacherId.toString(),
      password: "teacher123",
    });

    if (response.data.success) {
      teacherToken = response.data.token;
      log.success("تم تسجيل الدخول كمعلم أول بنجاح");
      return true;
    }

    log.error("فشل تسجيل الدخول كمعلم أول");
    return false;
  } catch (error) {
    log.error(
      `خطأ في تسجيل الدخول كمعلم أول: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

/**
 * تسجيل الدخول كمعلم ثاني
 */
async function loginAsTeacher2() {
  try {
    log.info("تسجيل الدخول كمعلم ثاني...");

    // Get teacher data first
    const teacherResponse = await axios.get(
      `${BASE_URL}/teachers/${teacher2Id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const teacher = teacherResponse.data.data;

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: teacher.teacherId.toString(),
      password: "teacher123",
    });

    if (response.data.success) {
      teacher2Token = response.data.token;
      log.success("تم تسجيل الدخول كمعلم ثاني بنجاح");
      return true;
    }

    log.error("فشل تسجيل الدخول كمعلم ثاني");
    return false;
  } catch (error) {
    log.error(
      `خطأ في تسجيل الدخول كمعلم ثاني: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

/**
 * اختبار 1: المعلم الأول يضيف طالب من حلقته - يجب أن ينجح
 */
async function test1_TeacherAddsOwnStudent() {
  try {
    log.info("اختبار 1: المعلم الأول يضيف طالب من حلقته...");

    const student = studentsGroup1[0];
    const rankingData = {
      month: 11,
      year: 2024,
      topThree: [{ studentId: student._id, score: 95 }],
      topTen: [{ studentId: student._id, score: 95 }],
    };

    const response = await axios.post(`${BASE_URL}/rankings`, rankingData, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });

    if (response.data.success) {
      log.success("✓ نجح الاختبار: المعلم يستطيع إضافة طالب من حلقته");
      return true;
    }

    log.error("✗ فشل الاختبار: يجب أن ينجح المعلم في إضافة طالب من حلقته");
    return false;
  } catch (error) {
    log.error(
      `✗ فشل الاختبار 1: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

/**
 * اختبار 2: المعلم الأول يحاول إضافة طالب من حلقة أخرى - يجب أن يفشل
 */
async function test2_TeacherAddsOtherGroupStudent() {
  try {
    log.info("اختبار 2: المعلم الأول يحاول إضافة طالب من حلقة أخرى...");

    const student = studentsGroup2[0];
    const rankingData = {
      month: 12,
      year: 2024,
      topThree: [{ studentId: student._id, score: 90 }],
      topTen: [{ studentId: student._id, score: 90 }],
    };

    try {
      const response = await axios.post(`${BASE_URL}/rankings`, rankingData, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      log.error(
        "✗ فشل الاختبار: يجب أن يُرفض طلب المعلم لإضافة طالب من حلقة أخرى"
      );
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        log.success("✓ نجح الاختبار: تم رفض إضافة طالب من حلقة أخرى");
        return true;
      }

      log.error(
        `✗ فشل الاختبار: خطأ غير متوقع - ${
          error.response?.data?.message || error.message
        }`
      );
      return false;
    }
  } catch (error) {
    log.error(`✗ فشل الاختبار 2: ${error.message}`);
    return false;
  }
}

/**
 * اختبار 3: المعلم يضيف عدة طلاب من حلقته - يجب أن ينجح
 */
async function test3_TeacherAddsMultipleOwnStudents() {
  try {
    log.info("اختبار 3: المعلم الأول يضيف عدة طلاب من حلقته...");

    const topThree = studentsGroup1.slice(0, 3).map((student, index) => ({
      studentId: student._id,
      score: 95 - index * 5,
    }));

    const topTen = studentsGroup1.slice(0, 5).map((student, index) => ({
      studentId: student._id,
      score: 95 - index * 5,
    }));

    const rankingData = {
      month: 1,
      year: 2025,
      topThree,
      topTen,
    };

    const response = await axios.post(`${BASE_URL}/rankings`, rankingData, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });

    if (response.data.success) {
      log.success("✓ نجح الاختبار: المعلم يستطيع إضافة عدة طلاب من حلقته");
      return true;
    }

    log.error("✗ فشل الاختبار: يجب أن ينجح المعلم في إضافة عدة طلاب من حلقته");
    return false;
  } catch (error) {
    log.error(
      `✗ فشل الاختبار 3: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

/**
 * اختبار 4: المعلم يحاول إضافة مزيج من طلاب حلقته وحلقة أخرى - يجب أن يفشل
 */
async function test4_TeacherAddsMixedStudents() {
  try {
    log.info(
      "اختبار 4: المعلم الأول يحاول إضافة مزيج من طلاب حلقته وحلقة أخرى..."
    );

    const topThree = [
      { studentId: studentsGroup1[0]._id, score: 95 },
      { studentId: studentsGroup2[0]._id, score: 90 }, // طالب من حلقة أخرى
      { studentId: studentsGroup1[1]._id, score: 85 },
    ];

    const rankingData = {
      month: 2,
      year: 2025,
      topThree,
      topTen: topThree,
    };

    try {
      await axios.post(`${BASE_URL}/rankings`, rankingData, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      log.error(
        "✗ فشل الاختبار: يجب أن يُرفض طلب المعلم لإضافة مزيج من الطلاب"
      );
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        log.success("✓ نجح الاختبار: تم رفض إضافة مزيج من طلاب حلقات مختلفة");
        return true;
      }

      log.error(
        `✗ فشل الاختبار: خطأ غير متوقع - ${
          error.response?.data?.message || error.message
        }`
      );
      return false;
    }
  } catch (error) {
    log.error(`✗ فشل الاختبار 4: ${error.message}`);
    return false;
  }
}

/**
 * اختبار 5: المعلم الثاني يضيف طلاب من حلقته - يجب أن ينجح
 */
async function test5_Teacher2AddsOwnStudents() {
  try {
    log.info("اختبار 5: المعلم الثاني يضيف طلاب من حلقته...");

    const student = studentsGroup2[0];
    const rankingData = {
      month: 3,
      year: 2025,
      topThree: [{ studentId: student._id, score: 92 }],
      topTen: [{ studentId: student._id, score: 92 }],
    };

    const response = await axios.post(`${BASE_URL}/rankings`, rankingData, {
      headers: { Authorization: `Bearer ${teacher2Token}` },
    });

    if (response.data.success) {
      log.success("✓ نجح الاختبار: المعلم الثاني يستطيع إضافة طالب من حلقته");
      return true;
    }

    log.error(
      "✗ فشل الاختبار: يجب أن ينجح المعلم الثاني في إضافة طالب من حلقته"
    );
    return false;
  } catch (error) {
    log.error(
      `✗ فشل الاختبار 5: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

/**
 * اختبار 6: المسؤول يضيف طلاب من أي حلقة - يجب أن ينجح
 */
async function test6_AdminAddsAnyStudent() {
  try {
    log.info("اختبار 6: المسؤول يضيف طلاب من حلقات مختلفة...");

    const topThree = [
      { studentId: studentsGroup1[0]._id, score: 98 },
      { studentId: studentsGroup2[0]._id, score: 96 },
      { studentId: studentsGroup1[1]._id, score: 94 },
    ];

    const rankingData = {
      month: 4,
      year: 2025,
      topThree,
      topTen: topThree,
    };

    const response = await axios.post(`${BASE_URL}/rankings`, rankingData, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      log.success("✓ نجح الاختبار: المسؤول يستطيع إضافة طلاب من أي حلقة");
      return true;
    }

    log.error("✗ فشل الاختبار: يجب أن ينجح المسؤول في إضافة طلاب من أي حلقة");
    return false;
  } catch (error) {
    log.error(
      `✗ فشل الاختبار 6: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

/**
 * تنظيف: حذف المعلمين والترتيبات المختبرة
 */
async function cleanup() {
  try {
    log.info("تنظيف البيانات المختبرة...");

    // حذف الترتيبات
    const months = [11, 12, 1, 2, 3, 4];
    const years = [2024, 2024, 2025, 2025, 2025, 2025];

    for (let i = 0; i < months.length; i++) {
      try {
        await axios.delete(`${BASE_URL}/rankings/${months[i]}/${years[i]}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (error) {
        // تجاهل الأخطاء في الحذف
      }
    }

    // حذف المعلمين
    try {
      await axios.delete(`${BASE_URL}/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (error) {
      // تجاهل
    }

    try {
      await axios.delete(`${BASE_URL}/teachers/${teacher2Id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (error) {
      // تجاهل
    }

    log.success("تم تنظيف البيانات المختبرة");
  } catch (error) {
    log.warning("حدث خطأ أثناء التنظيف (يمكن تجاهله)");
  }
}

/**
 * تشغيل جميع الاختبارات
 */
async function runAllTests() {
  log.header("🧪 اختبار نظام الترتيب مع عزل الحلقات");

  const results = {
    total: 6,
    passed: 0,
    failed: 0,
  };

  // الإعداد
  log.header("📋 مرحلة الإعداد");

  if (!(await loginAsAdmin())) {
    log.error("فشل تسجيل الدخول كمسؤول. توقف الاختبار.");
    return;
  }

  if (!(await getGroups())) {
    log.error("فشل جلب الحلقات. توقف الاختبار.");
    return;
  }

  if (!(await getStudents())) {
    log.error("فشل جلب الطلاب. توقف الاختبار.");
    return;
  }

  if (!(await createTeacher1())) {
    log.error("فشل إنشاء المعلم الأول. توقف الاختبار.");
    return;
  }

  if (!(await createTeacher2())) {
    log.error("فشل إنشاء المعلم الثاني. توقف الاختبار.");
    return;
  }

  if (!(await loginAsTeacher1())) {
    log.error("فشل تسجيل الدخول كمعلم أول. توقف الاختبار.");
    await cleanup();
    return;
  }

  if (!(await loginAsTeacher2())) {
    log.error("فشل تسجيل الدخول كمعلم ثاني. توقف الاختبار.");
    await cleanup();
    return;
  }

  // تشغيل الاختبارات
  log.header("🧪 تشغيل الاختبارات");

  const tests = [
    test1_TeacherAddsOwnStudent,
    test2_TeacherAddsOtherGroupStudent,
    test3_TeacherAddsMultipleOwnStudents,
    test4_TeacherAddsMixedStudents,
    test5_Teacher2AddsOwnStudents,
    test6_AdminAddsAnyStudent,
  ];

  for (const test of tests) {
    const result = await test();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    console.log(""); // سطر فارغ بين الاختبارات
  }

  // التنظيف
  log.header("🧹 مرحلة التنظيف");
  await cleanup();

  // النتائج النهائية
  log.header("📊 النتائج النهائية");
  console.log(`إجمالي الاختبارات: ${results.total}`);
  console.log(`${colors.green}النجاحات: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}الفشل: ${results.failed}${colors.reset}`);

  if (results.failed === 0) {
    log.success("🎉 نجحت جميع الاختبارات!");
  } else {
    log.error(`❌ فشل ${results.failed} من ${results.total} اختبار`);
  }
}

// تشغيل الاختبارات
runAllTests().catch((error) => {
  log.error(`خطأ غير متوقع: ${error.message}`);
  console.error(error);
});
