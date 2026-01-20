// components/PointsSummaryCard.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Trophy, Save, Award, TrendingUp } from "lucide-react";
import type { PointsSummaryCardProps } from "../types/pointsGame.types";

export const PointsSummaryCard = ({
  totalPoints,
  stats,
  onShowRankings,
  onShowBadges,
  onSavePoints,
  loading,
  saving,
  earnedBadgesCount,
}: PointsSummaryCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white text-center relative border border-white/10">
      <div className="flex justify-center mb-3 sm:mb-4">
        <Trophy className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">نقاطك اليوم</h2>
      <div className="text-6xl sm:text-7xl md:text-8xl font-black mb-3 sm:mb-4">{totalPoints}</div>
      <p className="text-lg sm:text-xl opacity-90">نقطة</p>

      {/* الإحصائيات */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
          <p className="text-white/80 text-xs sm:text-sm mb-1">هذا الأسبوع</p>
          <p className="text-white text-2xl sm:text-3xl font-bold">{stats?.weeklyPoints || 0}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
          <p className="text-white/80 text-xs sm:text-sm mb-1">هذا الشهر</p>
          <p className="text-white text-2xl sm:text-3xl font-bold">{stats?.monthlyPoints || 0}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
          <p className="text-white/80 text-xs sm:text-sm mb-1">ترتيبك</p>
          <p className="text-white text-2xl sm:text-3xl font-bold">{stats?.currentRank || "-"}</p>
        </div>
      </div>

      {/* زر حفظ التقدم اليومي */}
      <div className="mt-4 sm:mt-6 text-center">
        <Button
          onClick={onSavePoints}
          disabled={saving}
          variant="success"
          className="bg-emerald-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl flex items-center gap-2 sm:gap-3 mx-auto w-full sm:w-auto justify-center pointer-events-auto cursor-pointer">
          <Save className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>{saving ? "جاري الحفظ..." : "حفظ النقاط اليومية"}</span>
        </Button>
        <p className="text-white text-xs sm:text-sm mt-2 px-2">
          اضغط بعد الانتهاء من تسجيل نشاطاتك لحفظ التقدم والتحقق من الشارات!
        </p>
      </div>

      {/* أزرار لوحة الترتيب والشارات */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center text-center">
        <Button
          onClick={onShowRankings}
          disabled={loading}
          variant="primary"
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto">
          {loading ? (
            <span className="text-white flex items-center gap-2">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري التحميل...
            </span>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-white">لوحة الترتيب</span>
            </>
          )}
        </Button>

        <Button
          onClick={onShowBadges}
          variant="primary"
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 relative w-full sm:w-auto">
          <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-white">شاراتي</span>
          {earnedBadgesCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
              {earnedBadgesCount}
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
};
