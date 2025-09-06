const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Teacher = require("./src/models/Teacher");
const config = require("./src/config/db");

// اتصال بقاعدة البيانات
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("تم الاتصال بقاعدة البيانات بنجاح"))
  .catch((err) => {
    console.error("فشل الاتصال بقاعدة البيانات:", err);
    process.exit(1);
  });

const createDefaultTeacher = async () => {
  try {
    // التحقق مما إذا كان المعلم موجوداً بالفعل
    const existingTeacher = await Teacher.findOne({ teacherId: 1001 });

    if (existingTeacher) {
      console.log("المعلم موجود بالفعل!");
      process.exit(0);
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // إنشاء معلم جديد
    const teacher = await Teacher.create({
      teacherId: 1001,
      firstName: "المعلم",
      lastName: "الافتراضي",
      email: "teacher@example.com",
      phoneNumber: "05xxxxxxxx",
      password: hashedPassword,
      groups: ["المجموعة 1", "المجموعة 2"],
      role: "admin",
    });

    console.log("تم إنشاء المعلم بنجاح:", {
      teacherId: teacher.teacherId,
      name: `${teacher.firstName} ${teacher.lastName}`,
      email: teacher.email,
      role: teacher.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("حدث خطأ أثناء إنشاء المعلم:", error);
    process.exit(1);
  }
};

createDefaultTeacher();
