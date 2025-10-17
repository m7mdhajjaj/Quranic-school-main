import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

// تعريف الشارات
interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  count: number; // عدد المرات التي حصل عليها
}

interface BadgeProgress {
  mosquePrayerStreak: number; // سلسلة الصلاة في المسجد
  adhkarStreak: number; // سلسلة الأذكار
  parentRespectPerfect: number; // عدد مرات 10/10 في بر الوالدين
  schoolAttendanceStreak: number; // سلسلة الحضور للمدرسة
  overallStreak: number; // سلسلة الإنجاز الشامل
  sunanStreak: number; // سلسلة المحافظة على السنن
  mosqueTwoPrayersWeek: number; // أسابيع صلاتين في المسجد
}

const PointsGame = () => {
  const { user } = useAuth();

  // State للبيانات القابلة للتعديل
  const [prayers, setPrayers] = useState({
    fajr: { status: "missed" as "mosque" | "home" | "late" | "missed" },
    dhuhr: { status: "missed" as "mosque" | "home" | "late" | "missed" },
    asr: { status: "missed" as "mosque" | "home" | "late" | "missed" },
    maghrib: { status: "missed" as "mosque" | "home" | "late" | "missed" },
    isha: { status: "missed" as "mosque" | "home" | "late" | "missed" },
  });

  const [nawafel, setNawafel] = useState({
    duha: false,
    qiyamAlayl: false,
    rawatib: false,
    witr: false,
  });

  const [parentRespect, setParentRespect] = useState(5);
  const [schoolAttendance, setSchoolAttendance] = useState(false);
  const [dailyStudy, setDailyStudy] = useState(0);

  const [adhkar, setAdhkar] = useState({
    morning: false,
    evening: false,
    sleep: false,
    afterPrayer: false,
  });

  const [halaqah, setHalaqah] = useState({
    memorizedMinutes: 0, // دقائق الحفظ
    reviewedMinutes: 0, // دقائق المراجعة
  });

  const [showRankings, setShowRankings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  // State لتتبع التقدم نحو الشارات
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress>(() => {
    const saved = localStorage.getItem("badgeProgress");
    return saved
      ? JSON.parse(saved)
      : {
          mosquePrayerStreak: 0,
          adhkarStreak: 0,
          parentRespectPerfect: 0,
          schoolAttendanceStreak: 0,
          overallStreak: 0,
          sunanStreak: 0,
          mosqueTwoPrayersWeek: 0,
        };
  });

  // State للشارات المكتسبة
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem("earnedBadges");
    return saved ? JSON.parse(saved) : [];
  });

  // بيانات وهمية للترتيب (للعرض فقط)
  const mockRankings = [
    { rank: 1, name: "محمد أحمد", points: 985, emoji: "🥇" },
    { rank: 2, name: "عبدالله سعيد", points: 920, emoji: "🥈" },
    { rank: 3, name: "يوسف خالد", points: 895, emoji: "🥉" },
    { rank: 4, name: "عمر حسن", points: 850, emoji: "⭐" },
    {
      rank: 5,
      name: user?.firstName + " " + user?.lastName,
      points: 780,
      emoji: "🌟",
    },
    { rank: 6, name: "علي محمود", points: 750, emoji: "💫" },
    { rank: 7, name: "حمزة عمر", points: 720, emoji: "✨" },
    { rank: 8, name: "إبراهيم فهد", points: 680, emoji: "⚡" },
    { rank: 9, name: "خالد سالم", points: 650, emoji: "🔥" },
    { rank: 10, name: "سعد ماجد", points: 620, emoji: "💪" },
  ];

  // تعريف جميع الشارات المتاحة
  const allBadges: Omit<Badge, "count">[] = [
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

  // حفظ البيانات في LocalStorage عند التغيير
  useEffect(() => {
    localStorage.setItem("badgeProgress", JSON.stringify(badgeProgress));
  }, [badgeProgress]);

  useEffect(() => {
    localStorage.setItem("earnedBadges", JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  // دالة للتحقق من الإنجازات ومنح الشارات
  const checkAndAwardBadges = () => {
    const newBadges: Badge[] = [...earnedBadges];
    let updated = false;

    // التحقق من شارة "المصلي المجتهد" - 30 يوم في المسجد
    if (
      badgeProgress.mosquePrayerStreak >= 30 &&
      !newBadges.find((b) => b.id === "mosque_30_days")
    ) {
      const badge = allBadges.find((b) => b.id === "mosque_30_days");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.mosquePrayerStreak >= 30) {
      // زيادة العداد إذا حصل عليها مرة أخرى (كل 30 يوم إضافي)
      const badgeIndex = newBadges.findIndex((b) => b.id === "mosque_30_days");
      if (
        badgeIndex !== -1 &&
        badgeProgress.mosquePrayerStreak % 30 === 0 &&
        badgeProgress.mosquePrayerStreak / 30 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "نجم الأذكار" - 7 أيام
    if (
      badgeProgress.adhkarStreak >= 7 &&
      !newBadges.find((b) => b.id === "adhkar_7_days")
    ) {
      const badge = allBadges.find((b) => b.id === "adhkar_7_days");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.adhkarStreak >= 7) {
      const badgeIndex = newBadges.findIndex((b) => b.id === "adhkar_7_days");
      if (
        badgeIndex !== -1 &&
        badgeProgress.adhkarStreak % 7 === 0 &&
        badgeProgress.adhkarStreak / 7 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "بار بوالديه" - 5 مرات 10/10
    if (
      badgeProgress.parentRespectPerfect >= 5 &&
      !newBadges.find((b) => b.id === "parent_respect_5_times")
    ) {
      const badge = allBadges.find((b) => b.id === "parent_respect_5_times");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.parentRespectPerfect >= 5) {
      const badgeIndex = newBadges.findIndex(
        (b) => b.id === "parent_respect_5_times"
      );
      if (
        badgeIndex !== -1 &&
        badgeProgress.parentRespectPerfect % 5 === 0 &&
        badgeProgress.parentRespectPerfect / 5 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "الطالب المنضبط" - 30 يوم
    if (
      badgeProgress.schoolAttendanceStreak >= 30 &&
      !newBadges.find((b) => b.id === "school_30_days")
    ) {
      const badge = allBadges.find((b) => b.id === "school_30_days");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.schoolAttendanceStreak >= 30) {
      const badgeIndex = newBadges.findIndex((b) => b.id === "school_30_days");
      if (
        badgeIndex !== -1 &&
        badgeProgress.schoolAttendanceStreak % 30 === 0 &&
        badgeProgress.schoolAttendanceStreak / 30 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "سلسلة الإنجاز" - 15 يوم
    if (
      badgeProgress.overallStreak >= 15 &&
      !newBadges.find((b) => b.id === "overall_15_days")
    ) {
      const badge = allBadges.find((b) => b.id === "overall_15_days");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.overallStreak >= 15) {
      const badgeIndex = newBadges.findIndex((b) => b.id === "overall_15_days");
      if (
        badgeIndex !== -1 &&
        badgeProgress.overallStreak % 15 === 0 &&
        badgeProgress.overallStreak / 15 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "المحافظ على السنن" - 7 أيام
    if (
      badgeProgress.sunanStreak >= 7 &&
      !newBadges.find((b) => b.id === "sunan_keeper")
    ) {
      const badge = allBadges.find((b) => b.id === "sunan_keeper");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.sunanStreak >= 7) {
      const badgeIndex = newBadges.findIndex((b) => b.id === "sunan_keeper");
      if (
        badgeIndex !== -1 &&
        badgeProgress.sunanStreak % 7 === 0 &&
        badgeProgress.sunanStreak / 7 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "المصلي النشيط" - أسبوع صلاتين
    if (
      badgeProgress.mosqueTwoPrayersWeek >= 7 &&
      !newBadges.find((b) => b.id === "mosque_two_week")
    ) {
      const badge = allBadges.find((b) => b.id === "mosque_two_week");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    } else if (badgeProgress.mosqueTwoPrayersWeek >= 7) {
      const badgeIndex = newBadges.findIndex((b) => b.id === "mosque_two_week");
      if (
        badgeIndex !== -1 &&
        badgeProgress.mosqueTwoPrayersWeek % 7 === 0 &&
        badgeProgress.mosqueTwoPrayersWeek / 7 > newBadges[badgeIndex].count
      ) {
        newBadges[badgeIndex].count++;
        updated = true;
      }
    }

    // التحقق من شارة "البطل الشامل" - جميع الشارات
    const otherBadgesCount = allBadges.length - 1; // كل الشارات ما عدا البطل الشامل
    const earnedOtherBadges = newBadges.filter(
      (b) => b.id !== "all_badges"
    ).length;

    if (
      earnedOtherBadges >= otherBadgesCount &&
      !newBadges.find((b) => b.id === "all_badges")
    ) {
      const badge = allBadges.find((b) => b.id === "all_badges");
      if (badge) {
        newBadges.push({ ...badge, count: 1 });
        updated = true;
      }
    }

    if (updated) {
      setEarnedBadges(newBadges);
    }
  };

  // دالة لتحديث التقدم اليومي
  const updateDailyProgress = () => {
    const newProgress = { ...badgeProgress };

    // التحقق من الصلاة في المسجد (كل الصلوات)
    const allPrayersInMosque = Object.values(prayers).every(
      (p) => p.status === "mosque"
    );
    if (allPrayersInMosque) {
      newProgress.mosquePrayerStreak++;
    }

    // التحقق من صلاتين في المسجد على الأقل
    const mosquePrayersCount = Object.values(prayers).filter(
      (p) => p.status === "mosque"
    ).length;
    if (mosquePrayersCount >= 2) {
      newProgress.mosqueTwoPrayersWeek++;
    }

    // التحقق من الأذكار (جميعها)
    const allAdhkar = Object.values(adhkar).every((a) => a);
    if (allAdhkar) {
      newProgress.adhkarStreak++;
    }

    // التحقق من بر الوالدين 10/10
    if (parentRespect === 10) {
      newProgress.parentRespectPerfect++;
    }

    // التحقق من الحضور للمدرسة
    if (schoolAttendance) {
      newProgress.schoolAttendanceStreak++;
    }

    // التحقق من جميع النوافل
    const allNawafel = Object.values(nawafel).every((n) => n);
    if (allNawafel) {
      newProgress.sunanStreak++;
    }

    // التحقق من الإنجاز الشامل (كل شيء مكتمل)
    if (
      allPrayersInMosque &&
      allAdhkar &&
      parentRespect >= 8 &&
      schoolAttendance &&
      dailyStudy >= 1
    ) {
      newProgress.overallStreak++;
    }

    setBadgeProgress(newProgress);
    checkAndAwardBadges();
  };

  // دالة لتغيير حالة الصلاة
  const updatePrayerStatus = (
    prayerName: keyof typeof prayers,
    status: "mosque" | "home" | "late" | "missed"
  ) => {
    setPrayers((prev) => ({
      ...prev,
      [prayerName]: { status },
    }));
  };

  // دالة لحساب نقاط الصلاة
  const getPrayerPoints = (status: string) => {
    switch (status) {
      case "mosque":
        return 12;
      case "home":
        return 5;
      case "late":
        return 2;
      case "missed":
        return 0;
      default:
        return 0;
    }
  };

  // حساب النقاط
  const calculateTotalPoints = () => {
    let total = 0;

    // نقاط الصلوات الفروض
    Object.values(prayers).forEach((prayer) => {
      total += getPrayerPoints(prayer.status);
    });

    // نقاط النوافل
    if (nawafel.duha) total += 5;
    if (nawafel.qiyamAlayl) total += 10;
    if (nawafel.rawatib) total += 5;
    if (nawafel.witr) total += 5;

    // نقاط بر الوالدين
    total += parentRespect;

    // نقاط المدرسة
    if (schoolAttendance) total += 5;
    total += dailyStudy * 2;

    // نقاط الأذكار
    if (adhkar.morning) total += 5;
    if (adhkar.evening) total += 5;
    if (adhkar.sleep) total += 3;
    if (adhkar.afterPrayer) total += 5;

    // نقاط الحلقة
    // كل 10 دقائق حفظ = 1 نقطة
    total += Math.floor(halaqah.memorizedMinutes / 10) * 1;
    // كل 10 دقائق مراجعة = 1 نقطة
    total += Math.floor(halaqah.reviewedMinutes / 10) * 1;

    return total;
  };

  const totalPoints = calculateTotalPoints();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="text-6xl mb-2">🎮</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            لعبة النقاط اليومية
          </h1>
          <p className="text-gray-600 text-lg">
            تابع نشاطاتك اليومية واجمع النقاط! 🌟
          </p>
          <div className="mt-4 text-sm text-gray-500">
            الطالب:{" "}
            <span className="font-bold text-blue-600">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </div>

        {/* إجمالي النقاط اليومية */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl shadow-2xl p-8 mb-8 text-white text-center relative">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2">نقاطك اليوم</h2>
          <div className="text-8xl font-black mb-4">{totalPoints}</div>
          <p className="text-xl opacity-90">نقطة</p>

          {/* أزرار لوحة الترتيب والشارات */}
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setShowRankings(true)}
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-110 transition-transform shadow-2xl flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              <span>لوحة الترتيب</span>
            </button>

            <button
              onClick={() => setShowBadges(true)}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-110 transition-transform shadow-2xl flex items-center gap-2 relative">
              <span className="text-2xl">🏆</span>
              <span>شاراتي</span>
              {/* عداد الشارات */}
              {earnedBadges.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
                  {earnedBadges.length}
                </div>
              )}
            </button>
          </div>

          {/* زر حفظ التقدم اليومي */}
          <div className="mt-6">
            <button
              onClick={updateDailyProgress}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-110 transition-transform shadow-2xl flex items-center gap-3 mx-auto">
              <span className="text-2xl">💾</span>
              <span>حفظ النقاط اليومية</span>
              <span className="text-2xl">✨</span>
            </button>
            <p className="text-white/80 text-sm mt-2">
              اضغط بعد الانتهاء من تسجيل نشاطاتك لحفظ التقدم والتحقق من الشارات!
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">250</div>
              <div className="text-sm">هذا الأسبوع</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">980</div>
              <div className="text-sm">هذا الشهر</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm">ترتيبك</div>
            </div>
          </div>
        </div>

        {/* 1. الصلوات الفروض */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">🕌</div>
            <h2 className="text-2xl font-bold text-gray-800">الصلوات الفروض</h2>
            <span className="text-sm text-gray-500">(اضغط لتحديد الحالة)</span>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {Object.entries(prayers).map(([key, prayer]) => {
              const prayerNames: { [key: string]: string } = {
                fajr: "الفجر",
                dhuhr: "الظهر",
                asr: "العصر",
                maghrib: "المغرب",
                isha: "العشاء",
              };

              return (
                <div key={key} className="space-y-2">
                  <h3 className="font-bold text-center text-gray-800">
                    {prayerNames[key]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        updatePrayerStatus(
                          key as keyof typeof prayers,
                          "mosque"
                        )
                      }
                      className={`p-3 rounded-lg text-center transition-all ${
                        prayer.status === "mosque"
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      <div className="text-2xl">🕌</div>
                      <div className="text-xs mt-1">مسجد (12)</div>
                    </button>
                    <button
                      onClick={() =>
                        updatePrayerStatus(key as keyof typeof prayers, "home")
                      }
                      className={`p-3 rounded-lg text-center transition-all ${
                        prayer.status === "home"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      <div className="text-2xl">🏠</div>
                      <div className="text-xs mt-1">منزل (5)</div>
                    </button>
                    <button
                      onClick={() =>
                        updatePrayerStatus(key as keyof typeof prayers, "late")
                      }
                      className={`p-3 rounded-lg text-center transition-all ${
                        prayer.status === "late"
                          ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      <div className="text-2xl">⏰</div>
                      <div className="text-xs mt-1">متأخر (2)</div>
                    </button>
                    <button
                      onClick={() =>
                        updatePrayerStatus(
                          key as keyof typeof prayers,
                          "missed"
                        )
                      }
                      className={`p-3 rounded-lg text-center transition-all ${
                        prayer.status === "missed"
                          ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      <div className="text-2xl">❌</div>
                      <div className="text-xs mt-1">لم أصلِّ (0)</div>
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                      {getPrayerPoints(prayer.status)} نقطة
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. الصلوات النوافل */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">✨</div>
            <h2 className="text-2xl font-bold text-gray-800">
              الصلوات النوافل
            </h2>
            <span className="text-sm text-gray-500">(اضغط لتفعيل/إلغاء)</span>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => setNawafel({ ...nawafel, duha: !nawafel.duha })}
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                nawafel.duha
                  ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">☀️</div>
                <h3 className="font-bold text-lg mb-2">صلاة الضحى</h3>
                <div className="text-sm font-medium">
                  {nawafel.duha ? "✅ 5 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                setNawafel({ ...nawafel, qiyamAlayl: !nawafel.qiyamAlayl })
              }
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                nawafel.qiyamAlayl
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🌙</div>
                <h3 className="font-bold text-lg mb-2">قيام الليل</h3>
                <div className="text-sm font-medium">
                  {nawafel.qiyamAlayl ? "✅ 10 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                setNawafel({ ...nawafel, rawatib: !nawafel.rawatib })
              }
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                nawafel.rawatib
                  ? "bg-gradient-to-br from-green-400 to-teal-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🙏</div>
                <h3 className="font-bold text-lg mb-2">الرواتب</h3>
                <div className="text-sm font-medium">
                  {nawafel.rawatib ? "✅ 5 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>

            <button
              onClick={() => setNawafel({ ...nawafel, witr: !nawafel.witr })}
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                nawafel.witr
                  ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🌟</div>
                <h3 className="font-bold text-lg mb-2">الوتر</h3>
                <div className="text-sm font-medium">
                  {nawafel.witr ? "✅ 5 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* الصف الثاني: بر الوالدين، المدرسة، الدراسة */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* 3. بر الوالدين */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">❤️</div>
              <h2 className="text-xl font-bold text-gray-800">بر الوالدين</h2>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-pink-600 mb-2">
                {parentRespect}
              </div>
              <p className="text-gray-600 mb-4">من 10 نقاط</p>
              <input
                type="range"
                min="0"
                max="10"
                value={parentRespect}
                onChange={(e) => setParentRespect(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${parentRespect * 10}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. الذهاب للمدرسة */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🎒</div>
              <h2 className="text-xl font-bold text-gray-800">
                الذهاب للمدرسة
              </h2>
            </div>
            <div className="text-center">
              <button
                onClick={() => setSchoolAttendance(!schoolAttendance)}
                className="w-full">
                <div
                  className={`text-7xl mb-3 transition-all ${
                    schoolAttendance ? "animate-bounce" : ""
                  }`}>
                  {schoolAttendance ? "✅" : "❌"}
                </div>
                <p className="text-lg font-bold text-gray-700 mb-3">
                  {schoolAttendance ? "حضرت اليوم" : "لم أحضر"}
                </p>
              </button>
              <div>
                <span
                  className={`px-4 py-2 rounded-full text-white font-medium ${
                    schoolAttendance ? "bg-green-500" : "bg-red-500"
                  }`}>
                  {schoolAttendance ? "+5 نقاط" : "0 نقطة"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">اضغط للتبديل</p>
            </div>
          </div>

          {/* 5. الدراسة اليومية */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">📚</div>
              <h2 className="text-xl font-bold text-gray-800">
                الدراسة اليومية
              </h2>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-blue-600 mb-2">
                {dailyStudy}
              </div>
              <p className="text-gray-600 mb-4">ساعات دراسة</p>
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setDailyStudy(Math.max(0, dailyStudy - 0.5))}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600">
                  -
                </button>
                <button
                  onClick={() => setDailyStudy(dailyStudy + 0.5)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">
                  +
                </button>
              </div>
              <div className="text-3xl font-bold text-green-600">
                +{dailyStudy * 2} نقطة
              </div>
              <p className="text-xs text-gray-500 mt-2">كل ساعة = نقطتان</p>
            </div>
          </div>
        </div>

        {/* 6. الأذكار */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">📿</div>
            <h2 className="text-2xl font-bold text-gray-800">
              الأذكار اليومية
            </h2>
            <span className="text-sm text-gray-500">(اضغط لتفعيل/إلغاء)</span>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => setAdhkar({ ...adhkar, morning: !adhkar.morning })}
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                adhkar.morning
                  ? "bg-gradient-to-br from-yellow-300 to-orange-400 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🌅</div>
                <h3 className="font-bold text-lg mb-2">أذكار الصباح</h3>
                <div className="text-sm font-medium">
                  {adhkar.morning ? "✅ 5 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>

            <button
              onClick={() => setAdhkar({ ...adhkar, evening: !adhkar.evening })}
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                adhkar.evening
                  ? "bg-gradient-to-br from-orange-400 to-red-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🌇</div>
                <h3 className="font-bold text-lg mb-2">أذكار المساء</h3>
                <div className="text-sm font-medium">
                  {adhkar.evening ? "✅ 5 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>

            <button
              onClick={() => setAdhkar({ ...adhkar, sleep: !adhkar.sleep })}
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                adhkar.sleep
                  ? "bg-gradient-to-br from-indigo-400 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🌙</div>
                <h3 className="font-bold text-lg mb-2">أذكار النوم</h3>
                <div className="text-sm font-medium">
                  {adhkar.sleep ? "✅ 3 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                setAdhkar({ ...adhkar, afterPrayer: !adhkar.afterPrayer })
              }
              className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                adhkar.afterPrayer
                  ? "bg-gradient-to-br from-green-400 to-teal-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">🤲</div>
                <h3 className="font-bold text-lg mb-2">بعد الصلاة</h3>
                <div className="text-sm font-medium">
                  {adhkar.afterPrayer ? "✅ 5 نقاط" : "⚪ اضغط للتفعيل"}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 7. المتابعة في الحلقة */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">📖</div>
            <h2 className="text-2xl font-bold text-gray-800">
              المتابعة في الحلقة
            </h2>
            <span className="text-sm text-gray-500">
              (الحد الأدنى 10 دقائق)
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* حفظ من الموضع القادم */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border-2 border-green-200">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">📚</div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  حفظ من الموضع القادم
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  كم دقيقة حفظت اليوم؟
                </p>
              </div>

              <div className="space-y-4">
                {/* عرض الدقائق */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-5xl font-black text-green-600 mb-2">
                    {halaqah.memorizedMinutes}
                  </div>
                  <p className="text-gray-600 text-sm">دقيقة</p>
                </div>

                {/* أزرار التحكم */}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() =>
                      setHalaqah({
                        ...halaqah,
                        memorizedMinutes: Math.max(
                          0,
                          halaqah.memorizedMinutes - 10
                        ),
                      })
                    }
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-lg">
                    - 10
                  </button>
                  <button
                    onClick={() =>
                      setHalaqah({
                        ...halaqah,
                        memorizedMinutes: halaqah.memorizedMinutes + 10,
                      })
                    }
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg">
                    + 10
                  </button>
                </div>

                {/* عرض النقاط */}
                <div className="bg-green-100 rounded-lg p-3 text-center border-2 border-green-300">
                  <div className="text-3xl font-bold text-green-700">
                    +{Math.floor(halaqah.memorizedMinutes / 10) * 5} نقطة
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    كل 10 دقائق = 5 نقاط
                  </p>
                </div>
              </div>
            </div>

            {/* مراجعة من الموضع القادم */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">🔄</div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  مراجعة من الموضع القادم
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  كم دقيقة راجعت اليوم؟
                </p>
              </div>

              <div className="space-y-4">
                {/* عرض الدقائق */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-5xl font-black text-blue-600 mb-2">
                    {halaqah.reviewedMinutes}
                  </div>
                  <p className="text-gray-600 text-sm">دقيقة</p>
                </div>

                {/* أزرار التحكم */}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() =>
                      setHalaqah({
                        ...halaqah,
                        reviewedMinutes: Math.max(
                          0,
                          halaqah.reviewedMinutes - 10
                        ),
                      })
                    }
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-lg">
                    - 10
                  </button>
                  <button
                    onClick={() =>
                      setHalaqah({
                        ...halaqah,
                        reviewedMinutes: halaqah.reviewedMinutes + 10,
                      })
                    }
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg">
                    + 10
                  </button>
                </div>

                {/* عرض النقاط */}
                <div className="bg-blue-100 rounded-lg p-3 text-center border-2 border-blue-300">
                  <div className="text-3xl font-bold text-blue-700">
                    +{Math.floor(halaqah.reviewedMinutes / 10) * 3} نقطة
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    كل 10 دقائق = 3 نقاط
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ملخص نقاط الحلقة */}
          <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center border-2 border-purple-300">
            <h4 className="font-bold text-gray-800 mb-2">
              إجمالي نقاط الحلقة اليوم
            </h4>
            <div className="text-4xl font-black text-purple-700">
              {Math.floor(halaqah.memorizedMinutes / 10) * 5 +
                Math.floor(halaqah.reviewedMinutes / 10) * 3}{" "}
              نقطة
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {halaqah.memorizedMinutes} دقيقة حفظ + {halaqah.reviewedMinutes}{" "}
              دقيقة مراجعة
            </p>
          </div>
        </div>

        {/* رسالة تحفيزية */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white text-center">
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-3xl font-bold mb-4">واصل التميز!</h2>
          <p className="text-xl opacity-90 mb-4">
            {totalPoints >= 100
              ? "أنت طالب مثالي! استمر في التميز 🌟"
              : totalPoints >= 70
              ? "أداء رائع! بقليل من الجهد ستصل للكمال 💪"
              : totalPoints >= 50
              ? "أداء جيد! حاول تحسين نقاطك في الأيام القادمة 📈"
              : "ابدأ بخطوات صغيرة، وستصل للقمة بإذن الله! 🚀"}
          </p>
          <div className="text-sm opacity-75">
            "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا" ✨
          </div>
        </div>
      </div>

      {/* Modal لوحة الترتيب */}
      {showRankings && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-6 text-white relative">
              <button
                onClick={() => setShowRankings(false)}
                className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                <span className="text-2xl">✕</span>
              </button>
              <div className="text-center">
                <div className="text-6xl mb-3">🏆</div>
                <h2 className="text-3xl font-bold">لوحة الترتيب</h2>
                <p className="text-sm opacity-90 mt-2">
                  أفضل 10 طلاب هذا الشهر
                </p>
              </div>
            </div>

            {/* Rankings List */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              <div className="space-y-3">
                {mockRankings.map((student, index) => {
                  const isCurrentUser =
                    student.name === `${user?.firstName} ${user?.lastName}`;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl scale-105"
                          : student.rank <= 3
                          ? "bg-gradient-to-r from-yellow-100 to-orange-100 hover:shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 hover:shadow-md"
                      }`}>
                      {/* الترتيب */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                            isCurrentUser
                              ? "bg-white/30 text-white"
                              : student.rank === 1
                              ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900"
                              : student.rank === 2
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
                              : student.rank === 3
                              ? "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900"
                              : "bg-gray-300 text-gray-700"
                          }`}>
                          {student.rank}
                        </div>
                      </div>

                      {/* Emoji */}
                      <div className="text-4xl">{student.emoji}</div>

                      {/* الاسم */}
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg ${
                            isCurrentUser ? "text-white" : "text-gray-800"
                          }`}>
                          {student.name}
                          {isCurrentUser && (
                            <span className="text-sm bg-white/30 px-2 py-1 rounded-full mr-2">
                              أنت
                            </span>
                          )}
                        </h3>
                      </div>

                      {/* النقاط */}
                      <div className="text-left">
                        <div
                          className={`text-3xl font-black ${
                            isCurrentUser ? "text-white" : "text-orange-600"
                          }`}>
                          {student.points}
                        </div>
                        <div
                          className={`text-xs ${
                            isCurrentUser ? "text-white/80" : "text-gray-500"
                          }`}>
                          نقطة
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* رسالة تحفيزية */}
              <div className="mt-6 bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-6 text-center border-2 border-green-300">
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  استمر في التقدم!
                </h3>
                <p className="text-gray-600 text-sm">
                  كل نقطة تقربك من القمة، واصل اجتهادك! 💪
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center border-t">
              <button
                onClick={() => setShowRankings(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الشارات */}
      {showBadges && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">🏆</div>
                  <div>
                    <h2 className="text-3xl font-black">شاراتي</h2>
                    <p className="text-white/90 text-sm">
                      حصلت على {earnedBadges.length} من {allBadges.length} شارة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBadges(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* شريط التقدم */}
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(earnedBadges.length / allBadges.length) * 100}%`,
                  }}></div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {allBadges.map((badge) => {
                  const earnedBadge = earnedBadges.find(
                    (b) => b.id === badge.id
                  );
                  const isEarned = !!earnedBadge;
                  const count = earnedBadge?.count || 0;

                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl p-6 transition-all duration-300 ${
                        isEarned
                          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-lg hover:shadow-xl"
                          : "bg-gray-100 border-2 border-gray-300 opacity-60"
                      }`}>
                      <div className="flex items-start gap-4">
                        {/* أيقونة الشارة */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`text-6xl ${
                              isEarned
                                ? "animate-pulse"
                                : "grayscale opacity-50"
                            }`}>
                            {badge.icon}
                          </div>
                          {/* عداد التكرار */}
                          {isEarned && count > 1 && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
                              {count}
                            </div>
                          )}
                        </div>

                        {/* معلومات الشارة */}
                        <div className="flex-1">
                          <h3
                            className={`font-bold text-lg mb-1 ${
                              isEarned ? "text-gray-800" : "text-gray-500"
                            }`}>
                            {badge.name}
                          </h3>
                          <p
                            className={`text-sm mb-2 ${
                              isEarned ? "text-gray-600" : "text-gray-400"
                            }`}>
                            {badge.description}
                          </p>
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              isEarned
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-500"
                            }`}>
                            {isEarned ? "✅ مكتملة" : `📋 ${badge.requirement}`}
                          </div>

                          {/* عرض عدد المرات */}
                          {isEarned && count > 1 && (
                            <div className="mt-2 text-xs font-bold text-orange-600">
                              🔥 حصلت عليها {count} مرات!
                            </div>
                          )}
                        </div>
                      </div>

                      {/* شريط التقدم للشارات غير المكتملة */}
                      {!isEarned && badge.id !== "all_badges" && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>التقدم</span>
                            <span>
                              {badge.id === "mosque_30_days" &&
                                `${badgeProgress.mosquePrayerStreak}/30`}
                              {badge.id === "adhkar_7_days" &&
                                `${badgeProgress.adhkarStreak}/7`}
                              {badge.id === "parent_respect_5_times" &&
                                `${badgeProgress.parentRespectPerfect}/5`}
                              {badge.id === "school_30_days" &&
                                `${badgeProgress.schoolAttendanceStreak}/30`}
                              {badge.id === "overall_15_days" &&
                                `${badgeProgress.overallStreak}/15`}
                              {badge.id === "sunan_keeper" &&
                                `${badgeProgress.sunanStreak}/7`}
                              {badge.id === "mosque_two_week" &&
                                `${badgeProgress.mosqueTwoPrayersWeek}/7`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  badge.id === "mosque_30_days"
                                    ? (badgeProgress.mosquePrayerStreak / 30) *
                                      100
                                    : badge.id === "adhkar_7_days"
                                    ? (badgeProgress.adhkarStreak / 7) * 100
                                    : badge.id === "parent_respect_5_times"
                                    ? (badgeProgress.parentRespectPerfect / 5) *
                                      100
                                    : badge.id === "school_30_days"
                                    ? (badgeProgress.schoolAttendanceStreak /
                                        30) *
                                      100
                                    : badge.id === "overall_15_days"
                                    ? (badgeProgress.overallStreak / 15) * 100
                                    : badge.id === "sunan_keeper"
                                    ? (badgeProgress.sunanStreak / 7) * 100
                                    : badge.id === "mosque_two_week"
                                    ? (badgeProgress.mosqueTwoPrayersWeek / 7) *
                                      100
                                    : 0
                                }%`,
                              }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* رسالة تحفيزية */}
              {earnedBadges.length < allBadges.length && (
                <div className="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 text-center border-2 border-blue-300">
                  <div className="text-4xl mb-3">💪</div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    استمر في التقدم!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    لديك {allBadges.length - earnedBadges.length} شارة متبقية
                    لتجمعها. واصل اجتهادك! 🌟
                  </p>
                </div>
              )}

              {/* رسالة البطل الشامل */}
              {earnedBadges.length === allBadges.length && (
                <div className="mt-6 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-2xl p-6 text-center border-2 border-yellow-400">
                  <div className="text-6xl mb-3 animate-bounce">👑</div>
                  <h3 className="font-bold text-gray-800 text-2xl mb-2">
                    مبروك! أنت البطل الشامل! 🎉
                  </h3>
                  <p className="text-gray-600">
                    حصلت على جميع الشارات! أنت قدوة للجميع! 🌟
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center border-t">
              <button
                onClick={() => setShowBadges(false)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsGame;
