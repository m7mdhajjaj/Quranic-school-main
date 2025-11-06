// components/BadgesModal.tsx
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import type { Badge, BadgeProgress } from "../types/pointsGame.types";
import { allBadges } from "../utils/badgeDefinitions";

interface BadgesModalProps {
  show: boolean;
  earnedBadges: Badge[];
  badgeProgress: BadgeProgress;
  onClose: () => void;
}

export const BadgesModal = ({
  show,
  earnedBadges,
  badgeProgress,
  onClose,
}: BadgesModalProps) => {
  if (!show) return null;

  const getBadgeProgress = (badgeId: string): number => {
    switch (badgeId) {
      case "mosque_30_days":
        return (badgeProgress.mosquePrayerStreak / 30) * 100;
      case "adhkar_7_days":
        return (badgeProgress.adhkarStreak / 7) * 100;
      case "parent_respect_5_times":
        return (badgeProgress.parentRespectPerfect / 5) * 100;
      case "school_30_days":
        return ((badgeProgress.monthlySchoolAttendance?.daysPresent || 0) / 20) * 100;
      case "overall_15_days":
        return (badgeProgress.overallStreak / 15) * 100;
      case "sunan_keeper":
        return (badgeProgress.sunanStreak / 7) * 100;
      case "mosque_two_week":
        return (badgeProgress.mosqueTwoPrayersWeek / 7) * 100;
      default:
        return 0;
    }
  };

  const getBadgeProgressText = (badgeId: string): string => {
    switch (badgeId) {
      case "mosque_30_days":
        return `${badgeProgress.mosquePrayerStreak}/30`;
      case "adhkar_7_days":
        return `${badgeProgress.adhkarStreak}/7`;
      case "parent_respect_5_times":
        return `${badgeProgress.parentRespectPerfect}/5`;
      case "school_30_days":
        return `${badgeProgress.monthlySchoolAttendance?.daysPresent || 0}/20`;
      case "overall_15_days":
        return `${badgeProgress.overallStreak}/15`;
      case "sunan_keeper":
        return `${badgeProgress.sunanStreak}/7`;
      case "mosque_two_week":
        return `${badgeProgress.mosqueTwoPrayersWeek}/7`;
      default:
        return "";
    }
  };

  return (
    <Modal isOpen={show} onClose={onClose} title="شاراتي" size="xl">
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
              onClick={onClose}
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
              const earnedBadge = earnedBadges.find((b) => b.id === badge.id);
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
                          isEarned ? "animate-pulse" : "grayscale opacity-50"
                        }`}>
                        {badge.icon}
                      </div>
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
                        <span>{getBadgeProgressText(badge.id)}</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${getBadgeProgress(badge.id)}%`,
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
          <Button
            onClick={onClose}
            variant="warning"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};
