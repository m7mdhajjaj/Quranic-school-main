// ============================================================================
// WarningController/createWarning.js - Create Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const {
  validateBasicInput,
  findGroup,
  verifyStudentAndTeacher,
  getStudentOriginalGroup,
  checkDuplicateWarning,
  validateWarningSequence,
  suspendStudentFromGroup,
} = require("./helpers");

/**
 * إنشاء إنذار جديد (للمعلم فقط)
 * @route POST /api/warnings
 */
exports.createWarning = async (req, res) => {
  try {
    console.log("📝 Creating warning - Full request body:", req.body);
    console.log("📝 Creating warning with data:", {
      studentId: req.body.studentId,
      teacherId: req.body.teacherId,
      groupId: req.body.groupId,
      groupName: req.body.groupName,
      type: req.body.type,
      reason: req.body.reason ? req.body.reason.substring(0, 50) + "..." : "N/A"
    });

    const { studentId, teacherId, groupId, groupName, type, reason } = req.body;

    // التحقق من المدخلات الأساسية
    const inputError = validateBasicInput(studentId, teacherId, type, reason);
    if (inputError) {
      console.error("❌ Missing required fields");
      return res.status(400).json(inputError);
    }

    // البحث عن الحلقة
    const groupResult = await findGroup(groupId, groupName);
    if (groupResult.error) {
      return res.status(groupResult.error.includes("قاعدة البيانات") ? 500 : 404).json({ 
        message: groupResult.error,
        searchedBy: groupResult.searchedBy,
        searchedValue: groupResult.searchedValue
      });
    }
    const { group } = groupResult;

    // التحقق من وجود الطالب والمعلم
    const verifyResult = await verifyStudentAndTeacher(studentId, teacherId);
    if (verifyResult.error) {
      return res.status(404).json({ message: verifyResult.error });
    }
    const { student, teacher } = verifyResult;

    // الحصول على الحلقة الأصلية للطالب
    const studentOriginalGroup = await getStudentOriginalGroup(student, studentId);

    // التحقق من أن الطالب تابع لهذه الحلقة
    if (studentOriginalGroup !== group.name) {
      return res.status(400).json({
        message: "الطالب غير مسجل في هذه الحلقة",
        studentGroup: studentOriginalGroup || "لا يوجد",
        expectedGroup: group.name,
      });
    }

    // التحقق من عدم وجود إنذار سابق من نفس النوع
    const duplicateError = await checkDuplicateWarning(studentId, type);
    if (duplicateError) {
      return res.status(400).json(duplicateError);
    }

    // التحقق من تسلسل الإنذارات
    const sequenceError = await validateWarningSequence(studentId, type);
    if (sequenceError) {
      return res.status(400).json(sequenceError);
    }

    // إنشاء الإنذار
    console.log(`📝 Creating warning document...`);
    const warning = new Warning({
      studentId,
      teacherId,
      groupId: group._id, // استخدم الـ ID الحقيقي للحلقة
      originalGroup: studentOriginalGroup, // حفظ الحلقة الأصلية (سواء كان الطالب في حلقة أو مفصول)
      type,
      reason,
    });

    try {
      await warning.save();
      console.log(`✅ Warning saved successfully: ${warning._id}`);
    } catch (saveError) {
      console.error("❌ Error saving warning:", saveError);
      throw saveError; // Re-throw to be caught by outer catch
    }

    // إذا كان فصل (مؤقت أو دائم)، قم بإزالة الطالب من الحلقة
    if (["first", "second", "third", "expulsion"].includes(type)) {
      await suspendStudentFromGroup(student, group, type, studentOriginalGroup);
    }

    // إرجاع الإنذار مع البيانات المرتبطة
    const populatedWarning = await Warning.findById(warning._id)
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name");

    // 🔔 إرسال إشعار Socket.IO لتحديث الواجهة فوراً
    if (global.io) {
      global.io.emit('warningCreated', populatedWarning);
      global.io.emit('warningStatisticsUpdated', { timestamp: new Date() });
      console.log('📡 Socket.IO: Warning created event emitted');
    }

    res.status(201).json(populatedWarning);
  } catch (error) {
    console.error("❌ Error creating warning:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    
    res.status(500).json({ 
      message: "حدث خطأ أثناء إنشاء الإنذار",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};
