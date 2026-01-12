// ============================================
// CREATE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Section = require("../../schema/DailyMark/Section");
const Group = require("../../schema/Group");
const { addTimetableToGroup } = require("./Helper/groupHelpers");
const { checkTimetableConflict, checkSessionConflict } = require("./Helper/conflictChecker");

/**
 * إضافة موعد جديد
 */
exports.createTimetable = async (req, res) => {
  try {
    const timetableData = req.validatedData || req.body;
    let { day, startHour, endHour, note, description, sessionType, teacherId, sectionId } = timetableData;

    // ✅ فحص الصلاحيات: المعلم يمكنه إضافة مواعيد لنفسه فقط (بناءً على teacherId)
    const currentUser = req.user;
    if (currentUser && currentUser.role === 'teacher') {
      console.log(`👨‍🏫 محاولة إضافة من المعلم ${currentUser._id} - teacherId في البيانات: ${teacherId}`);
      // التأكد من أن teacherId في البيانات يطابق ID المعلم الحالي
      if (!teacherId || teacherId.toString() !== currentUser._id.toString()) {
        console.log(`🚫 محاولة إضافة غير مصرح بها: teacherId لا يطابق`);
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "غير مسموح لك بإضافة مواعيد لمعلمين آخرين - يمكنك فقط إضافة مواعيدك الخاصة",
        });
      }
      console.log(`✅ الصلاحيات صحيحة - يضيف المعلم موعده الخاص`);
    }

    // ✅ إذا كان الموعد مرتبط بمقطع، احصل على تاريخ المقطع واشتق اليوم إذا لزم الأمر
    let sessionDate = null;
    let section = null;
    
    if (sectionId) {
      section = await Section.findById(sectionId);
      if (!section) {
         return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "المقطع المرتبط غير موجود",
        });
      }
      sessionDate = section.date; // نسخ التاريخ من المقطع

      // ✅ اشتقاق اليوم تلقائياً إذا لم يتم تحديده
      if (!day && sessionDate) {
        const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        // التأكد من التاريخ ككائن Date
        const dateObj = new Date(sessionDate);
        if (!isNaN(dateObj.getTime())) {
          // استخدام getDay() بدلاً من getUTCDay() لأن التاريخ يُحفظ بالتوقيت المحلي
          // هذا يضمن الحصول على اليوم الصحيح بغض النظر عن timezone
          const dayIndex = dateObj.getDay(); // 0 = الأحد
          day = arabicDays[dayIndex];
          // تحديث الكائن الأصلي أيضاً لأنه يستخدم في التحقق من التعارض
          timetableData.day = day;
          console.log(`🤖 تم اشتقاق اليوم تلقائياً: ${day} من التاريخ ${sessionDate} (Local)`);
        }
      }
    }

    // التحقق من أن اليوم موجود (إما مرسل أو مشتق)
    if (!day) {
      return res.status(400).json({
        success: false,
        message: 'اليوم مطلوب (يجب تحديده أو ربط الموعد بمقطع لاشتقاق اليوم منه)'
      });
    }

    // ✅ تحديث timetableData بالقيم المشتقة لاستخدامها في فحص التعارض
    const finalSessionDate = sessionDate || timetableData.sessionDate;
    timetableData.sessionDate = finalSessionDate;
    timetableData.isRecurring = sectionId ? false : (timetableData.isRecurring !== false);

    // 1. فحص التعارب لجميع حلقات المعلم - الفحص الأساسي والأهم
    if (teacherId) {
      // ✅ تمرير finalSessionDate لفحص التعارض بناءً على التاريخ
      const conflictCheck = await checkSessionConflict(teacherId, day, startHour, endHour, null, finalSessionDate);
      
      if (conflictCheck.hasConflict) {
        const conflictSession = conflictCheck.conflictingSession;
        const dateStr = finalSessionDate 
          ? new Date(finalSessionDate).toLocaleDateString('ar-EG')
          : '';
        return res.status(409).json({
          success: false,
          error: "Teacher time conflict",
          message: `❗ تعارض في الموعد: المعلم لديه حلقة أخرى (${conflictSession.note || 'بدون اسم'}) ${dateStr ? `(تاريخ: ${dateStr})` : ''} من ${conflictSession.startHour} إلى ${conflictSession.endHour}. اختر وقتاً مختلفاً.`,
          conflictDetails: conflictSession
        });
      }
    }

    // 2. فحص التعارب مع مواعيد نفس الحلقة (فحص إضافي)
    if (note && note.trim()) {
      const conflictCheck = await checkTimetableConflict(timetableData);
      if (conflictCheck.hasConflict) {
        const cd = conflictCheck.conflictDetails;
        const dateInfo = cd.sessionDate 
          ? ` (${new Date(cd.sessionDate).toLocaleDateString('ar-EG')})`
          : '';
        return res.status(409).json({
          success: false,
          error: "Time conflict",
          message: `❗ تعارض: الحلقة (${note}) لديها موعد آخر ${dateInfo} من ${cd.startHour} إلى ${cd.endHour}. اختر وقتاً مختلفاً.`,
          conflictDetails: cd
        });
      }
    }

    // البحث عن الحلقة للحصول على groupId
    let groupId = null;
    if (note && note.trim()) {
      const group = await Group.findOne({ name: note.trim() });
      if (group) {
        groupId = group._id;
      }
    }

    // إنشاء موعد جديد مع groupId و sessionType و teacherId و description
    const timetable = new TimeTable({ 
      day, 
      startHour, 
      endHour, 
      note: note || "",
      description: description || "", // ✅ إضافة حقل الوصف/الملاحظات
      groupId,
      teacherId, // ✅ معرف المعلم مطلوب
      sessionType: sessionType || undefined, // ✅ إضافة sessionType إذا كان موجود
      
      // ✅ حقول الربط الجديد
      sectionId: sectionId || undefined,
      sessionDate: sessionDate || undefined,
      // ✅ تحديد نوع الموعد: متكرر (أسبوعياً) أو محدد بتاريخ (لمرة واحدة)
      isRecurring: !sectionId, // إذا كان مرتبط بمقطع = محدد بتاريخ، وإلا = متكرر أسبوعياً
    });
    
    await timetable.save();

    // ✅ تحديث المقطع لربطه بالموعد
    if (section) {
      await Section.findByIdAndUpdate(section._id, {
        hasSchedule: true,
        scheduleStatus: "scheduled",
        timetableId: timetable._id
      });
      console.log(`🔗 Linked Section ${section._id} to TimeTable ${timetable._id}`);
    }

    // إضافة الموعد إلى جدول الحلقة إذا كان هناك اسم حلقة
    if (note && note.trim() && groupId) {
      await addTimetableToGroup(note, {
        day,
        startHour,
        endHour,
        timetableId: timetable._id,
      });
    }

    // جلب الموعد مع populate لبيانات المعلم
    const populatedTimetable = await TimeTable.findById(timetable._id)
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName');

    res.status(201).json(populatedTimetable);
  } catch (err) {
    console.error("Error creating timetable:", err);
    res.status(400).json({
      success: false,
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء إضافة الموعد",
    });
  }
};
