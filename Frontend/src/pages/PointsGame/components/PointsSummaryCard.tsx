// components/PointsSummaryCard.tsx
import { Card } from "../../../components/UI/Card";
import { Button } from "../../../components/UI/Button";
import { StatCard } from "../../../components/UI/StatCard";
import type { StudentStats } from "../types/pointsGame.types";

interface PointsSummaryCardProps {
  totalPoints: number;
  stats: StudentStats | null;
  onShowRankings: () => void;
  onShowBadges: () => void;
  onSavePoints: () => void;
  loading: boolean;
  saving: boolean;
  earnedBadgesCount: number;
}

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
    <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl shadow-2xl p-8 mb-8 text-white text-center relative">
      <div className="text-7xl mb-4">🏆</div>
      <h2 className="text-3xl font-bold mb-2">نقاطك اليوم</h2>
      <div className="text-8xl font-black mb-4">{totalPoints}</div>
      <p className="text-xl opacity-90">نقطة</p>

      {/* أزرار لوحة الترتيب والشارات */}
      <div className="mt-6 flex gap-4 justify-center flex-wrap">
        <Button
          onClick={onShowRankings}
          disabled={loading}
          variant="primary"
          className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-110 transition-transform shadow-2xl flex items-center gap-2">
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span>جاري التحميل...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🏅</span>
              <span>لوحة الترتيب</span>
            </>
          )}
        </Button>

        <Button
          onClick={onShowBadges}
          variant="primary"
          className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-110 transition-transform shadow-2xl flex items-center gap-2 relative">
          <span className="text-2xl">🏆</span>
          <span>شاراتي</span>
          {earnedBadgesCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
              {earnedBadgesCount}
            </div>
          )}
        </Button>
      </div>

      {/* زر حفظ التقدم اليومي */}
      <div className="mt-6">
        <Button
          onClick={onSavePoints}
          disabled={saving}
          variant="success"
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-110 transition-transform shadow-2xl flex items-center gap-3 mx-auto">
          <span className="text-2xl">{saving ? "⏳" : "💾"}</span>
          <span>{saving ? "جاري الحفظ..." : "حفظ النقاط اليومية"}</span>
          <span className="text-2xl">✨</span>
        </Button>
        <p className="text-white/80 text-sm mt-2">
          اضغط بعد الانتهاء من تسجيل نشاطاتك لحفظ التقدم والتحقق من الشارات!
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <StatCard
          title="هذا الأسبوع"
          value={stats?.weeklyPoints || 0}
          className="bg-white/20 rounded-xl"
        />
        <StatCard
          title="هذا الشهر"
          value={stats?.monthlyPoints || 0}
          className="bg-white/20 rounded-xl"
        />
        <StatCard
          title="ترتيبك"
          value={stats?.currentRank || "-"}
          className="bg-white/20 rounded-xl"
        />
      </div>
    </Card>
  );
};
