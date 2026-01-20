/**
 * DateCard Component
 * بطاقة عرض التاريخ الميلادي والهجري
 */

import { Card } from "@/components/UI";
import type { DateCardProps } from "../Types/types";

const DateCard = ({ currentDate, hijriDate }: DateCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white">
      <div className="text-center p-6">
        <div className="text-lg mb-2 opacity-90">التاريخ الميلادي</div>
        <div className="text-3xl font-bold mb-4">{currentDate}</div>
        <div className="text-lg mb-2 opacity-90">التاريخ الهجري</div>
        <div className="text-3xl font-bold">{hijriDate}</div>
      </div>
    </Card>
  );
};

export default DateCard;
