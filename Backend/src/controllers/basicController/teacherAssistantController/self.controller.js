// controllers/basicController/teacherAssistantController/self.controller.js
const TeacherAssistant = require("../../../schema/TeacherAssistant");
const Student = require("../../../schema/Student");

/**
 * جلب حلقات مساعد المدرس المسموح له بها
 * @route GET /api/teacher-assistants/my-groups
 * @access TeacherAssistant only
 */
const getMyGroups = async (req, res) => {
  try {
    // التحقق من أن المستخدم هو مساعد مدرس
    if (req.user.role !== 'teacherAssistant') {
      return res.status(403).json({
        success: false,
        message: 'هذا الـ endpoint مخصص لمساعدي المدرسين فقط',
      });
    }

    // جلب بيانات المساعد مع الحلقات المسموح بها
    const assistant = await TeacherAssistant.findById(req.user._id)
      .populate('allowedGroups', '_id name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // تجهيز البيانات بنفس شكل getActiveGroups
    const groupsData = await Promise.all(
      (assistant.allowedGroups || []).map(async (group) => {
        const studentsCount = await Student.countDocuments({ group: group.name });
        return {
          _id: group._id,
          name: group.name,
          studentsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'تم جلب حلقات مساعد المدرس بنجاح',
      data: groupsData,
      count: groupsData.length,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب حلقات مساعد المدرس:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الحلقات',
      error: error.message,
    });
  }
};

/**
 * جلب طلاب الحلقات المسموح لمساعد المدرس بالوصول إليها
 * @route GET /api/teacher-assistants/my-students
 * @access TeacherAssistant only
 */
const getMyStudents = async (req, res) => {
  try {
    // التحقق من أن المستخدم هو مساعد مدرس
    if (req.user.role !== 'teacherAssistant') {
      return res.status(403).json({
        success: false,
        message: 'هذا الـ endpoint مخصص لمساعدي المدرسين فقط',
      });
    }

    // جلب بيانات المساعد مع الحلقات المسموح بها
    const assistant = await TeacherAssistant.findById(req.user._id)
      .populate('allowedGroups', '_id name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // جلب أسماء الحلقات المسموح بها
    const allowedGroupNames = (assistant.allowedGroups || []).map(g => g.name);

    if (allowedGroupNames.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'لا توجد حلقات مسموح بها',
        data: [],
        count: 0,
      });
    }

    // جلب طلاب هذه الحلقات
    const students = await Student.find({ 
      group: { $in: allowedGroupNames } 
    }).select('_id studentId firstName fatherName lastName group teacher avatar isActive');

    res.status(200).json({
      success: true,
      message: 'تم جلب طلاب الحلقات المسموح بها بنجاح',
      data: students,
      count: students.length,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب طلاب مساعد المدرس:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلاب',
      error: error.message,
    });
  }
};

/**
 * جلب بيانات المساعد الحالي (الملف الشخصي)
 * @route GET /api/teacher-assistants/me
 * @access TeacherAssistant only
 */
const getMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'teacherAssistant') {
      return res.status(403).json({
        success: false,
        message: 'هذا الـ endpoint مخصص لمساعدي المدرسين فقط',
      });
    }

    const assistant = await TeacherAssistant.findById(req.user._id)
      .select('-password')
      .populate('assignedTeacher', 'firstName lastName teacherId')
      .populate('allowedGroups', 'name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      data: assistant,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الملف الشخصي',
    });
  }
};

module.exports = {
  getMyGroups,
  getMyStudents,
  getMyProfile,
};
