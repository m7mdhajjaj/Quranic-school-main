import { normalizeArabic } from "./arabicNormalize";
import type { Surah } from "../types/quran.types";

/**
 * ✅ دالة البحث الذكية بدون تشكيل
 * تبحث في اسم السورة (عربي/إنجليزي) أو رقمها
 */
export const filterSurahs = (surahs: Surah[], term: string): Surah[] => {
  if (!term.trim()) return surahs;

  const normalizedTerm = normalizeArabic(term);
  return surahs.filter((surah) => {
    const normalizedName = normalizeArabic(surah.name);
    const normalizedEnglish = normalizeArabic(surah.englishName || "");
    const normalizedNumber = surah.number.toString();
    return (
      normalizedName.includes(normalizedTerm) ||
      normalizedEnglish.includes(normalizedTerm) ||
      normalizedNumber === normalizedTerm
    );
  });
};
