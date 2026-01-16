import React, { useState, useEffect } from "react";
import { TIMEZONE } from "@/utils/timezone";

interface AddedAgoProps {
  date: string | Date;
  className?: string;
}

const getTimeAgo = (dateInput: string | Date): string => {
  const now = new Date();
  const date = new Date(dateInput);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return `قبل ثوانٍ`;
  if (diffMin === 1) return `قبل دقيقة`;
  if (diffMin < 60) return `قبل ${diffMin} دقائق`;
  if (diffHour === 1) return `قبل ساعة`;
  if (diffHour < 24) return `قبل ${diffHour} ساعات`;
  if (diffDay === 1) return `أمس`;
  if (diffDay < 7) return `قبل ${diffDay} أيام`;
  if (diffWeek === 1) return "قبل أسبوع";
  if (diffWeek < 4) return `قبل ${diffWeek} أسابيع`;
  if (diffMonth === 1) return "قبل شهر";
  if (diffMonth > 1) return `قبل ${diffMonth} أشهر`;
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE
  });
};

const AddedAgo: React.FC<AddedAgoProps> = ({ date, className }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update the time every 60 seconds for live updates
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`w-full flex justify-end items-center mt-1 ${className || ""}`.trim()} dir="rtl">
      <span
        className="flex flex-row-reverse items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-full px-2 py-1 shadow-sm border border-emerald-100"
      >
        <span className="mx-1 font-extrabold text-emerald-900">{getTimeAgo(date)}</span>
        <svg className="w-4 h-4 text-emerald-500 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/></svg>
      </span>
    </div>
  );
};

export default AddedAgo;
