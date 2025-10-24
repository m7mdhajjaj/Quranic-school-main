/**
 * ✅ دالة إزالة التشكيل وتطبيع النص العربي
 * تستخدم للبحث الذكي بدون حركات
 */
export const normalizeArabic = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "") // إزالة كل الحركات
    .replace(/[إأآٱا]/g, "ا") // توحيد الألف
    .replace(/ى/g, "ي") // ألف مقصورة إلى ياء
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ۀ/g, "ه")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};
