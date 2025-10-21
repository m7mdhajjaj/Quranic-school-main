// ============================================================================
// examMarkNotifications.js - نظام الإشعارات للعلامات
// ============================================================================

const Student = require("../../schema/Student");
const Exam = require("../../schema/Exam");

/**
 * إرسال إشعار عند إضافة علامة لطالب واحد
 */
const notifyMarkAdded = async (examMark, io) => {
  try {
    console.log("🔔 ========== MARK NOTIFICATION START (ADD) ==========");
    console.log("📝 Mark Details:", {
      student: examMark.student,
      exam: examMark.exam,
      mark: examMark.mark,
    });

    // التحقق من أن البيانات populated
    let exam = examMark.exam;
    let student = examMark.student;

    // إذا لم تكن populated، نجلبها
    if (typeof exam === 'string' || !exam.name) {
      exam = await Exam.findById(examMark.exam);
    }
    if (typeof student === 'string' || !student.firstName) {
      student = await Student.findById(examMark.student);
    }

    if (!exam) {
      console.log("❌ Exam not found");
      return;
    }

    if (!student) {
      console.log("❌ Student not found");
      return;
    }

    console.log(`📚 Exam: ${exam.name}`);
    console.log(`👤 Student: ${student.firstName} ${student.lastName}`);

    // إرسال إشعار للطالب
    if (global.notificationService) {
      await global.notificationService.createNotification({
        recipient: student._id,
        recipientModel: "Student",
        type: "grade",
        title: "📊 علامة جديدة",
        message: `تم إضافة علامتك في امتحان "${exam.name}": ${examMark.mark}/${exam.totalMark || 100}`,
        data: {
          examId: exam._id.toString(),
          examName: exam.name,
          mark: examMark.mark,
          totalMark: exam.totalMark || 100,
          detail: examMark.detail || "",
        },
        priority: "high",
      });

      console.log(`✅ Notification sent to student ${student._id}`);
    } else {
      console.log("⚠️ NotificationService not available");
    }

    console.log("🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========");
  } catch (error) {
    console.error("❌ Error in notifyMarkAdded:", error);
    console.log("🔔 ========== MARK NOTIFICATION END (ERROR) ==========");
  }
};

/**
 * إرسال إشعارات عند إضافة علامات لعدة طلاب
 */
const notifyMarksAdded = async (examId, marks, io) => {
  try {
    console.log("🔔 ========== BULK MARKS NOTIFICATION START ==========");
    console.log(`📝 Adding marks for ${marks.length} students`);

    // جلب بيانات الامتحان
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log("❌ Exam not found");
      return;
    }

    console.log(`📚 Exam: ${exam.name}`);

    // جلب بيانات جميع الطلاب
    const studentIds = marks.map((m) => m.student);
    const students = await Student.find({ _id: { $in: studentIds } });

    console.log(`👥 Found ${students.length} students`);

    // إرسال إشعار لكل طالب
    if (global.notificationService) {
      let successCount = 0;

      for (const student of students) {
        const markData = marks.find((m) => m.student.toString() === student._id.toString());
        if (markData) {
          await global.notificationService.createNotification({
            recipient: student._id,
            recipientModel: "Student",
            type: "grade",
            title: "📊 علامة جديدة",
            message: `تم إضافة علامتك في امتحان "${exam.name}": ${markData.mark}/${exam.totalMark || 100}`,
            data: {
              examId: exam._id.toString(),
              examName: exam.name,
              mark: markData.mark,
              totalMark: exam.totalMark || 100,
              detail: markData.detail || "",
            },
            priority: "high",
          });

          successCount++;
          console.log(`✅ Notification sent to ${student.firstName} ${student.lastName}`);
        }
      }

      console.log(`📤 Sent ${successCount} notifications successfully`);
    } else {
      console.log("⚠️ NotificationService not available");
    }

    console.log("🔔 ========== BULK MARKS NOTIFICATION END (SUCCESS) ==========");
  } catch (error) {
    console.error("❌ Error in notifyMarksAdded:", error);
    console.log("🔔 ========== BULK MARKS NOTIFICATION END (ERROR) ==========");
  }
};

/**
 * إرسال إشعار عند تعديل علامة طالب
 */
const notifyMarkUpdated = async (examMark, io) => {
  try {
    console.log("🔔 ========== MARK NOTIFICATION START (UPDATE) ==========");
    console.log("📝 Updated Mark:", {
      student: examMark.student,
      exam: examMark.exam,
      mark: examMark.mark,
    });

    // التحقق من أن البيانات populated
    let exam = examMark.exam;
    let student = examMark.student;

    // إذا لم تكن populated، نجلبها
    if (typeof exam === 'string' || !exam.name) {
      exam = await Exam.findById(examMark.exam);
    }
    if (typeof student === 'string' || !student.firstName) {
      student = await Student.findById(examMark.student);
    }

    if (!exam) {
      console.log("❌ Exam not found");
      return;
    }

    if (!student) {
      console.log("❌ Student not found");
      return;
    }

    console.log(`📚 Exam: ${exam.name}`);
    console.log(`👤 Student: ${student.firstName} ${student.lastName}`);

    // إرسال إشعار للطالب
    if (global.notificationService) {
      await global.notificationService.createNotification({
        recipient: student._id,
        recipientModel: "Student",
        type: "grade",
        title: "✏️ تم تعديل علامتك",
        message: `تم تعديل علامتك في امتحان "${exam.name}": ${examMark.mark}/${exam.totalMark || 100}`,
        data: {
          examId: exam._id.toString(),
          examName: exam.name,
          mark: examMark.mark,
          totalMark: exam.totalMark || 100,
          detail: examMark.detail || "",
        },
        priority: "high",
      });

      console.log(`✅ Update notification sent to student ${student._id}`);
    } else {
      console.log("⚠️ NotificationService not available");
    }

    console.log("🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========");
  } catch (error) {
    console.error("❌ Error in notifyMarkUpdated:", error);
    console.log("🔔 ========== MARK NOTIFICATION END (ERROR) ==========");
  }
};

/**
 * إرسال إشعار عند حذف علامة طالب
 */
const notifyMarkDeleted = async (examId, studentId, io) => {
  try {
    console.log("🔔 ========== MARK NOTIFICATION START (DELETE) ==========");
    console.log("🗑️ Deleting mark for:", { student: studentId, exam: examId });

    // جلب بيانات الامتحان
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log("❌ Exam not found");
      return;
    }

    // جلب بيانات الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      console.log("❌ Student not found");
      return;
    }

    console.log(`📚 Exam: ${exam.name}`);
    console.log(`👤 Student: ${student.firstName} ${student.lastName}`);

    // إرسال إشعار للطالب
    if (global.notificationService) {
      await global.notificationService.createNotification({
        recipient: student._id,
        recipientModel: "Student",
        type: "grade",
        title: "🗑️ تم حذف علامة",
        message: `تم حذف علامتك في امتحان "${exam.name}"`,
        data: {
          examId: exam._id.toString(),
          examName: exam.name,
        },
        priority: "medium",
      });

      console.log(`✅ Delete notification sent to student ${student._id}`);
    } else {
      console.log("⚠️ NotificationService not available");
    }

    console.log("🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========");
  } catch (error) {
    console.error("❌ Error in notifyMarkDeleted:", error);
    console.log("🔔 ========== MARK NOTIFICATION END (ERROR) ==========");
  }
};

module.exports = {
  notifyMarkAdded,
  notifyMarksAdded,
  notifyMarkUpdated,
  notifyMarkDeleted,
};
