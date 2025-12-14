/**
 * useNextPrayer Hook
 * Hook لحساب الصلاة القادمة والوقت المتبقي
 */

import type { NextPrayer, PrayerTime } from "../Types/types";

export const useNextPrayer = (prayerTimes: PrayerTime[]): NextPrayer | null => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const prayer of prayerTimes.slice(0, -1)) {
    if (prayer.name === "الشروق") continue;

    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerTime = hours * 60 + minutes;

    if (prayerTime > currentTime) {
      const diff = prayerTime - currentTime;
      const hoursLeft = Math.floor(diff / 60);
      const minutesLeft = diff % 60;

      return {
        name: prayer.name,
        timeLeft: `${hoursLeft} ساعة و ${minutesLeft} دقيقة`,
      };
    }
  }

  return null;
};
