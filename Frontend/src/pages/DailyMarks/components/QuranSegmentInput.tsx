import React, { useState, useEffect, useRef } from "react";
import { quranSurahs } from "@/data/quranSurahs";
import { BookOpen, X } from "lucide-react";
import type { QuranSegmentUI } from "../types/types";

import type { CompletedSurah } from "@/Api/DailyMark/sectionApi";

// Normalization Helper (kept for silent surah matching)
const normalizeText = (text: string) => {
  if (!text) return "";
  let normalized = text.toString().trim();
  normalized = normalized.replace(/[\u064B-\u065F]/g, "");
  normalized = normalized.replace(/[أإآ]/g, "ا");
  normalized = normalized.replace(/ى/g, "ي");
  normalized = normalized.replace(/ة/g, "ه");
  return normalized;
};

/**
 * Try to silently parse surah name + ayah range from free text.
 * Supports patterns like:
 *   "البقرة 5-10"
 *   "البقرة من 5 إلى 10"
 *   "البقرة 5 الى 10"
 *   "البقرة 5 - 10"
 *   "الفاتحة 1 7"
 *   "البقرة"  (name only, no numbers)
 */
const parseInput = (
  text: string,
): {
  surahName: string | null;
  surahNumber: number | undefined;
  ayahStart: number | undefined;
  ayahEnd: number | undefined;
  rawText: string;
} => {
  const trimmed = text.trim();
  if (!trimmed)
    return {
      surahName: null,
      surahNumber: undefined,
      ayahStart: undefined,
      ayahEnd: undefined,
      rawText: "",
    };

  // Extract all numbers from the text
  const numbers = trimmed.match(/\d+/g)?.map(Number) || [];

  // Remove numbers and separators to get the surah name part
  let namePart = trimmed
    .replace(/\d+/g, "") // remove digits
    .replace(/من|إلى|الى|الي|إلي|-|–|—/g, "") // remove separators
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();

  // Try to match surah name
  let matchedSurah: (typeof quranSurahs)[0] | null = null;
  if (namePart) {
    const normalizedName = normalizeText(namePart);
    // Exact match first
    matchedSurah =
      quranSurahs.find((s) => normalizeText(s.name) === normalizedName) || null;
    // Partial match (starts with)
    if (!matchedSurah) {
      matchedSurah =
        quranSurahs.find((s) =>
          normalizeText(s.name).startsWith(normalizedName),
        ) || null;
    }
  }

  return {
    surahName: matchedSurah?.name || namePart || null,
    surahNumber: matchedSurah?.number,
    ayahStart: numbers[0] || undefined,
    ayahEnd: numbers[1] || undefined,
    rawText: trimmed,
  };
};

/**
 * Build display text from segment data (for syncing from parent)
 */
const buildDisplayText = (segment: QuranSegmentUI): string => {
  const parts: string[] = [];

  if (segment.surahNumber) {
    const found = quranSurahs.find((s) => s.number === segment.surahNumber);
    if (found) parts.push(found.name);
  } else if (segment.surahNameCanonical) {
    parts.push(segment.surahNameCanonical);
  }

  if (segment.ayahStart && segment.ayahEnd) {
    parts.push(`${segment.ayahStart}-${segment.ayahEnd}`);
  } else if (segment.ayahStart) {
    parts.push(`${segment.ayahStart}`);
  }

  return parts.join(" ");
};

interface QuranSegmentInputProps {
  label: string;
  onChange: (segments: QuranSegmentUI[]) => void;
  segments?: QuranSegmentUI[];
  colorClass?: string;
  error?: string;
  groupName?: string;
  type?: "memorization" | "review";
  excludeId?: string;
  completedSurahs?: CompletedSurah[];
  date?: string;
  onValidationError?: (error: string | null) => void;
  groupId?: string;
}

const QuranSegmentInput: React.FC<QuranSegmentInputProps> = ({
  label,
  onChange,
  segments = [],
  colorClass = "emerald",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  groupName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  excludeId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  completedSurahs = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  date,
  onValidationError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  groupId,
}) => {
  const segment: QuranSegmentUI =
    segments[0] ||
    ({
      surahNumber: undefined,
      ayahStart: undefined,
      ayahEnd: undefined,
    } as QuranSegmentUI);

  const [inputText, setInputText] = useState("");
  const isInternalUpdate = useRef(false);

  // Always notify parent there are no validation errors
  useEffect(() => {
    if (onValidationError) {
      onValidationError(null);
    }
  }, [onValidationError]);

  // Sync display text from parent segments (e.g. when editing existing section)
  useEffect(() => {
    if (
      !isInternalUpdate.current &&
      (segment.surahNumber || segment.surahNameCanonical)
    ) {
      const display = buildDisplayText(segment);
      if (display) setInputText(display);
    }
    if (isInternalUpdate.current) isInternalUpdate.current = false;
  }, [
    segment.surahNumber,
    segment.ayahStart,
    segment.ayahEnd,
    segment.surahNameCanonical,
  ]);

  const handleChange = (val: string) => {
    setInputText(val);
    isInternalUpdate.current = true;

    if (!val.trim()) {
      onChange([]);
      return;
    }

    const parsed = parseInput(val);

    const newSegment: QuranSegmentUI = {
      surahNumber: parsed.surahNumber,
      surahNameCanonical: parsed.surahName || val.trim(),
      ayahStart: parsed.ayahStart,
      ayahEnd: parsed.ayahEnd,
    };

    onChange([newSegment]);
  };

  const handleClear = () => {
    setInputText("");
    isInternalUpdate.current = true;
    onChange([]);
  };

  // Dynamic colors
  const bgSelected = colorClass === "amber" ? "bg-amber-50" : "bg-emerald-50";
  const textSelected =
    colorClass === "amber" ? "text-amber-700" : "text-emerald-700";
  const activeRing =
    colorClass === "amber" ? "focus:ring-amber-500" : "focus:ring-emerald-500";
  const activeBorder =
    colorClass === "amber"
      ? "focus:border-amber-500"
      : "focus:border-emerald-500";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${bgSelected} transition-colors`}>
            <BookOpen className={`h-4 w-4 ${textSelected}`} />
          </div>
          <h4 className="text-base font-bold text-gray-800">{label}</h4>
        </div>
        {inputText && (
          <button
            type="button"
            onClick={handleClear}
            className="group p-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
            title="مسح البيانات">
            <X className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>

      <div className="p-4 rounded-xl border bg-gray-50/50 border-gray-100">
        <input
          type="text"
          autoComplete="off"
          className={`w-full rounded-xl border text-sm py-2.5 px-3 transition-all duration-200 outline-none
            border-gray-100 bg-white hover:border-gray-200 ${activeBorder} ${activeRing}`}
          placeholder="مثال: البقرة 1-5"
          value={inputText}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>

      {!inputText && (
        <p className="text-xs text-gray-400 mt-1 mr-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
          اترك الحقل فارغ إذا لم يوجد {label.includes("حفظ") ? "حفظ" : "مراجعة"}{" "}
          اليوم.
        </p>
      )}
    </div>
  );
};

export default QuranSegmentInput;
