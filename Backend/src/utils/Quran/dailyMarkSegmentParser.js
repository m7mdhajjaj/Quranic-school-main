// Backend/src/utils/Quran/SegmentParser.js
const { findSurah, normalizeText } = require("./dailyMarkQuranMetadata");

/**
 * Parses and validates a Quran segment (memorization or revision).
 * Accepts:
 *  1. Structured Object: { surah: "Name"|Number, start: 1, end: 5 }
 *  2. String Format (Legacy/Simple): "البقرة 1-5" or "البقرة" (assumes full surah if no range? or error?)
 *
 * Returns:
 *  { isValid: boolean, data: object, error: string }
 */
const parseSegment = (input, type = "segment") => {
  if (!input) {
    return { isValid: false, error: "Input is empty" };
  }

  let rawSurahQuery;
  let rawStart, rawEnd;

  // 1. Detect Input Type
  if (typeof input === "object") {
    // Expected keys: surah (name or number), ayahStart/start, ayahEnd/end
    rawSurahQuery = input.surah || input.surahNumber || input.surahName;
    rawStart = input.ayahStart || input.start || input.from;
    rawEnd = input.ayahEnd || input.end || input.to;
  } else if (typeof input === "string") {
    // Try to parse "Name Start-End" e.g. "البقرة 1-5"
    // Regex: Match name (letters/spaces) + optional digits + optional separator + digits
    // Very basic parser. Ideally frontend sends structured data.
    const match = input.match(/^([^\d]+)(?:\s+(\d+)\s*[-:]\s*(\d+))?$/);
    if (match) {
        rawSurahQuery = match[1].trim();
        rawStart = match[2] ? parseInt(match[2]) : 1;
        rawEnd = match[3] ? parseInt(match[3]) : null; // If null, validation might fail or default to end
    } else {
        // Fallback: assume just name, default range? No, risky.
        rawSurahQuery = input.trim(); 
        // We will default start=1, end=1 (or handle later)
    }
  } else {
    return { isValid: false, error: "Invalid input format" };
  }

  // 2. Resolve Surah
  const surah = findSurah(rawSurahQuery);
  if (!surah) {
    return { 
      isValid: false, 
      error: `لم يتم التعرف على السورة: ${rawSurahQuery}` 
    };
  }

  // 3. Resolve Range
  // Defaults: Start = 1, End = Total Ayahs (if not specified)
  let start = rawStart ? parseInt(rawStart) : 1;
  let end = rawEnd ? parseInt(rawEnd) : surah.ayahCount;

  // 4. Validate Range Logic
  if (isNaN(start) || start < 1) start = 1;
  if (isNaN(end)) end = surah.ayahCount;

  if (start > end) {
     return { isValid: false, error: `بداية المقطع (${start}) أكبر من نهايته (${end})` };
  }
  if (start > surah.ayahCount) {
     return { isValid: false, error: `رقم الآية (${start}) أكبر من عدد آيات سورة ${surah.name} (${surah.ayahCount})` };
  }
  if (end > surah.ayahCount) {
     return { isValid: false, error: `رقم الآية (${end}) أكبر من عدد آيات سورة ${surah.name} (${surah.ayahCount})` };
  }

  // 5. Construct Canonical Object
  const canonicalKey = `${surah.number}:${start}-${end}`;

  const segmentData = {
    surahNumber: surah.number,
    surahNameCanonical: surah.name,
    surahNameInput: rawSurahQuery.toString(),
    
    ayahStart: start,
    ayahEnd: end,
    
    canonicalKey: canonicalKey,
    surahAyahCount: surah.ayahCount,
    
    // Initial status for new segments
    status: input.status || "not_started",
    completedAt: input.completedAt || null,
    completedBy: input.completedBy || null,
    completionNote: input.completionNote || "",
  };

  return { isValid: true, data: segmentData };
};

module.exports = { parseSegment };
