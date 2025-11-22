// ============================================================================
// Badge Service - خدمات إدارة الشارات
// ============================================================================

const StudentBadge = require("../../schema/StudentBadge");
const { allBadges } = require("../../utils/helpers/badgeDefinitions");

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
          monthlySchoolAttendance: {
            month: "",
            daysPresent: 0,
            lastAttendanceDate: null,
          },
          lastParticipationDate: null,
          lastUpdate: {
            mosquePrayer: null,
            adhkar: null,
            parentRespect: null,
            sunan: null,
            mosqueTwoPrayers: null,
          },
        },
        earnedBadges: [],
      });
    }

    // تهيئة lastUpdate إذا لم يكن موجود (للسجلات القديمة)
    if (!studentBadge.badgeProgress.lastUpdate) {
      studentBadge.badgeProgress.lastUpdate = {
        mosquePrayer: null,
        adhkar: null,
        parentRespect: null,
        sunan: null,
        mosqueTwoPrayers: null,
      };
    }

    const progress = studentBadge.badgeProgress;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDateStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // ============================================================================
    // 1. سلسلة الإنجاز - المشاركة في اللعبة (15 يوم متتالي)
    // ============================================================================
    const lastParticipation = progress.lastParticipationDate
      ? new Date(progress.lastParticipationDate)
      : null;

    if (lastParticipation) {
      lastParticipation.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - lastParticipation.getTime()) / (1000 * 60 * 60 * 24)
      );

      // إذا كان اليوم هو نفس اليوم، لا نفعل شيء (تحديث ثاني في نفس اليوم)
      if (daysDiff === 0) {
        // لا نزيد العداد
      }
      // إذا كان اليوم التالي مباشرة، نزيد العداد
      else if (daysDiff === 1) {
        progress.overallStreak++;
      }
      // إذا انقطع أكثر من يوم، نبدأ من جديد
      else if (daysDiff > 1) {
        progress.overallStreak = 1;
      }
    } else {
      // أول مشاركة
      progress.overallStreak = 1;
    }

    // تحديث تاريخ آخر مشاركة
    progress.lastParticipationDate = today;

    // ============================================================================
    // 2. الطالب المنضبط - حضور 20 يوم في نفس الشهر
    // ============================================================================
    const currentMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;

    // إذا كان شهر جديد، نبدأ من جديد
    if (progress.monthlySchoolAttendance.month !== currentMonth) {
      progress.monthlySchoolAttendance.month = currentMonth;
      progress.monthlySchoolAttendance.daysPresent = 0;
      progress.monthlySchoolAttendance.lastAttendanceDate = null;
    }

    // إذا حضر اليوم ولم نسجله بعد (لتجنب التكرار في نفس اليوم)
    if (
      dailyPoints.schoolAttendance &&
      progress.monthlySchoolAttendance.lastAttendanceDate !== currentDateStr
    ) {
      progress.monthlySchoolAttendance.daysPresent++;
      progress.monthlySchoolAttendance.lastAttendanceDate = currentDateStr;
    }

    // ============================================================================
    // 3. باقي الشارات - كل شارة لها تاريخ تحديث خاص
    // ============================================================================

    // التحقق من الصلاة في المسجد (3 صلوات على الأقل)
    if (progress.lastUpdate.mosquePrayer !== currentDateStr) {
      const mosquePrayersCount = Object.values(dailyPoints.prayers).filter(
        (p) => p === "mosque"
      ).length;
      if (mosquePrayersCount >= 3) {
        progress.mosquePrayerStreak++;
        progress.lastUpdate.mosquePrayer = currentDateStr;
      } else {
        progress.mosquePrayerStreak = 0;
      }
    }

    // التحقق من صلاتين في المسجد على الأقل
    if (progress.lastUpdate.mosqueTwoPrayers !== currentDateStr) {
      const mosquePrayersCount = Object.values(dailyPoints.prayers).filter(
        (p) => p === "mosque"
      ).length;
      if (mosquePrayersCount >= 2) {
        progress.mosqueTwoPrayersWeek++;
        progress.lastUpdate.mosqueTwoPrayers = currentDateStr;
      } else {
        progress.mosqueTwoPrayersWeek = 0;
      }
    }

    // التحقق من الأذكار (جميعها)
    if (progress.lastUpdate.adhkar !== currentDateStr) {
      const allAdhkar = Object.values(dailyPoints.adhkar).every((a) => a);
      if (allAdhkar) {
        progress.adhkarStreak++;
        progress.lastUpdate.adhkar = currentDateStr;
      } else {
        progress.adhkarStreak = 0;
      }
    }

    // التحقق من بر الوالدين 10/10
    if (progress.lastUpdate.parentRespect !== currentDateStr) {
      if (dailyPoints.parentRespect === 10) {
        progress.parentRespectPerfect++;
        progress.lastUpdate.parentRespect = currentDateStr;
      }
    }

    // التحقق من جميع النوافل
    if (progress.lastUpdate.sunan !== currentDateStr) {
      const allNawafel = Object.values(dailyPoints.nawafel).every((n) => n);
      if (allNawafel) {
        progress.sunanStreak++;
        progress.lastUpdate.sunan = currentDateStr;
      } else {
        progress.sunanStreak = 0;
      }
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

  // شارة "المصلي المجتهد" - 30 يوم متتالي
  if (progress.mosquePrayerStreak >= 30) {
    awardBadge(badges, "mosque_30_days", progress.mosquePrayerStreak, 30);
  }

  // شارة "نجم الأذكار" - 7 أيام متتالية
  if (progress.adhkarStreak >= 7) {
    awardBadge(badges, "adhkar_7_days", progress.adhkarStreak, 7);
  }

  // شارة "بار بوالديه" - 5 مرات 10/10
  if (progress.parentRespectPerfect >= 5) {
    awardBadge(
      badges,
      "parent_respect_5_times",
      progress.parentRespectPerfect,
      5
    );
  }

  // شارة "الطالب المنضبط" - 20 يوم حضور في نفس الشهر
  if (progress.monthlySchoolAttendance.daysPresent >= 20) {
    // نحسب عدد المرات بناءً على كل 20 يوم
    const timesEarned = Math.floor(
      progress.monthlySchoolAttendance.daysPresent / 20
    );
    awardBadgeDirectly(badges, "school_30_days", timesEarned);
  }

  // شارة "سلسلة الإنجاز" - 15 يوم متتالي من المشاركة
  if (progress.overallStreak >= 15) {
    awardBadge(badges, "overall_15_days", progress.overallStreak, 15);
  }

  // شارة "المحافظ على السنن" - 7 أيام متتالية
  if (progress.sunanStreak >= 7) {
    awardBadge(badges, "sunan_keeper", progress.sunanStreak, 7);
  }

  // شارة "المصلي النشيط" - 7 أيام متتالية
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
 * منح شارة مباشرة بعدد محدد
 * تُستخدم للشارات التي لا تعتمد على streak متتالي
 */
function awardBadgeDirectly(badges, badgeId, timesEarned) {
  if (timesEarned <= 0) return;

  const existingBadge = badges.find((b) => b.badgeId === badgeId);

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
