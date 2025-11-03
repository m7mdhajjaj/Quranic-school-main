// ============================================
// DELETE GROUP OPERATIONS
// ============================================

const Group = require("../../schema/Group");
const Teacher = require("../../schema/Teacher");
const Student = require("../../schema/Student");
const { invalidateStudentCountsCache } = require("./cache");

/**
 * حذف حلقة (حذف فعلي من قاعدة البيانات)
 */
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // التحقق من وجود طلاب في الحلقة وإزالتها منهم
    const relatedStudents = await Student.find({
      group: group.name,
    });

    if (relatedStudents.length > 0) {
      console.log(
        `📝 يوجد ${relatedStudents.length} طالب في الحلقة "${group.name}"، سيتم إزالة الحلقة منهم...`
      );

      // إزالة الحلقة من جميع الطلاب المرتبطين بها
      await Student.updateMany(
        { group: group.name },
        { $unset: { group: "" } }
      );

      console.log(`✅ تم إزالة الحلقة من ${relatedStudents.length} طالب`);
    }

    // إزالة الحلقة من المعلمين المرتبطين بها
    await Teacher.updateMany(
      { "groups.id": id },
      { $pull: { groups: { id: id } } }
    );
    console.log(`✅ تم إزالة الحلقة من المعلمين المرتبطين`);

    // حذف فعلي للحلقة من قاعدة البيانات
    await Group.findByIdAndDelete(id);

    console.log(`🗑️ تم حذف الحلقة "${group.name}" نهائياً من قاعدة البيانات`);

    // إبطال cache عدد الطلاب
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit("groupDeleted", { groupId: id, groupName: group.name });
      console.log("📡 Group deleted event emitted via socket");
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الحلقة بنجاح",
      deletedStudentsCount: relatedStudents.length,
    });
  } catch (error) {
    console.error("❌ خطأ في حذف الحلقة:", error);
    console.error("📋 تفاصيل الخطأ:", error.message);
    console.error("📚 Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الحلقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
