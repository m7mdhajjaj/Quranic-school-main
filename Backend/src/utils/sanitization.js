/**
 * 🔒 دوال التنظيف والأمان الموحدة
 * Unified Sanitization & Security Utils
 * 
 * ملف مركزي لجميع دوال التنظيف لتجنب التكرار
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 Regex Escape (منع ReDoS)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escape special regex characters to prevent ReDoS attacks
 * @param {string} str - النص المراد تنظيفه
 * @returns {string} النص بعد التنظيف
 */
function escapeRegex(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * تنظيف query البحث (منع ReDoS + تحديد الطول)
 * @param {string} query - نص البحث
 * @param {number} maxLength - الحد الأقصى للطول
 * @returns {string} النص المنظف
 */
function sanitizeSearchQuery(query, maxLength = 100) {
  if (!query || typeof query !== 'string') return '';
  const trimmed = query.trim().substring(0, maxLength);
  return escapeRegex(trimmed);
}

// ═══════════════════════════════════════════════════════════════════════════
// 📝 تنظيف النصوص
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تنظيف النص العام (للتخزين)
 * @param {string} text - النص
 * @param {number} maxLength - الحد الأقصى
 * @returns {string} النص المنظف
 */
function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .substring(0, maxLength)
    .replace(/<[^>]*>/g, '') // إزالة HTML tags
    .replace(/[<>]/g, ''); // إزالة أي < أو > متبقية
}

/**
 * تنظيف العلامات (tags)
 * @param {Array<string>} tags - مصفوفة العلامات
 * @param {number} maxTags - الحد الأقصى للعلامات
 * @param {number} maxTagLength - الحد الأقصى لطول كل علامة
 * @returns {Array<string>} العلامات المنظفة
 */
function sanitizeTags(tags, maxTags = 10, maxTagLength = 50) {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter(tag => typeof tag === 'string' && tag.trim())
    .map(tag => tag.trim().substring(0, maxTagLength))
    .slice(0, maxTags);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔤 تطبيع النص العربي
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تطبيع النص العربي (إزالة التشكيل وتوحيد الحروف)
 * @param {string} text - النص العربي
 * @returns {string} النص المطبّع
 */
function normalizeArabic(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .toLowerCase()
    .trim();
}

/**
 * إزالة التشكيل فقط (بدون تغيير الحروف)
 * @param {string} text - النص العربي
 * @returns {string} النص بدون تشكيل
 */
function removeDiacritics(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔢 تنظيف المدخلات الرقمية
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تنظيف رقم السورة
 * @param {any} surahNumber - رقم السورة
 * @returns {number|null} الرقم المنظف أو null
 */
function sanitizeSurahNumber(surahNumber) {
  const num = parseInt(surahNumber, 10);
  if (isNaN(num) || num < 1 || num > 114) return null;
  return num;
}

/**
 * تنظيف رقم الآية
 * @param {any} ayahNumber - رقم الآية
 * @param {number} maxAyah - الحد الأقصى (اختياري)
 * @returns {number|null} الرقم المنظف أو null
 */
function sanitizeAyahNumber(ayahNumber, maxAyah = 286) {
  const num = parseInt(ayahNumber, 10);
  if (isNaN(num) || num < 1 || num > maxAyah) return null;
  return num;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ تنظيف HTML (للعرض الآمن)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تنظيف HTML مع السماح ببعض العلامات الآمنة
 * @param {string} html - نص HTML
 * @param {Array<string>} allowedTags - العلامات المسموحة
 * @returns {string} HTML المنظف
 */
function sanitizeHTML(html, allowedTags = ['strong', 'em', 'br', 'p']) {
  if (!html || typeof html !== 'string') return '';
  
  // تحويل كل العلامات إلى entities
  let cleaned = html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // إعادة السماح بالعلامات الآمنة
  for (const tag of allowedTags) {
    const openTag = new RegExp(`&lt;${tag}(&gt;|\\s[^&]*&gt;)`, 'gi');
    const closeTag = new RegExp(`&lt;\\/${tag}&gt;`, 'gi');
    cleaned = cleaned.replace(openTag, `<${tag}>`);
    cleaned = cleaned.replace(closeTag, `</${tag}>`);
  }
  
  // السماح بـ <br> و <br/>
  cleaned = cleaned.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  
  return cleaned;
}

module.exports = {
  // Regex & Search
  escapeRegex,
  sanitizeSearchQuery,
  
  // Text
  sanitizeText,
  sanitizeTags,
  
  // Arabic
  normalizeArabic,
  removeDiacritics,
  
  // Numbers
  sanitizeSurahNumber,
  sanitizeAyahNumber,
  
  // HTML
  sanitizeHTML
};
