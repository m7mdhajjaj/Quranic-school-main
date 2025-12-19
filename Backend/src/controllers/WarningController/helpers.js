// ============================================================================
// WarningController/helpers.js - Shared Helper Functions (DRY)
// ============================================================================
//
// المسؤوليات:
// ✅ منطق الفصل/الإعادة للطلاب (Business Logic)
// ✅ التحقق من الإنذارات المكررة
// ✅ التحقق من صحة تسلسل الإنذارات
// ✅ Validation للمدخلات
//
// 🔄 يُستخدم من قبل:
// - WarningController (للإنشاء/الحذف الفوري)
// - SuspensionService (للإعادة التلقائية عند انتهاء المدة)
// ============================================================================

const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const Warning = require("../../schema/Warning");

/**
 * إرجاع الطالب للحلقة الأصلية بعد إلغاء الفصل
 * 🔄 يُستخدم من: deleteWarning Controller & SuspensionService
 */
async function restoreStudentToGroup(warning) {
  // تعديل: الاستعادة تتم فقط إذا كان الإنذار من النوع الذي يسبب الفصل
  if (!["third", "expulsion"].includes(warning.type)) {
    return false;
  }

  const student = await Student.findById(warning.studentId);
  
  if (!student || !warning.originalGroup) {
    return false;
  }

  // إعادة الطالب للحلقة الأصلية
  student.group = warning.originalGroup;
  
  // ✅ isActive removed - no longer used for account ban
  
  await student.save();

  // إعادة الطالب لقائمة طلاب الحلقة
  const group = await Group.findOne({ name: warning.originalGroup });
  if (group) {
    if (!group.students) {
      group.students = [];
    }
    
    // إضافة الطالب إذا لم يكن موجوداً
    if (!group.students.some((id) => id.toString() === student._id.toString())) {
      group.students.push(student._id);
      await group.save();
    }
  }

  console.log(
    `✅ تمت إعادة الطالب ${student.firstName} إلى الحلقة ${warning.originalGroup}`
  );
  
  return true;
}

/**
 * فصل الطالب من الحلقة (مؤقت أو دائم)
 * 🔄 يُستخدم من: createWarning Controller فقط (الفصل الفوري)
 */
async function suspendStudentFromGroup(student, group, type, originalGroup) {
  console.log(`⚠️ Processing suspension for student from group: ${originalGroup}`);
  
  try {
    // استخدام findByIdAndUpdate لضمان التحديث وإرجاع الوثيقة المحدثة
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { 
        $set: { 
          group: null,
          teacher: null
        } 
      },
      { new: true, runValidators: false } // runValidators: false لتجنب مشاكل التحقق من الحقول المطلوبة
    );
    
    if (!updatedStudent) {
      console.error(`❌ Failed to find student to suspend: ${student._id}`);
      throw new Error("Student not found for suspension");
    }

    console.log(`✅ Student suspended. New group: ${updatedStudent.group}`);
    
    // تحديث الكائن المحلي أيضاً للاستخدام اللاحق
    student.group = null;
    student.teacher = null;

    // إزالة الطالب من قائمة طلاب الحلقة إذا كانت موجودة
    if (group.students && Array.isArray(group.students)) {
      group.students = group.students.filter(
        (id) => id.toString() !== student._id.toString()
      );
      await group.save();
      console.log(`✅ Student removed from group array`);
    }
    
    console.log(`✅ Student suspended successfully`);
  } catch (error) {
    console.error(`❌ Error suspending student:`, error);
    throw error;
  }
}

/**
 * التحقق من وجود إنذار سابق من نفس النوع
 */
async function checkDuplicateWarning(studentId, type) {
  if (type === "warning") {
    return null; // السماح بتعدد التنبيهات
  }

  const existingWarning = await Warning.findOne({
    studentId,
    type,
  });

  if (existingWarning) {
    const warningTypeNames = {
      first: "الإنذار الأول",
      second: "الإنذار الثاني",
      third: "الإنذار الثالث",
      expulsion: "الفصل النهائي",
    };

    return {
      message: `الطالب حاصل على ${warningTypeNames[type]} مسبقاً. لا يمكن إعطاء نفس الإنذار مرتين.`,
      existingWarning: {
        type: existingWarning.type,
        date: existingWarning.createdAt,
        reason: existingWarning.reason,
      },
    };
  }

  return null;
}

/**
 * التحقق من تسلسل الإنذارات
 */
async function validateWarningSequence(studentId, type) {
  if (type === "warning" || type === "first") {
    return null; // التنبيه والإنذار الأول لا يحتاجان تحقق
  }

  const studentWarnings = await Warning.find({ studentId });
  
  if (type === "second") {
    const hasFirst = studentWarnings.some(w => w.type === "first");
    if (!hasFirst) {
      return {
        message: "لا يمكن إعطاء إنذار ثاني قبل إعطاء الإنذار الأول",
        requiredWarning: "الإنذار الأول"
      };
    }
  }
  
  if (type === "third") {
    const hasFirst = studentWarnings.some(w => w.type === "first");
    const hasSecond = studentWarnings.some(w => w.type === "second");
    if (!hasFirst || !hasSecond) {
      return {
        message: "لا يمكن إعطاء إنذار ثالث قبل إعطاء الإنذار الأول والثاني",
        requiredWarnings: ["الإنذار الأول", "الإنذار الثاني"]
      };
    }
  }
  
  if (type === "expulsion") {
    const hasFirst = studentWarnings.some(w => w.type === "first");
    const hasSecond = studentWarnings.some(w => w.type === "second");
    const hasThird = studentWarnings.some(w => w.type === "third");
    if (!hasFirst || !hasSecond || !hasThird) {
      return {
        message: "لا يمكن فصل الطالب قبل إعطائه الإنذارات الثلاثة",
        requiredWarnings: ["الإنذار الأول", "الإنذار الثاني", "الإنذار الثالث"]
      };
    }
  }

  return null;
}

/**
 * التحقق من صحة البيانات الأساسية
 */
function validateBasicInput(studentId, teacherId, type, reason) {
  if (!studentId || !teacherId || !type || !reason) {
    return {
      message: "البيانات المطلوبة ناقصة",
      missing: {
        studentId: !studentId,
        teacherId: !teacherId,
        type: !type,
        reason: !reason
      }
    };
  }
  return null;
}

/**
 * البحث عن الحلقة بالـ ID أو الاسم
 */
async function findGroup(groupId, groupName) {
  if (!groupId && !groupName) {
    return { error: "يجب تحديد الحلقة (ID أو الاسم)" };
  }

  try {
    let group;
    if (groupId) {
      console.log(`🔍 Looking for group by ID: ${groupId}`);
      group = await Group.findById(groupId);
    } else if (groupName) {
      console.log(`🔍 Looking for group by name: ${groupName}`);
      group = await Group.findOne({ name: groupName });
    }

    if (!group) {
      return {
        error: "الحلقة غير موجودة",
        searchedBy: groupId ? "ID" : "name",
        searchedValue: groupId || groupName
      };
    }

    console.log(`✅ Group found: ${group.name} (ID: ${group._id})`);
    return { group };
  } catch (dbError) {
    console.error("❌ Database error while finding group:", dbError);
    return {
      error: "خطأ في الاتصال بقاعدة البيانات",
      details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
    };
  }
}

/**
 * التحقق من وجود الطالب والمعلم
 */
async function verifyStudentAndTeacher(studentId, teacherId) {
  const Teacher = require("../../schema/Teacher");
  
  try {
    console.log(`🔍 Looking for student by ID: ${studentId}`);
    const student = await Student.findById(studentId);
    
    if (!student) {
      return { error: "الطالب غير موجود" };
    }
    console.log(`✅ Student found: ${student.firstName} ${student.lastName} (ID: ${student._id})`);

    console.log(`🔍 Looking for teacher by ID: ${teacherId}`);
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return { error: "المعلم غير موجود" };
    }
    console.log(`✅ Teacher found: ${teacher.firstName} ${teacher.lastName} (ID: ${teacher._id})`);

    return { student, teacher };
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    return {
      error: "خطأ في الاتصال بقاعدة البيانات",
      details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
    };
  }
}

/**
 * الحصول على الحلقة الأصلية للطالب (حتى لو كان مفصول)
 */
async function getStudentOriginalGroup(student, studentId) {
  let studentOriginalGroup = student.group;
  
  if (!student.group) {
    // الطالب مفصول، ابحث عن آخر إنذار نشط
    const lastWarning = await Warning.findOne({
      studentId,
      isActive: true,
      suspensionType: { $in: ["temporary", "permanent"] },
    }).sort({ createdAt: -1 });
    
    if (lastWarning && lastWarning.originalGroup) {
      studentOriginalGroup = lastWarning.originalGroup;
    }
  }
  
  return studentOriginalGroup;
}

module.exports = {
  restoreStudentToGroup,
  suspendStudentFromGroup,
  checkDuplicateWarning,
  validateWarningSequence,
  validateBasicInput,
  findGroup,
  verifyStudentAndTeacher,
  getStudentOriginalGroup,
};
