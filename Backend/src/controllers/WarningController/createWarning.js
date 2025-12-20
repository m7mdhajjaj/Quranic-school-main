// ============================================================================
// WarningController/createWarning.js - Create Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const { notifyStudentWarning } = require("../../Notifications");
const { invalidateCache } = require("../../middleware/cacheMiddleware");
const { invalidateStudentCountsCache } = require("../basicController/groupController/cache");
const {
  validateBasicInput,
  findGroup,
  verifyStudentAndTeacher,
  getStudentOriginalGroup,
  checkDuplicateWarning,
  validateWarningSequence,
  suspendStudentFromGroup,
} = require("./helpers");
const { logWarningEvent, logExpulsionEvent } = require("../basicController/studentController/history/helpers/warningHistory");

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

    let { studentId, teacherId, groupId, groupName, type, reason } = req.body;

    // 🔒 التحقق من أن المعلم المُسجّل الدخول هو نفسه (إلا إذا كان مدير)
    if (req.user.role !== 'admin' && req.user._id.toString() !== teacherId) {
      console.warn(`⚠️ Unauthorized warning creation attempt - Logged in: ${req.user._id}, Attempted as: ${teacherId}`);
      return res.status(403).json({
        message: "غير مصرح لك بإنشاء إنذارات باسم معلم آخر"
      });
    }

    // التحقق من المدخلات الأساسية
    const inputError = validateBasicInput(studentId, teacherId, type, reason);
    if (inputError) {
      console.error("❌ Missing required fields");
      return res.status(400).json(inputError);
    }

    // ⚡️ تحسين الأداء: تنفيذ التحققات المستقلة بشكل متوازي
    const [groupResult, verifyResult] = await Promise.all([
      findGroup(groupId, groupName),
      verifyStudentAndTeacher(studentId, teacherId)
    ]);

    // التحقق من نتيجة البحث عن الحلقة
    if (groupResult.error) {
      return res.status(groupResult.error.includes("قاعدة البيانات") ? 500 : 404).json({ 
        message: groupResult.error,
        searchedBy: groupResult.searchedBy,
        searchedValue: groupResult.searchedValue
      });
    }
    const { group } = groupResult;

    // التحقق من نتيجة الطالب والمعلم
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

    // ============================================================
    // 🔄 منطق الترقية التلقائية (3 تنبيهات -> إنذار أول -> ...)
    // ============================================================
    if (type === 'warning') {
      const existingAlerts = await Warning.find({ 
        studentId, 
        type: 'warning',
        status: 'active' // فقط التنبيهات النشطة
      });
      
      // إذا كان لديه تنبيهين سابقين (وهذا الثالث)
      if (existingAlerts.length >= 2) {
        console.log(`🔄 Auto-upgrading alerts for student ${studentId}`);
        
        // 1. حذف التنبيهات السابقة
        await Warning.deleteMany({ studentId, type: 'warning' });
        
        // 2. ترقية النوع إلى "إنذار أول"
        type = 'first';
        reason = `${reason} (تلقائي: تراكم 3 تنبيهات)`;
        
        // 3. التحقق التسلسلي للترقية للأعلى
        const existingFirst = await Warning.findOne({ 
          studentId, 
          type: 'first',
          status: 'active'
        });
        if (existingFirst) {
          type = 'second';
          reason = `${reason} -> ترقية لإنذار ثاني`;
          
          const existingSecond = await Warning.findOne({ 
            studentId, 
            type: 'second',
            status: 'active'
          });
          if (existingSecond) {
            type = 'third'; // إنذار نهائي (فصل)
            reason = `${reason} -> ترقية لإنذار ثالث`;
            
            const existingThird = await Warning.findOne({ 
              studentId, 
              type: 'third',
              status: 'active'
            });
            if (existingThird) {
              type = 'expulsion'; // فصل نهائي
              reason = `${reason} -> ترقية لفصل نهائي`;
            }
          }
        }
        
        console.log(`🔄 New warning type after upgrade: ${type}`);
      }
    }
    // ============================================================

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
      teacherName: `${teacher.firstName} ${teacher.lastName}`, // حفظ اسم المعلم
      groupName: group.name, // حفظ اسم الحلقة
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
    // تعديل: الفصل يتم فقط في حالة الإنذار الثالث (فصل) أو الطرد
    if (["third", "expulsion"].includes(type)) {
      await suspendStudentFromGroup(student, group, type, studentOriginalGroup);

      // 🗑️ إبطال الكاش لمجموعات المعلم لضمان تحديث العدد فوراً
      const cachePattern = `cache:/api/groups/teacher-id/${teacherId}*`;
      await invalidateCache(cachePattern);
      invalidateStudentCountsCache();
    }

    // إرجاع الإنذار مع البيانات المرتبطة
    const populatedWarning = await Warning.findById(warning._id)
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name");

    // � تسجيل الحدث في التاريخ (History)
    const historyData = {
      _id: warning._id,
      studentId: warning.studentId,
      teacherId: warning.teacherId,
      groupId: warning.groupId,
      groupName: group.name,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      type: warning.type,
      reason: warning.reason
    };

    // تسجيل حسب نوع الإنذار
    if (["third", "expulsion"].includes(type)) {
      // إذا كان فصل، سجله كحدث فصل
      logExpulsionEvent(warning.studentId, historyData, req.user).catch(err =>
        console.error("❌ History logging error:", err)
      );
    } else {
      // إنذار عادي
      logWarningEvent(historyData, req.user).catch(err =>
        console.error("❌ History logging error:", err)
      );
    }

    // �🔔 إرسال إشعار Socket.IO لتحديث الواجهة فوراً
    if (global.io) {
      global.io.emit('warningCreated', populatedWarning);
      global.io.emit('warningStatisticsUpdated', { timestamp: new Date() });
      console.log('📡 Socket.IO: Warning created event emitted');
      
      // 🔔 إرسال إشعار خاص للطالب (Socket + FCM)
      // ⚡️ تحسين الأداء: عدم انتظار الإشعار (Fire and Forget) لتسريع الاستجابة
      notifyStudentWarning(student, populatedWarning, global.io).catch(err => 
        console.error("❌ Background notification error:", err)
      );
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
