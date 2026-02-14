// Script to check all Validation imports for case-sensitivity issues
const fs = require("fs");
const path = require("path");

// All require statements found in the project
const requireStatements = [
  {
    path: "../../Validation/Chat/ChatValidation",
    from: "src/sockets/Chat/messageHandlers.js",
  },
  {
    path: "../../Validation/Student/StudentValidation",
    from: "src/routes/studentRoutes/crud.routes.js",
  },
  {
    path: "../../Validation/Student/StudentQueryValidation",
    from: "src/routes/studentRoutes/crud.routes.js",
  },
  {
    path: "../../Validation/Warning/warningValidation",
    from: "src/routes/WarningRoutes/WarningRoutes.js",
  },
  {
    path: "../../Validation/Timetable/TimetableValidation",
    from: "src/routes/timetableRoutes/TimeTableRoutes.js",
  },
  {
    path: "../../Validation/Secretary/SecretaryValidation",
    from: "src/routes/secretaryRoutes/index.js",
  },
  {
    path: "../../Validation/TeacherAssistant/AssistantValidation",
    from: "src/routes/teacherAssistantRoutes/crud.routes.js",
  },
  {
    path: "../../Validation/Teacher/TeacherValidation",
    from: "src/routes/teacherRoutes/crud.routes.js",
  },
  {
    path: "../../Validation/Report/ReportValidation",
    from: "src/routes/ReportRoutes/index.js",
  },
  {
    path: "../../Validation/Profile/ProfileValidation",
    from: "src/routes/profileRoutes/profile.routes.js",
  },
  {
    path: "../../Validation/Auth/AuthValidation",
    from: "src/routes/authRoutes/login.routes.js",
  },
  {
    path: "../../Validation/Notification/NotificationValidation",
    from: "src/routes/NotificationRoutes/createRoutes.js",
  },
  {
    path: "../../Validation/News/NewsValidation",
    from: "src/routes/NewsRoutes/newsRoutes.js",
  },
  {
    path: "../../Validation/Group/groupValidators",
    from: "src/routes/groupRoutes/index.js",
  },
  {
    path: "../../Validation/ExamSchedule/ExamScheduleValidation",
    from: "src/routes/ExamScheduleRoutes/examRoutes.js",
  },
  {
    path: "../../../Validation/ExamSchedule/ExamMarkValidation",
    from: "src/routes/ExamScheduleRoutes/ExamMarkRoutes/examMarkRoutes.js",
  },
  {
    path: "../../Validation/DailyMark/DailyMarksValidation",
    from: "src/routes/DailyMarkRoutes/DailyMarkRoutes.js",
  },
  {
    path: "../../Validation/Group/ActiveGroupsValidation",
    from: "src/routes/DailyMarkRoutes/DailyMarkRoutes.js",
  },
  {
    path: "../../Validation/DailyMark/GroupStatsValidation",
    from: "src/routes/DailyMarkRoutes/DailyMarkRoutes.js",
  },
  {
    path: "../../../Validation/DailyMark/DailyMarksSectionValidation",
    from: "src/routes/DailyMarkRoutes/SectionRoutes/crud.routes.js",
  },
  {
    path: "../../Validation/Group/GroupValidation",
    from: "src/routes/attendanceRoutes/getRoutes.js",
  },
  {
    path: "../../Validation/Attendance",
    from: "src/routes/attendanceRoutes/createRoutes.js",
  },
  {
    path: "../../Validation/ChatBot/aiChatValidation",
    from: "src/routes/AiChatRoutes/aiChatRoutes.js",
  },
  {
    path: "../../../Validation/Quran/quranValidation",
    from: "src/routes/AiChatRoutes/QuranRoutes/quranRoutes.js",
  },
  {
    path: "../../Validation/Admin/AdminValidation",
    from: "src/routes/adminRoutes/crud.routes.js",
  },
  {
    path: "../../Validation/validators/duplicateChecker",
    from: "src/controllers/profileController/checkDuplicate.js",
  },
];

// Get all actual files in Validation folder
const validationFiles = [];
function getAllFiles(dir, basePath = "") {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach((item) => {
    const relativePath = path.join(basePath, item.name);
    if (item.isDirectory()) {
      getAllFiles(path.join(dir, item.name), relativePath);
    } else if (item.name.endsWith(".js")) {
      validationFiles.push(relativePath.replace(/\\/g, "/"));
    }
  });
}

getAllFiles("./src/Validation");

console.log("\n=== التحقق من ملفات Validation ===\n");
console.log(`عدد الملفات الموجودة: ${validationFiles.length}`);
console.log(`عدد استخدامات require: ${requireStatements.length}`);

const issues = [];
const checked = new Set();

requireStatements.forEach(({ path: reqPath, from }) => {
  // Resolve the relative path
  const fromDir = path.dirname(path.join("./src", from.replace("src/", "")));
  let resolvedPath = path.join(fromDir, reqPath);

  // Try with .js extension
  if (!resolvedPath.endsWith(".js")) {
    resolvedPath += ".js";
  }

  // Normalize path
  const normalizedPath = path
    .relative("./src", resolvedPath)
    .replace(/\\/g, "/");

  // Check if file exists with exact case
  const actualFile = validationFiles.find((f) => {
    const fullPath = "Validation/" + f;
    return fullPath.toLowerCase() === normalizedPath.toLowerCase();
  });

  if (actualFile) {
    const expectedPath = "Validation/" + actualFile;
    if (expectedPath !== normalizedPath) {
      // Case mismatch found!
      issues.push({
        from,
        required: reqPath,
        expected: expectedPath.replace("Validation/", ""),
        actual: actualFile,
        normalizedPath,
      });
    }
    checked.add(normalizedPath);
  } else {
    // Try as directory with index.js
    const indexPath = normalizedPath.replace(".js", "/index.js");
    const hasIndex = validationFiles.find(
      (f) => ("Validation/" + f).toLowerCase() === indexPath.toLowerCase(),
    );
    if (!hasIndex) {
      issues.push({
        from,
        required: reqPath,
        error: "File not found",
        normalizedPath,
      });
    }
  }
});

console.log("\n=== النتائج ===\n");

if (issues.length === 0) {
  console.log("✓ لا توجد مشاكل في أسماء الملفات!");
  console.log(
    "✓ جميع استخدامات require تطابق أسماء الملفات الفعلية بشكل صحيح.",
  );
} else {
  console.log(`✗ تم العثور على ${issues.length} مشكلة:\n`);
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. الملف: ${issue.from}`);
    console.log(`   المطلوب: ${issue.required}`);
    if (issue.error) {
      console.log(`   الخطأ: ${issue.error}`);
    } else {
      console.log(`   المتوقع: ${issue.expected}`);
      console.log(`   الفعلي: ${issue.actual}`);
    }
    console.log("");
  });
}

console.log("\n=== ملفات Validation الموجودة ===");
validationFiles.sort().forEach((f) => console.log(`  - ${f}`));
