// ============================================================================
// Badge Service - خدمات إدارة الشارات
// ============================================================================

const StudentBadge = require("../../../schema/StudentBadge");
const { allBadges } = require("../utils/badgeDefinitions");

/**
 * تحديث التقدم نحو الشارات
 */
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
    throw error;
  }
}

/**
 * التحقق من الشارات ومنحها
 */
async function checkAndAwardBadges(studentBadge, progress) {
  const badges = studentBadge.earnedBadges;

  // شارة "المصلي المجتهد" - 30 يوم
  if (progress.mosquePrayerStreak >= 30) {
    awardBadge(badges, "mosque_30_days", progress.mosquePrayerStreak, 30);
  }

  // شارة "نجم الأذكار" - 7 أيام
  if (progress.adhkarStreak >= 7) {
    awardBadge(badges, "adhkar_7_days", progress.adhkarStreak, 7);
  }

  // شارة "بار بوالديه" - 5 مرات
  if (progress.parentRespectPerfect >= 5) {
    awardBadge(
      badges,
      "parent_respect_5_times",
      progress.parentRespectPerfect,
      5
    );
  }

  // شارة "الطالب المنضبط" - 30 يوم
  if (progress.schoolAttendanceStreak >= 30) {
    awardBadge(badges, "school_30_days", progress.schoolAttendanceStreak, 30);
  }

  // شارة "سلسلة الإنجاز" - 15 يوم
  if (progress.overallStreak >= 15) {
    awardBadge(badges, "overall_15_days", progress.overallStreak, 15);
  }

  // شارة "المحافظ على السنن" - 7 أيام
  if (progress.sunanStreak >= 7) {
    awardBadge(badges, "sunan_keeper", progress.sunanStreak, 7);
  }

  // شارة "المصلي النشيط" - 7 أيام
  if (progress.mosqueTwoPrayersWeek >= 7) {
    awardBadge(badges, "mosque_two_week", progress.mosqueTwoPrayersWeek, 7);
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

/**
 * منح شارة للطالب
 */
function awardBadge(badges, badgeId, currentStreak, requirement) {
  const existingBadge = badges.find((b) => b.badgeId === badgeId);
  const timesEarned = Math.floor(currentStreak / requirement);

  if (!existingBadge) {
    const badge = allBadges.find((b) => b.id === badgeId);
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

/**
 * منح شارة بطل الشهر
 */
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

module.exports = {
  updateBadgeProgress,
  checkAndAwardBadges,
  awardMonthlyChampionBadge,
};
