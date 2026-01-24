// ═══════════════════════════════════════════════════════════════════════════
// 🧠 خوارزميات تحليل النصوص والبحث التقريبي (Fuzzy Search)
// ═══════════════════════════════════════════════════════════════════════════

const { normalizeArabic } = require('./sanitization');
const { SURAH_CANONICAL, SURAH_LIST } = require('../data/surahData');

/**
 * حساب مسافة Levenshtein بين كلمتين
 * @returns {number} عدد التعديلات المطلوبة
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * حساب نسبة التشابه بين كلمتين
 * @returns {number} نسبة من 0 إلى 1
 */
function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(str1, str2) / maxLen;
}

/**
 * البحث الذكي عن اسم السورة (Fuzzy Search)
 * @param {string} input - النص المدخل (قد يحتوي على أخطاء إملائية)
 * @returns {{ surahNumber: number, surahName: string, confidence: number } | null}
 */
function fuzzyFindSurah(input) {
  const normalizedInput = normalizeArabic(input);

  // ✅ استخدام القائمة المستوردة من surahData.js
  let bestMatch = null;
  let bestScore = 0;
  const THRESHOLD = 0.6; // الحد الأدنى للتشابه (60%)

  for (const surah of SURAH_CANONICAL) {
    for (const name of surah.names) {
      const normalizedName = normalizeArabic(name);

      // البحث الدقيق أولاً
      if (normalizedInput.includes(normalizedName)) {
        return {
          surahNumber: surah.number,
          surahName: surah.names[0],
          confidence: 1.0,
        };
      }

      // البحث التقريبي (Fuzzy)
      // نقسم النص إلى كلمات ونبحث في كل كلمة
      const words = normalizedInput.split(/\s+/);
      for (const word of words) {
        if (word.length < 2) continue;

        const score = similarity(word, normalizedName);
        if (score > bestScore && score >= THRESHOLD) {
          bestScore = score;
          bestMatch = {
            surahNumber: surah.number,
            surahName: surah.names[0],
            confidence: score,
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * 🔍 البحث عن أقرب السور (للاقتراحات عند الخطأ الإملائي)
 * @param {string} input - النص المدخل (قد يحتوي على أخطاء إملائية)
 * @param {number} limit - عدد الاقتراحات المطلوبة
 * @returns {Array<{ surahNumber: number, surahName: string, confidence: number }>}
 */
function findClosestSurahs(input, limit = 5) {
  const normalizedInput = normalizeArabic(input);
  
  // ✅ استخدام القائمة المستوردة من surahData.js

  // استخراج الكلمات من النص
  const words = normalizedInput.split(/\s+/).filter(w => w.length >= 2);
  
  // حساب التشابه لكل سورة
  const results = [];
  
  for (const surah of SURAH_LIST) {
    const normalizedName = normalizeArabic(surah.name);
    let maxScore = 0;
    
    // مقارنة مع كل كلمة في النص
    for (const word of words) {
      const score = similarity(word, normalizedName);
      if (score > maxScore) {
        maxScore = score;
      }
    }
    
    // مقارنة مع النص كامل
    const fullScore = similarity(normalizedInput, normalizedName);
    if (fullScore > maxScore) {
      maxScore = fullScore;
    }
    
    if (maxScore >= 0.3) { // حد أدنى 30%
      results.push({
        surahNumber: surah.number,
        surahName: surah.name,
        confidence: maxScore
      });
    }
  }
  
  // ترتيب حسب التشابه وإرجاع الأعلى
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

module.exports = {
  fuzzyFindSurah,
  findClosestSurahs,
  similarity,
  levenshteinDistance
};
