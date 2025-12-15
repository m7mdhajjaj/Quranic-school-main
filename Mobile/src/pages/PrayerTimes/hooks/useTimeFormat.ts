/**
 * useTimeFormat Hook
 * Hook لتحويل الوقت من 24 ساعة إلى 12 ساعة
 */

export const useTimeFormat = () => {
  const normalizeTime = (raw: string): string => {
    if (!raw) return "";
    // Aladhan sometimes returns extra suffix like "05:12 (EET)"
    const trimmed = String(raw).trim();
    const firstPart = trimmed.split(" ")[0];
    return firstPart;
  };

  /**
   * تحويل الوقت من 24 ساعة إلى 12 ساعة
   */
  const convertTo12Hour = (time24: string): string => {
    const clean = normalizeTime(time24);
    if (!clean) return "";

    const [hoursRaw, minutesRaw] = clean.split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return clean;

    const period = hours >= 12 ? "م" : "ص";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return { convertTo12Hour, normalizeTime };
};
