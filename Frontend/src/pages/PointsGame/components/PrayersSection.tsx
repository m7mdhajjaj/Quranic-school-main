// components/PrayersSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { PrayersSectionProps, Prayers } from "../types/pointsGame.types";
import { prayerNames } from "../utils/badgeDefinitions";
import { getPrayerPoints } from "../utils/pointsCalculator";
import { Building2, Home, Clock, X } from "lucide-react";

export const PrayersSection = ({
  prayers,
  onUpdatePrayer,
}: PrayersSectionProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">🕌 الصلوات الفروض</h2>
            <span className="text-white/70 text-xs">(اضغط لتحديد الحالة)</span>
          </div>
        </div>
      </div>
      <div className="p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
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
                  <Building2 className="w-8 h-8 mx-auto" />
                  <div className="text-xs mt-1">مسجد (12)</div>
                </Button>
                <Button
                  onClick={() => onUpdatePrayer(prayerKey, "home")}
                  variant={prayer.status === "home" ? "primary" : "ghost"}
                  className={`p-3 rounded-lg text-center transition-all ${
                    prayer.status === "home"
                      ? "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <Home className="w-8 h-8 mx-auto" />
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
                  <Clock className="w-8 h-8 mx-auto" />
                  <div className="text-xs mt-1">متأخر (2)</div>
                </Button>
                <Button
                  onClick={() => onUpdatePrayer(prayerKey, "missed")}
                  variant={prayer.status === "missed" ? "danger" : "ghost"}
                  className={`p-3 rounded-lg text-center transition-all ${
                    prayer.status === "missed"
                      ? "bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <X className="w-8 h-8 mx-auto" />
                  <div className="text-xs mt-1">لم أصلِّ (0)</div>
                </Button>
              </div>
              <div className="text-center">
                <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                  {getPrayerPoints(prayer.status)} نقطة
                </span>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
