// ============================================
// AVAILABILITY CONTROLLER (NEW)
// ============================================
// الأوقات المتاحة وفحص التعارض
// ⚠️ مهم: التعارض يعتمد على التاريخ المحدد وليس اليوم فقط

const TimeTable = require("../../schema/TimeTable");
const { 
  checkTimeConflict, 
  normalizeDate, 
  normalizeNextDay,
  isValidDate 
} = require("./helpers/scheduleConflict.helper");
const { 
  isSummerTime, 
  generateAvailableHours,
  getWeekRange,
  extractDayInfo,
  formatDateArabic
} = require("./helpers/dateTime.helper");

/**
 * جلب الأوقات المتاحة (عامة)
 * @route GET /api/timetable/available-hours
 */
exports.getAvailableHours = async (req, res) => {
  try {
    const summer = isSummerTime();
    const hours = generateAvailableHours();

    res.json({
      success: true,
      data: {
        isSummerTime: summer,
        season: summer ? 'summer' : 'winter',
        seasonAr: summer ? 'صيفي' : 'شتوي',
        range: summer ? '12:00 PM - 9:00 PM' : '11:00 AM - 8:00 PM',
        hours,
        totalSlots: hours.length
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * جلب الأوقات المتاحة لمعلم في تاريخ معين
 * @route GET /api/timetable/available-hours/teacher
 * @query teacherId - معرف المعلم
 * @query date - التاريخ المحدد (مطلوب!) - مثل 2026-01-12
 * @query excludeId - استثناء موعد معين (للتعديل)
 * 
 * ⚠️ ملاحظة: يعتمد على التاريخ المحدد وليس اليوم
 * 12/1 له مواعيد مختلفة عن 19/1 حتى لو نفس اليوم (اثنين)
 */
exports.getTeacherAvailableHours = async (req, res) => {
  try {
    const { teacherId, date, excludeId } = req.query;

    // ⚠️ التاريخ مطلوب!
    if (!teacherId || !date) {
      return res.status(400).json({
        success: false,
        message: "teacherId و date مطلوبان - يجب تحديد التاريخ"
      });
    }

    // ✅ التحقق من صحة التاريخ
    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "التاريخ غير صالح"
      });
    }

    // معلومات التاريخ
    const dateInfo = extractDayInfo(date);

    // ✅ 1. جلب كل الأوقات
    const allHours = generateAvailableHours();

    // ✅ 2. بناء Query للبحث عن المواعيد في نفس التاريخ فقط
    const targetDate = normalizeDate(date);
    const nextDay = normalizeNextDay(date);
    
    console.log("🔍 getTeacherAvailableHours:", {
      date,
      targetDate: targetDate.toISOString(),
      nextDay: nextDay.toISOString(),
      teacherId
    });
    
    let query = { 
      teacherId,
      sessionDate: { $gte: targetDate, $lt: nextDay }
    };

    // استثناء موعد معين (للتعديل)
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // ✅ 3. جلب المواعيد المحجوزة في هذا التاريخ
    const bookedSessions = await TimeTable.find(query)
      .select('startHour endHour note groupId sessionDate')
      .populate('groupId', 'name')
      .lean();

    console.log("📋 bookedSessions found:", bookedSessions.length);
    bookedSessions.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.startHour} - ${s.endHour} | ${s.groupId?.name || s.note} | sessionDate: ${s.sessionDate}`);
    });

    // ✅ 4. تحديد الأوقات المحجوزة
    const bookedHours = new Set();
    
    for (const session of bookedSessions) {
      // إضافة كل الأوقات ضمن نطاق الجلسة
      const startIdx = allHours.indexOf(session.startHour);
      const endIdx = allHours.indexOf(session.endHour);
      
      console.log(`  🔍 Session: ${session.startHour} (idx=${startIdx}) - ${session.endHour} (idx=${endIdx})`);
      
      if (startIdx !== -1 && endIdx !== -1) {
        for (let i = startIdx; i < endIdx; i++) {
          bookedHours.add(allHours[i]);
        }
      } else {
        console.warn(`  ⚠️ Time not found in allHours! startHour="${session.startHour}", endHour="${session.endHour}"`);
        console.warn(`  ⚠️ allHours sample:`, allHours.slice(0, 5));
      }
    }

    // ✅ 5. حساب الأوقات المتاحة
    const availableHours = allHours.filter(h => !bookedHours.has(h));

    res.json({
      success: true,
      data: {
        teacherId,
        date: dateInfo.dateFormatted, // "12 يناير 2026"
        dateShort: dateInfo.dateShort, // "12/1/2026"
        day: dateInfo.dayName, // "الاثنين"
        isSummerTime: isSummerTime(),
        allHours,
        bookedHours: Array.from(bookedHours),
        availableHours,
        bookedSessions: bookedSessions.map(s => ({
          startHour: s.startHour,
          endHour: s.endHour,
          note: s.note,
          groupName: s.groupId?.name || s.note
        })),
        stats: {
          total: allHours.length,
          booked: bookedHours.size,
          available: availableHours.length
        }
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * فحص التعارض قبل الإنشاء/التحديث
 * @route POST /api/timetable/check-conflict
 * @body sessionDate - التاريخ المحدد (مطلوب!)
 * 
 * ⚠️ ملاحظة: التعارض يحدث فقط في نفس التاريخ
 * 12/1 (اثنين) لا يتعارض مع 19/1 (اثنين)
 */
exports.checkConflict = async (req, res) => {
  try {
    const { teacherId, startHour, endHour, sessionDate, excludeId } = req.body;

    // ⚠️ التاريخ مطلوب!
    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: "sessionDate مطلوب - يجب تحديد التاريخ للتحقق من التعارض"
      });
    }

    if (!teacherId || !startHour || !endHour) {
      return res.status(400).json({
        success: false,
        message: "teacherId, startHour, endHour مطلوبة"
      });
    }

    // معلومات التاريخ
    const dateInfo = extractDayInfo(sessionDate);

    const result = await checkTimeConflict({
      teacherId,
      sessionDate, // ⚠️ التعارض على نفس التاريخ فقط
      startHour,
      endHour,
      excludeId
    });

    res.json({
      success: true,
      data: {
        hasConflict: result.hasConflict,
        message: result.message || `لا يوجد تعارض في ${dateInfo.dateFormatted}`,
        conflictWith: result.conflictWith || null,
        dateInfo: {
          date: dateInfo.dateFormatted,
          day: dateInfo.dayName
        }
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};
