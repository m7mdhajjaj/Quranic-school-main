/**
 * PrayerCard Component
 * بطاقة عرض وقت الصلاة
 */

import { Card } from "@/components/UI";
import type { PrayerCardProps } from "../Types/types";
import { useTimeFormat } from "../hooks";

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const { convertTo12Hour } = useTimeFormat();
  const formattedTime = convertTo12Hour(prayer.time);
  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="text-center p-6">
        <div className="text-5xl mb-3">{prayer.icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{prayer.name}</h3>
        <div className="text-3xl font-bold text-emerald-600">{formattedTime}</div>
      </div>
    </Card>
  );
};

export default PrayerCard;
