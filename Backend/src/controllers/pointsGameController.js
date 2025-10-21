// controllers/pointsGameController.js
const DailyPoints = require("../schema/DailyPoints");
const StudentBadge = require("../schema/StudentBadge");
const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const MonthlyPoints = require("../schema/MonthlyPoints");
const MonthlyChampion = require("../schema/MonthlyChampion");

// تعريف الشارات المتاحة
const allBadges = [
  {
    id: "mosque_30_days",
    name: "المصلي المجتهد",
    icon: "🕌",
    description: "صلى في المسجد 30 يوم متتالي",
    requirement: "30 يوم متتالي",
  },
  {
    id: "adhkar_7_days",
    name: "نجم الأذكار",
    icon: "⭐",
    description: "قرأ الأذكار 7 أيام متتالية",
    requirement: "7 أيام متتالية",
  },
  {
    id: "parent_respect_5_times",
    name: "بار بوالديه",
    icon: "❤️",
    description: "حصل على 10/10 في بر الوالدين 5 مرات",
    requirement: "5 مرات 10/10",
  },
  {
    id: "school_30_days",
    name: "الطالب المنضبط",
    icon: "🎒",
    description: "لم يغب عن المدرسة شهر كامل",
    requirement: "30 يوم حضور",
  },
  {
    id: "overall_15_days",
    name: "سلسلة الإنجاز",
    icon: "🔥",
    description: "15 يوم متواصل بدون انقطاع",
    requirement: "15 يوم متواصل",
  },
  {
    id: "sunan_keeper",
    name: "المحافظ على السنن",
    icon: "🌙",
    description: "صلى جميع النوافل 7 أيام متتالية",
    requirement: "7 أيام نوافل كاملة",
  },
  {
    id: "mosque_two_week",
    name: "المصلي النشيط",
    icon: "💫",
    description: "صلى صلاتين في المسجد لمدة أسبوع",
    requirement: "أسبوع كامل",
  },
  {
    id: "all_badges",
    name: "البطل الشامل",
    icon: "👑",
    description: "حصل على جميع الشارات",
    requirement: "جميع الشارات",
  },
];

// دوال مساعدة للتعامل مع الشهور
const getMonthName = (monthNumber) => {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[monthNumber - 1];
};

const getCurrentMonth = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear(),
    monthName: getMonthName(now.getMonth() + 1),
  };
};

// دالة لتحديث نقاط الشهر الحالي
const updateMonthlyPoints = async (studentId, dailyPoints, student) => {
  try {
    const { month, year } = getCurrentMonth();

    // البحث عن سجل الشهر الحالي أو إنشاء واحد جديد
    let monthlyPoints = await MonthlyPoints.findOne({
      studentId,
      month,
      year,
    });

    if (!monthlyPoints) {
      monthlyPoints = new MonthlyPoints({
        studentId,
        month,
        year,
        totalPoints: 0,
        activeDays: 0,
        teacher: student.teacher,
        group: student.group,
      });
    }

    // حساب مجموع نقاط الشهر الحالي
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const monthlyAggregate = await DailyPoints.aggregate([
      {
        $match: {
          studentId: studentId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPoints" },
          days: { $sum: 1 },
        },
      },
    ]);

    if (monthlyAggregate.length > 0) {
      monthlyPoints.totalPoints = monthlyAggregate[0].total;
      monthlyPoints.activeDays = monthlyAggregate[0].days;
    }

    await monthlyPoints.save();
    return monthlyPoints;
  } catch (error) {
    console.error("خطأ في تحديث نقاط الشهر:", error);
    throw error;
  }
};

// @desc    حفظ النقاط اليومية
// @route   POST /api/points-game/daily
// @access  Private (Student)
exports.saveDailyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const {
      prayers,
      nawafel,
      parentRespect,
      schoolAttendance,
      dailyStudy,
      adhkar,
      halaqah,
      date,
    } = req.body;

    // الحصول على معلومات الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // تحديد تاريخ اليوم (بدون الوقت)
    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);

    // البحث عن سجل موجود لنفس اليوم
    let dailyPoints = await DailyPoints.findOne({
      studentId,
      date: today,
    });

    if (dailyPoints) {
      // تحديث السجل الموجود
      dailyPoints.prayers = prayers;
      dailyPoints.nawafel = nawafel;
      dailyPoints.parentRespect = parentRespect;
      dailyPoints.schoolAttendance = schoolAttendance;
      dailyPoints.dailyStudy = dailyStudy;
      dailyPoints.adhkar = adhkar;
      dailyPoints.halaqah = halaqah;
    } else {
      // إنشاء سجل جديد
      dailyPoints = new DailyPoints({
        studentId,
        date: today,
        prayers,
        nawafel,
        parentRespect,
        schoolAttendance,
        dailyStudy,
        adhkar,
        halaqah,
        group: student.group,
        teacher: student.teacher,
      });
    }

    await dailyPoints.save();

    // تحديث التقدم نحو الشارات
    await updateBadgeProgress(studentId, dailyPoints, student);

    // تحديث نقاط الشهر الحالي
    await updateMonthlyPoints(studentId, dailyPoints, student);

    res.status(200).json({
      success: true,
      message: "تم حفظ النقاط بنجاح",
      data: dailyPoints,
    });
  } catch (error) {
    console.error("خطأ في حفظ النقاط:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ النقاط",
      error: error.message,
    });
  }
};

// دالة مساعدة لتحديث التقدم نحو الشارات
async function updateBadgeProgress(studentId, dailyPoints, student) {
  try {
    // الحصول على سجل الشارات أو إنشاء واحد جديد
    let studentBadge = await StudentBadge.findOne({ studentId });

    if (!studentBadge) {
      studentBadge = new StudentBadge({
        studentId,
        group: student.group,
        teacher: student.teacher,
        badgeProgress: {
          mosquePrayerStreak: 0,
          adhkarStreak: 0,
          parentRespectPerfect: 0,
          schoolAttendanceStreak: 0,
          overallStreak: 0,
          sunanStreak: 0,
          mosqueTwoPrayersWeek: 0,
        },
        earnedBadges: [],
      });
    }

    const progress = studentBadge.badgeProgress;

    // التحقق من الصلاة في المسجد (كل الصلوات)
    const allPrayersInMosque = Object.values(dailyPoints.prayers).every(
      (p) => p === "mosque"
    );
    if (allPrayersInMosque) {
      progress.mosquePrayerStreak++;
    } else {
      progress.mosquePrayerStreak = 0;
    }

    // التحقق من صلاتين في المسجد على الأقل
    const mosquePrayersCount = Object.values(dailyPoints.prayers).filter(
      (p) => p === "mosque"
    ).length;
    if (mosquePrayersCount >= 2) {
      progress.mosqueTwoPrayersWeek++;
    } else {
      progress.mosqueTwoPrayersWeek = 0;
    }

    // التحقق من الأذكار (جميعها)
    const allAdhkar = Object.values(dailyPoints.adhkar).every((a) => a);
    if (allAdhkar) {
      progress.adhkarStreak++;
    } else {
      progress.adhkarStreak = 0;
    }

    // التحقق من بر الوالدين 10/10
    if (dailyPoints.parentRespect === 10) {
      progress.parentRespectPerfect++;
    }

    // التحقق من الحضور للمدرسة
    if (dailyPoints.schoolAttendance) {
      progress.schoolAttendanceStreak++;
    } else {
      progress.schoolAttendanceStreak = 0;
    }

    // التحقق من جميع النوافل
    const allNawafel = Object.values(dailyPoints.nawafel).every((n) => n);
    if (allNawafel) {
      progress.sunanStreak++;
    } else {
      progress.sunanStreak = 0;
    }

    // التحقق من الإنجاز الشامل
    if (
      allPrayersInMosque &&
      allAdhkar &&
      dailyPoints.parentRespect >= 8 &&
      dailyPoints.schoolAttendance &&
      dailyPoints.dailyStudy >= 1
    ) {
      progress.overallStreak++;
    } else {
      progress.overallStreak = 0;
    }

    // التحقق من الشارات ومنحها
    await checkAndAwardBadges(studentBadge, progress);

    await studentBadge.save();
  } catch (error) {
    console.error("خطأ في تحديث التقدم:", error);
  }
}

// دالة للتحقق من الشارات ومنحها
async function checkAndAwardBadges(studentBadge, progress) {
  const badges = studentBadge.earnedBadges;

  // شارة "المصلي المجتهد" - 30 يوم
  if (progress.mosquePrayerStreak >= 30) {
    const existingBadge = badges.find((b) => b.badgeId === "mosque_30_days");
    const timesEarned = Math.floor(progress.mosquePrayerStreak / 30);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "mosque_30_days");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "نجم الأذكار" - 7 أيام
  if (progress.adhkarStreak >= 7) {
    const existingBadge = badges.find((b) => b.badgeId === "adhkar_7_days");
    const timesEarned = Math.floor(progress.adhkarStreak / 7);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "adhkar_7_days");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "بار بوالديه" - 5 مرات
  if (progress.parentRespectPerfect >= 5) {
    const existingBadge = badges.find(
      (b) => b.badgeId === "parent_respect_5_times"
    );
    const timesEarned = Math.floor(progress.parentRespectPerfect / 5);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "parent_respect_5_times");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "الطالب المنضبط" - 30 يوم
  if (progress.schoolAttendanceStreak >= 30) {
    const existingBadge = badges.find((b) => b.badgeId === "school_30_days");
    const timesEarned = Math.floor(progress.schoolAttendanceStreak / 30);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "school_30_days");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "سلسلة الإنجاز" - 15 يوم
  if (progress.overallStreak >= 15) {
    const existingBadge = badges.find((b) => b.badgeId === "overall_15_days");
    const timesEarned = Math.floor(progress.overallStreak / 15);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "overall_15_days");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "المحافظ على السنن" - 7 أيام
  if (progress.sunanStreak >= 7) {
    const existingBadge = badges.find((b) => b.badgeId === "sunan_keeper");
    const timesEarned = Math.floor(progress.sunanStreak / 7);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "sunan_keeper");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "المصلي النشيط" - 7 أيام
  if (progress.mosqueTwoPrayersWeek >= 7) {
    const existingBadge = badges.find((b) => b.badgeId === "mosque_two_week");
    const timesEarned = Math.floor(progress.mosqueTwoPrayersWeek / 7);

    if (!existingBadge) {
      const badge = allBadges.find((b) => b.id === "mosque_two_week");
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        requirement: badge.requirement,
        count: timesEarned,
      });
    } else if (timesEarned > existingBadge.count) {
      existingBadge.count = timesEarned;
      existingBadge.lastEarnedAt = Date.now();
    }
  }

  // شارة "البطل الشامل" - جميع الشارات
  const otherBadgesCount = allBadges.length - 1;
  const earnedOtherBadges = badges.filter(
    (b) => b.badgeId !== "all_badges"
  ).length;

  if (
    earnedOtherBadges >= otherBadgesCount &&
    !badges.find((b) => b.badgeId === "all_badges")
  ) {
    const badge = allBadges.find((b) => b.id === "all_badges");
    badges.push({
      badgeId: badge.id,
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      requirement: badge.requirement,
      count: 1,
    });
  }
}

// @desc    الحصول على النقاط اليومية للطالب
// @route   GET /api/points-game/daily/:date?
// @access  Private (Student)
exports.getDailyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { date } = req.params;

    // تحديد التاريخ
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const dailyPoints = await DailyPoints.findOne({
      studentId,
      date: targetDate,
    });

    if (!dailyPoints) {
      return res.status(200).json({
        success: true,
        message: "لا توجد نقاط لهذا اليوم",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: dailyPoints,
    });
  } catch (error) {
    console.error("خطأ في جلب النقاط:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب النقاط",
      error: error.message,
    });
  }
};

// @desc    الحصول على شارات الطالب
// @route   GET /api/points-game/badges
// @access  Private (Student)
exports.getStudentBadges = async (req, res) => {
  try {
    const studentId = req.user._id;

    let studentBadge = await StudentBadge.findOne({ studentId });

    if (!studentBadge) {
      // إرجاع بيانات فارغة إذا لم يكن هناك سجل
      return res.status(200).json({
        success: true,
        data: {
          badgeProgress: {
            mosquePrayerStreak: 0,
            adhkarStreak: 0,
            parentRespectPerfect: 0,
            schoolAttendanceStreak: 0,
            overallStreak: 0,
            sunanStreak: 0,
            mosqueTwoPrayersWeek: 0,
          },
          earnedBadges: [],
          totalBadgeRepeats: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: studentBadge,
    });
  } catch (error) {
    console.error("خطأ في جلب الشارات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الشارات",
      error: error.message,
    });
  }
};

// @desc    ترتيب الطلاب والمعلمين حسب النقاط (الشهر الحالي فقط)
// @route   GET /api/points-game/rankings/points
// @access  Private (Student or Teacher)
exports.getPointsRankings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const { month, year } = getCurrentMonth();

    let rankings = [];

    if (userRole === "student") {
      // الطالب - جلب ترتيب حلقته فقط
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      console.log("🔍 [Points Ranking - Student] طلب ترتيب النقاط:", {
        student: `${student.firstName} ${student.lastName}`,
        group: student.group,
        teacher: student.teacher,
        month,
        year,
      });

      rankings = await MonthlyPoints.find({
        month,
        year,
        group: student.group,
        teacher: student.teacher,
      })
        .populate("studentId", "firstName lastName")
        .sort({ totalPoints: -1 })
        .lean();
    } else if (userRole === "teacher") {
      // المعلم - جلب ترتيب جميع طلابه من كل حلقاته
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
      }

      const teacherName = `${teacher.firstName} ${teacher.lastName}`;

      console.log("🔍 [Points Ranking - Teacher] طلب ترتيب النقاط:", {
        teacher: teacherName,
        groups: teacher.groups?.map((g) => g.name) || [],
        month,
        year,
      });

      // جلب النقاط من جميع الحلقات التي يدرّسها المعلم
      rankings = await MonthlyPoints.find({
        month,
        year,
        teacher: teacherName,
      })
        .populate("studentId", "firstName lastName")
        .sort({ totalPoints: -1 })
        .lean();
    } else {
      return res.status(403).json({ message: "غير مصرح" });
    }

    console.log(`📊 [Points Ranking] عدد السجلات: ${rankings.length}`);

    // فحص وتصفية السجلات
    const validRankings = rankings.filter((record) => {
      if (!record.studentId || !record.studentId._id) {
        console.warn(`⚠️ [Points Ranking] سجل بدون studentId صالح:`, {
          month,
          year,
          group: record.group,
          teacher: record.teacher,
        });
        return false;
      }
      return true;
    });

    console.log(
      `✅ [Points Ranking] عدد السجلات الصالحة: ${validRankings.length}`
    );

    // ⚡ تحسين الأداء: جلب جميع الشارات مرة واحدة
    const studentIds = validRankings.map((r) => r.studentId._id);
    const allBadges = await StudentBadge.find({
      studentId: { $in: studentIds },
    }).lean();

    // تحويل إلى Map للوصول السريع
    const badgesMap = new Map(
      allBadges.map((b) => [b.studentId.toString(), b])
    );

    // تنسيق البيانات وإضافة الترتيب
    const formattedRankings = validRankings.map((record, index) => {
      const badges = badgesMap.get(record.studentId._id.toString());

      return {
        rank: index + 1,
        _id: record.studentId._id,
        studentId: record.studentId._id,
        name: `${record.studentId.firstName} ${record.studentId.lastName}`,
        points: record.totalPoints,
        emoji: "👤",
        activeDays: record.activeDays,
        badgesCount: badges?.earnedBadges.length || 0,
        totalBadgeRepeats: badges?.totalBadgeRepeats || 0,
      };
    });

    console.log(`✅ [Points Ranking] إرسال ${formattedRankings.length} سجل`);

    res.status(200).json({
      success: true,
      data: formattedRankings,
      month: getMonthName(month),
      year,
    });
  } catch (error) {
    console.error("خطأ في جلب الترتيب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الترتيب",
      error: error.message,
    });
  }
};

// @desc    ترتيب الطلاب والمعلمين حسب الشارات
// @route   GET /api/points-game/rankings/badges
// @access  Private (Student or Teacher)
exports.getBadgesRankings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let studentsInGroup = [];

    if (userRole === "student") {
      // الطالب - جلب طلاب حلقته فقط
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      console.log("🔍 [Badges Ranking - Student]:", {
        student: `${student.firstName} ${student.lastName}`,
        group: student.group,
        teacher: student.teacher,
      });

      studentsInGroup = await Student.find({
        group: student.group,
        teacher: student.teacher,
      });
    } else if (userRole === "teacher") {
      // المعلم - جلب جميع طلابه من كل حلقاته
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
      }

      const teacherName = `${teacher.firstName} ${teacher.lastName}`;

      console.log("🔍 [Badges Ranking - Teacher]:", {
        teacher: teacherName,
        groups: teacher.groups?.map((g) => g.name) || [],
      });

      // جلب جميع الطلاب الذين معلمهم هو هذا المعلم
      studentsInGroup = await Student.find({
        teacher: teacherName,
      });
    } else {
      return res.status(403).json({ message: "غير مصرح" });
    }

    console.log(`📊 [Badges Ranking] عدد الطلاب: ${studentsInGroup.length}`);

    // ⚡ تحسين الأداء: جلب جميع البيانات مرة واحدة
    const studentIds = studentsInGroup.map((s) => s._id);

    // جلب جميع الشارات مرة واحدة
    const allBadges = await StudentBadge.find({
      studentId: { $in: studentIds },
    }).lean();

    // جلب جميع النقاط مرة واحدة
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const allPoints = await DailyPoints.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$studentId",
          totalPoints: { $sum: "$totalPoints" },
        },
      },
    ]);

    // تحويل النتائج إلى Map للوصول السريع
    const badgesMap = new Map(
      allBadges.map((b) => [b.studentId.toString(), b])
    );
    const pointsMap = new Map(
      allPoints.map((p) => [p._id.toString(), p.totalPoints])
    );

    // بناء الترتيب
    const rankings = studentsInGroup.map((stud) => {
      const studIdStr = stud._id.toString();
      const badges = badgesMap.get(studIdStr);
      const points = pointsMap.get(studIdStr) || 0;

      return {
        _id: stud._id,
        studentId: stud._id,
        name: `${stud.firstName} ${stud.lastName}`,
        emoji: "👤",
        badgesCount: badges?.earnedBadges.length || 0,
        totalBadgeRepeats: badges?.totalBadgeRepeats || 0,
        points: points,
      };
    });

    // ترتيب حسب مجموع التكرارات (من الأعلى للأدنى)
    rankings.sort((a, b) => {
      if (b.totalBadgeRepeats !== a.totalBadgeRepeats) {
        return b.totalBadgeRepeats - a.totalBadgeRepeats;
      }
      // في حالة التساوي، الترتيب حسب عدد الشارات
      return b.badgesCount - a.badgesCount;
    });

    // إضافة الترتيب
    rankings.forEach((r, index) => {
      r.rank = index + 1;
    });

    res.status(200).json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error("خطأ في جلب ترتيب الشارات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب ترتيب الشارات",
      error: error.message,
    });
  }
};

// @desc    الحصول على إحصائيات الطالب
// @route   GET /api/points-game/stats
// @access  Private (Student)
exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // حساب النقاط الأسبوعية
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weeklyPoints = await DailyPoints.aggregate([
      {
        $match: {
          studentId: studentId,
          date: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPoints" },
        },
      },
    ]);

    // حساب النقاط الشهرية
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    const monthlyPoints = await DailyPoints.aggregate([
      {
        $match: {
          studentId: studentId,
          date: { $gte: monthAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPoints" },
        },
      },
    ]);

    // الحصول على ترتيب الطالب
    const student = await Student.findById(studentId);
    const studentsInGroup = await Student.find({
      group: student.group,
      teacher: student.teacher,
    });

    let myRank = 0;
    const rankings = [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    for (const stud of studentsInGroup) {
      const points = await DailyPoints.aggregate([
        {
          $match: {
            studentId: stud._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]);

      rankings.push({
        studentId: stud._id,
        points: points[0]?.totalPoints || 0,
      });
    }

    rankings.sort((a, b) => b.points - a.points);

    rankings.forEach((r, index) => {
      if (r.studentId.toString() === studentId.toString()) {
        myRank = index + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        weeklyPoints: weeklyPoints[0]?.total || 0,
        monthlyPoints: monthlyPoints[0]?.total || 0,
        currentRank: myRank,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الإحصائيات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الإحصائيات",
      error: error.message,
    });
  }
};

// @desc    تتويج أبطال الشهر (يُستدعى في بداية كل شهر جديد)
// @route   POST /api/points-game/crown-champions
// @access  Private (Admin/Cron Job)
exports.crownMonthlyChampions = async (req, res) => {
  try {
    // الشهر الماضي
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const monthName = getMonthName(lastMonth);

    // جلب جميع المجموعات (الحلقات) الفريدة
    const groups = await MonthlyPoints.distinct("group", {
      month: lastMonth,
      year: lastYear,
    });

    const champions = [];

    for (const group of groups) {
      // جلب أفضل طالب في كل مجموعة
      const topStudent = await MonthlyPoints.findOne({
        month: lastMonth,
        year: lastYear,
        group: group,
      })
        .sort({ totalPoints: -1 })
        .limit(1)
        .populate("studentId", "firstName lastName");

      if (topStudent && topStudent.totalPoints > 0) {
        // التحقق من عدم وجود بطل مسجل بالفعل
        const existingChampion = await MonthlyChampion.findOne({
          studentId: topStudent.studentId._id,
          month: lastMonth,
          year: lastYear,
        });

        if (!existingChampion) {
          // حفظ البطل
          const champion = new MonthlyChampion({
            studentId: topStudent.studentId._id,
            studentName: `${topStudent.studentId.firstName} ${topStudent.studentId.lastName}`,
            month: lastMonth,
            year: lastYear,
            monthName: monthName,
            totalPoints: topStudent.totalPoints,
            teacher: topStudent.teacher,
            group: topStudent.group,
            rank: 1,
            badgeData: {
              icon: "👑",
              description: `بطل ${monthName} ${lastYear} - ${topStudent.totalPoints} نقطة`,
              awardedAt: new Date(),
            },
          });

          await champion.save();

          // منح شارة "بطل الشهر" للطالب
          await awardMonthlyChampionBadge(
            topStudent.studentId._id,
            monthName,
            lastYear,
            topStudent.totalPoints
          );

          champions.push(champion);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `تم تتويج ${champions.length} بطل لشهر ${monthName} ${lastYear}`,
      data: champions,
    });
  } catch (error) {
    console.error("خطأ في تتويج الأبطال:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تتويج الأبطال",
      error: error.message,
    });
  }
};

// دالة مساعدة لمنح شارة بطل الشهر
async function awardMonthlyChampionBadge(studentId, monthName, year, points) {
  try {
    let studentBadge = await StudentBadge.findOne({ studentId });

    if (!studentBadge) {
      studentBadge = new StudentBadge({
        studentId,
        teacher: null,
        group: null,
        badgeProgress: {},
        earnedBadges: [],
      });
    }

    // إنشاء شارة فريدة لكل شهر
    const badgeId = `champion_${year}_${monthName.replace(/\s/g, "_")}`;

    // التحقق من عدم وجود الشارة مسبقاً
    const existingBadge = studentBadge.earnedBadges.find(
      (b) => b.badgeId === badgeId
    );

    if (!existingBadge) {
      studentBadge.earnedBadges.push({
        badgeId: badgeId,
        name: `👑 بطل ${monthName}`,
        icon: "👑",
        description: `حصل على المركز الأول في منافسة ${monthName} ${year}`,
        requirement: `${points} نقطة`,
        count: 1,
        firstEarnedAt: new Date(),
        lastEarnedAt: new Date(),
      });

      await studentBadge.save();
    }
  } catch (error) {
    console.error("خطأ في منح شارة البطل:", error);
    throw error;
  }
}

// @desc    جلب أبطال الأشهر السابقة
// @route   GET /api/points-game/champions
// @access  Private (Student)
exports.getMonthlyChampions = async (req, res) => {
  try {
    const studentId = req.user._id;

    // الحصول على معلومات الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // جلب أبطال نفس الحلقة
    const champions = await MonthlyChampion.find({
      group: student.group,
      teacher: student.teacher,
    })
      .sort({ year: -1, month: -1 })
      .limit(12) // آخر 12 شهر
      .lean();

    res.status(200).json({
      success: true,
      data: champions,
    });
  } catch (error) {
    console.error("خطأ في جلب الأبطال:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الأبطال",
      error: error.message,
    });
  }
};

// @desc    [DEBUG] جلب جميع نقاط الشهر الحالي (للتطوير)
// @route   GET /api/points-game/debug/monthly-points
// @access  Private (Student)
exports.getDebugMonthlyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    const { month, year } = getCurrentMonth();

    // جلب جميع السجلات للشهر الحالي
    const allMonthlyPoints = await MonthlyPoints.find({
      month,
      year,
    })
      .populate("studentId", "firstName lastName group teacher")
      .lean();

    // جلب سجلات نفس الحلقة فقط
    const sameGroupPoints = await MonthlyPoints.find({
      month,
      year,
      group: student.group,
      teacher: student.teacher,
    })
      .populate("studentId", "firstName lastName")
      .lean();

    res.status(200).json({
      success: true,
      debug: {
        currentStudent: {
          name: `${student.firstName} ${student.lastName}`,
          group: student.group,
          teacher: student.teacher,
        },
        month: getMonthName(month),
        year,
        allRecordsCount: allMonthlyPoints.length,
        sameGroupCount: sameGroupPoints.length,
        allRecords: allMonthlyPoints,
        sameGroupRecords: sameGroupPoints,
      },
    });
  } catch (error) {
    console.error("خطأ في debug:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ",
      error: error.message,
    });
  }
};

// @desc    [ADMIN] إعادة حساب النقاط الشهرية لجميع الطلاب
// @route   POST /api/points-game/admin/recalculate-monthly
// @access  Private (Admin)
exports.recalculateMonthlyPoints = async (req, res) => {
  try {
    const { month, year } = getCurrentMonth();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // جلب جميع الطلاب الذين لديهم نقاط هذا الشهر
    const studentsWithPoints = await DailyPoints.distinct("studentId", {
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    console.log(`🔄 إعادة حساب النقاط لـ ${studentsWithPoints.length} طالب...`);

    let updated = 0;
    let created = 0;

    for (const studentId of studentsWithPoints) {
      const student = await Student.findById(studentId);
      if (!student) continue;

      // البحث عن سجل الشهر الحالي
      let monthlyPoints = await MonthlyPoints.findOne({
        studentId,
        month,
        year,
      });

      const isNew = !monthlyPoints;

      if (!monthlyPoints) {
        monthlyPoints = new MonthlyPoints({
          studentId,
          month,
          year,
          totalPoints: 0,
          activeDays: 0,
          teacher: student.teacher,
          group: student.group,
        });
      } else {
        // تحديث المعلم والحلقة (في حال تغيرت)
        monthlyPoints.teacher = student.teacher;
        monthlyPoints.group = student.group;
      }

      // حساب النقاط
      const monthlyAggregate = await DailyPoints.aggregate([
        {
          $match: {
            studentId: studentId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPoints" },
            days: { $sum: 1 },
          },
        },
      ]);

      if (monthlyAggregate.length > 0) {
        monthlyPoints.totalPoints = monthlyAggregate[0].total;
        monthlyPoints.activeDays = monthlyAggregate[0].days;
      }

      await monthlyPoints.save();

      if (isNew) {
        created++;
      } else {
        updated++;
      }
    }

    console.log(`✅ تم: ${created} جديد، ${updated} محدث`);

    res.status(200).json({
      success: true,
      message: `تم إعادة حساب النقاط بنجاح`,
      data: {
        month: getMonthName(month),
        year,
        totalStudents: studentsWithPoints.length,
        created,
        updated,
      },
    });
  } catch (error) {
    console.error("خطأ في إعادة الحساب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إعادة الحساب",
      error: error.message,
    });
  }
};

module.exports = exports;
