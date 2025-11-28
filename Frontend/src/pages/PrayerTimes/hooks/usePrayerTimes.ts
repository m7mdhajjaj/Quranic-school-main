/**
 * usePrayerTimes Hook
 * Hook لجلب وإدارة مواقيت الصلاة
 */

import { useState, useEffect } from "react";
import type { PrayerTime } from "../Types/types";

export const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);

      // تنسيق التاريخ
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // جلب مواقيت الصلاة من API
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=Nablus&country=Palestine&method=4`
      );

      const data = await response.json();

      if (data.code === 200) {
        const timings = data.data.timings;
        const date = data.data.date;

        // تحديث التاريخ الميلادي
        setCurrentDate(date.readable);

        // تحديث التاريخ الهجري
        const hijri = date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.year}`);

        // تنظيم المواقيت
        const prayers: PrayerTime[] = [
          { name: "الفجر", time: timings.Fajr, icon: "🌅" },
          { name: "الشروق", time: timings.Sunrise, icon: "🌄" },
          { name: "الظهر", time: timings.Dhuhr, icon: "☀️" },
          { name: "العصر", time: timings.Asr, icon: "🌤️" },
          { name: "المغرب", time: timings.Maghrib, icon: "🌆" },
          { name: "العشاء", time: timings.Isha, icon: "🌙" },
        ];

        setPrayerTimes(prayers);
      }
    } catch (error) {
      console.error("خطأ في جلب مواقيت الصلاة:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    prayerTimes,
    loading,
    currentDate,
    hijriDate,
  };
};
