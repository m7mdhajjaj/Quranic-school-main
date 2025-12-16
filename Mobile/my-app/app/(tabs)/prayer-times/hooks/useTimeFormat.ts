/**
 * useTimeFormat Hook - Mobile
 * Hook لتحويل الوقت من 24 ساعة إلى 12 ساعة
 */

export const useTimeFormat = () => {
  /**
   * تحويل الوقت من 24 ساعة إلى 12 ساعة
   */
  const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "م" : "ص";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return { convertTo12Hour };
};
