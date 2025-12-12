const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Group = require("../../schema/Group");

/**
 * التحقق من وجود تكرار للحقول الحساسة عبر جميع أنواع المستخدمين
 * @param {Object} data - البيانات المراد التحقق منها
 * @param {string} data.email - البريد الإلكتروني
 * @param {string} data.phoneNumber - رقم الهاتف
 * @param {string} data.idNumber - رقم الهوية
 * @param {string} excludeId - معرف المستخدم المراد استثناؤه (في حالة التحديث)
 * @param {string} excludeType - نوع المستخدم المراد استثناؤه ('student', 'teacher', 'admin')
 * @returns {Object|null} - كائن الخطأ إذا وجد تكرار، null إذا لم يوجد
 */
async function checkDuplicateFields(data, excludeId = null, excludeType = null) {
  const { email, phoneNumber, idNumber } = data;
  
  // إعداد شروط الاستثناء
  const getExcludeQuery = (type) => {
    if (excludeId && excludeType === type) {
      return { _id: { $ne: excludeId } };
    }
    return {};
  };

  try {
    // فحص رقم الهوية
    if (idNumber) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ idNumber, ...getExcludeQuery('student') }),
        Teacher.findOne({ idNumber, ...getExcludeQuery('teacher') }),
        Admin.findOne({ idNumber, ...getExcludeQuery('admin') })
      ]);

      if (existingStudent) {
        return {
          success: false,
          message: `رقم الهوية "${idNumber}" مُستخدم بالفعل لطالب في النظام`,
          field: "idNumber",
          duplicateValue: idNumber,
          existingUserType: "طالب",
          existingUserName: `${existingStudent.firstName} ${existingStudent.lastName}`
        };
      }

      if (existingTeacher) {
        return {
          success: false,
          message: `رقم الهوية "${idNumber}" مُستخدم بالفعل لمعلم في النظام`,
          field: "idNumber",
          duplicateValue: idNumber,
          existingUserType: "معلم",
          existingUserName: `${existingTeacher.firstName} ${existingTeacher.lastName}`
        };
      }

      if (existingAdmin) {
        return {
          success: false,
          message: `رقم الهوية "${idNumber}" مُستخدم بالفعل لمدير في النظام`,
          field: "idNumber",
          duplicateValue: idNumber,
          existingUserType: "مدير",
          existingUserName: `${existingAdmin.firstName} ${existingAdmin.lastName}`
        };
      }
    }

    // فحص البريد الإلكتروني
    if (email) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ email, ...getExcludeQuery('student') }),
        Teacher.findOne({ email, ...getExcludeQuery('teacher') }),
        Admin.findOne({ email, ...getExcludeQuery('admin') })
      ]);

      if (existingStudent) {
        return {
          success: false,
          message: `البريد الإلكتروني "${email}" مُستخدم بالفعل لطالب في النظام`,
          field: "email",
          duplicateValue: email,
          existingUserType: "طالب",
          existingUserName: `${existingStudent.firstName} ${existingStudent.lastName}`
        };
      }

      if (existingTeacher) {
        return {
          success: false,
          message: `البريد الإلكتروني "${email}" مُستخدم بالفعل لمعلم في النظام`,
          field: "email",
          duplicateValue: email,
          existingUserType: "معلم",
          existingUserName: `${existingTeacher.firstName} ${existingTeacher.lastName}`
        };
      }

      if (existingAdmin) {
        return {
          success: false,
          message: `البريد الإلكتروني "${email}" مُستخدم بالفعل لمدير في النظام`,
          field: "email",
          duplicateValue: email,
          existingUserType: "مدير",
          existingUserName: `${existingAdmin.firstName} ${existingAdmin.lastName}`
        };
      }
    }

    // فحص رقم الهاتف
    if (phoneNumber) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ phoneNumber, ...getExcludeQuery('student') }),
        Teacher.findOne({ phoneNumber, ...getExcludeQuery('teacher') }),
        Admin.findOne({ phoneNumber, ...getExcludeQuery('admin') })
      ]);

      if (existingStudent) {
        return {
          success: false,
          message: `رقم الهاتف "${phoneNumber}" مُستخدم بالفعل لطالب في النظام`,
          field: "phoneNumber",
          duplicateValue: phoneNumber,
          existingUserType: "طالب",
          existingUserName: `${existingStudent.firstName} ${existingStudent.lastName}`
        };
      }

      if (existingTeacher) {
        return {
          success: false,
          message: `رقم الهاتف "${phoneNumber}" مُستخدم بالفعل لمعلم في النظام`,
          field: "phoneNumber",
          duplicateValue: phoneNumber,
          existingUserType: "معلم",
          existingUserName: `${existingTeacher.firstName} ${existingTeacher.lastName}`
        };
      }

      if (existingAdmin) {
        return {
          success: false,
          message: `رقم الهاتف "${phoneNumber}" مُستخدم بالفعل لمدير في النظام`,
          field: "phoneNumber",
          duplicateValue: phoneNumber,
          existingUserType: "مدير",
          existingUserName: `${existingAdmin.firstName} ${existingAdmin.lastName}`
        };
      }
    }

    // لا يوجد تكرار
    return null;

  } catch (error) {
    console.error("خطأ في التحقق من تكرار البيانات:", error);
    throw new Error("حدث خطأ أثناء التحقق من البيانات في قاعدة البيانات");
  }
}

/**
 * دالة مساعدة للتحقق من التكرار وإرجاع استجابة HTTP مناسبة
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Object} data - البيانات المراد التحقق منها
 * @param {string} excludeId - معرف المستخدم المراد استثناؤه
 * @param {string} excludeType - نوع المستخدم المراد استثناؤه
 * @returns {boolean} - true إذا وجد تكرار (تم إرسال استجابة خطأ), false إذا لم يوجد تكرار
 */
async function validateAndCheckDuplicates(req, res, data, excludeId = null, excludeType = null) {
  try {
    const duplicateError = await checkDuplicateFields(data, excludeId, excludeType);
    
    if (duplicateError) {
      return res.status(400).json(duplicateError);
    }
    
    return false; // لا يوجد تكرار
  } catch (error) {
    console.error("خطأ في التحقق من التكرار:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من البيانات"
    });
  }
}

/**
 * التحقق من تكرار اسم الحلقة
 * @param {string} groupName - اسم الحلقة المراد التحقق منه
 * @param {string} excludeId - معرف الحلقة المراد استثناؤها (في حالة التحديث)
 * @returns {Object|null} - كائن الخطأ إذا وجد تكرار، null إذا لم يوجد
 */
async function checkDuplicateGroupName(groupName, excludeId = null) {
  try {
    console.log(`🔍 فحص تكرار اسم الحلقة: "${groupName}"`);

    // إعداد الاستعلام
    const query = { name: groupName.trim() };
    
    // استثناء الحلقة الحالية عند التعديل
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // البحث عن حلقة بنفس الاسم
    const existingGroup = await Group.findOne(query);

    if (existingGroup) {
      console.log(`❌ اسم الحلقة "${groupName}" موجود بالفعل`);
      return {
        success: false,
        isDuplicate: true,
        message: `اسم الحلقة "${groupName}" موجود بالفعل، يرجى اختيار اسم آخر`,
        field: "name",
        duplicateValue: groupName,
        existingGroupId: existingGroup._id,
        existingGroupName: existingGroup.name,
      };
    }

    console.log(`✅ اسم الحلقة "${groupName}" متاح`);
    return null;

  } catch (error) {
    console.error("❌ خطأ في فحص تكرار اسم الحلقة:", error);
    throw new Error("حدث خطأ أثناء التحقق من اسم الحلقة في قاعدة البيانات");
  }
}

/**
 * دالة مساعدة للتحقق من تكرار اسم الحلقة وإرجاع استجابة HTTP مناسبة
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {string} groupName - اسم الحلقة
 * @param {string} excludeId - معرف الحلقة المراد استثناؤها
 * @returns {boolean} - true إذا وجد تكرار (تم إرسال استجابة خطأ), false إذا لم يوجد تكرار
 */
async function validateAndCheckGroupName(req, res, groupName, excludeId = null) {
  try {
    const duplicateError = await checkDuplicateGroupName(groupName, excludeId);
    
    if (duplicateError) {
      return res.json({
        success: true,
        isDuplicate: true,
        message: duplicateError.message,
        field: duplicateError.field,
        existingGroupName: duplicateError.existingGroupName,
      });
    }
    
    return res.json({
      success: true,
      isDuplicate: false,
      message: "اسم الحلقة متاح",
    });
  } catch (error) {
    console.error("خطأ في التحقق من تكرار اسم الحلقة:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من اسم الحلقة"
    });
  }
}

module.exports = {
  checkDuplicateFields,
  validateAndCheckDuplicates,
  checkDuplicateGroupName,
  validateAndCheckGroupName,
};
