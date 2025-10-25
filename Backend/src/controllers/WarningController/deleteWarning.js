// ============================================================================
// WarningController/deleteWarning.js - Delete Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");

/**
 * حذف إنذار (للمعلم أو المدير)
 * @route DELETE /api/warnings/:warningId
 */
exports.deleteWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    // جلب الإنذار قبل الحذف للتحقق
    const warning = await Warning.findById(warningId);

    if (!warning) {
      return res.status(404).json({ message: "الإنذار غير موجود" });
    }

    // إذا كان إنذار فصل نهائي، نحتاج لإعادة الطالب للحلقة
    if (warning.type === "expulsion") {
      const student = await Student.findById(warning.studentId);
      const group = await Group.findById(warning.groupId);

      if (student && group) {
        // إعادة الطالب للحلقة
        student.group = group.name;
        student.isActive = true;
        await student.save();

        // إعادة الطالب لقائمة طلاب الحلقة إذا لم يكن موجوداً
        if (
          group.students &&
          !group.students.some((id) => id.toString() === student._id.toString())
        ) {
          group.students.push(student._id);
          await group.save();
        }

        console.log(
          `✅ تمت إعادة الطالب ${student.firstName} إلى الحلقة ${group.name}`
        );
      }
    }

    // حذف الإنذار
    await Warning.findByIdAndDelete(warningId);

    // إرسال تحديث Socket للمستخدمين المتصلين
    const io = req.app.get("io");
    if (io) {
      io.to("warnings").emit("warningDeleted", { warningId });
      console.log(`🗑️ Warning deleted event emitted to warnings room`);
    }

    res.json({
      message: "تم حذف الإنذار بنجاح",
      restoredStudent: warning.type === "expulsion",
    });
  } catch (error) {
    console.error("Error deleting warning:", error);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الإنذار" });
  }
};
