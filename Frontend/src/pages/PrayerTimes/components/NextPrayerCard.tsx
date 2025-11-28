/**
 * NextPrayerCard Component
 * بطاقة عرض الصلاة القادمة
 */

import { Card } from "@/components/UI";
import type { NextPrayerCardProps } from "../Types/types";

const NextPrayerCard = ({ nextPrayer }: NextPrayerCardProps) => {
  return (
    <div className="animate-pulse">
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="text-center p-6">
          <div className="text-2xl font-bold mb-2">
            ⏰ الصلاة القادمة: {nextPrayer.name}
          </div>
          <div className="text-lg opacity-90">متبقي: {nextPrayer.timeLeft}</div>
        </div>
      </Card>
    </div>
  );
};

export default NextPrayerCard;
