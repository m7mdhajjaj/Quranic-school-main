// components/PrayersSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { Prayers, PrayerStatus } from "../types/pointsGame.types";
import { prayerNames } from "../utils/badgeDefinitions";
import { getPrayerPoints } from "../utils/pointsCalculator";

interface PrayersSectionProps {
  prayers: Prayers;
  onUpdatePrayer: (prayerName: keyof Prayers, status: PrayerStatus) => void;
}

export const PrayersSection = ({
  prayers,
  onUpdatePrayer,
}: PrayersSectionProps) => {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🕌</div>
        <h2 className="text-2xl font-bold text-gray-800">الصلوات الفروض</h2>
        <span className="text-sm text-gray-500">(اضغط لتحديد الحالة)</span>
      </div>
      <div className="grid md:grid-cols-5 gap-4">
        {Object.entries(prayers).map(([key, prayer]) => {
          const prayerKey = key as keyof Prayers;
          return (
            <div key={key} className="space-y-2">
              <h3 className="font-bold text-center text-gray-800">
                {prayerNames[key]}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onUpdatePrayer(prayerKey, "mosque")}
                  variant={prayer.status === "mosque" ? "success" : "ghost"}
                  className={`p-3 rounded-lg text-center transition-all ${
                    prayer.status === "mosque"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <div className="text-2xl">🕌</div>
                  <div className="text-xs mt-1">مسجد (12)</div>
                </Button>
                <Button
                  onClick={() => onUpdatePrayer(prayerKey, "home")}
                  variant={prayer.status === "home" ? "primary" : "ghost"}
                  className={`p-3 rounded-lg text-center transition-all ${
                    prayer.status === "home"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <div className="text-2xl">🏠</div>
                  <div className="text-xs mt-1">منزل (5)</div>
                </Button>
                <Button
                  onClick={() => onUpdatePrayer(prayerKey, "late")}
                  variant={prayer.status === "late" ? "warning" : "ghost"}
                  className={`p-3 rounded-lg text-center transition-all ${
                    prayer.status === "late"
                      ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <div className="text-2xl">⏰</div>
                  <div className="text-xs mt-1">متأخر (2)</div>
                </Button>
                <Button
                  onClick={() => onUpdatePrayer(prayerKey, "missed")}
                  variant={prayer.status === "missed" ? "danger" : "ghost"}
                  className={`p-3 rounded-lg text-center transition-all ${
                    prayer.status === "missed"
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <div className="text-2xl">❌</div>
                  <div className="text-xs mt-1">لم أصلِّ (0)</div>
                </Button>
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
    </Card>
  );
};
