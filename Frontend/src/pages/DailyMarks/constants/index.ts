/**
 * Constants for Daily Marks module
 * Contains static data and configuration values
 */

import type { FilterOption } from "@/components/Filters";

/**
 * Month names in Arabic
 */
export const MONTH_NAMES = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

/**
 * Month options for filter select
 */
export const MONTH_OPTIONS: FilterOption[] = [
  { value: "1", label: "يناير" },
  { value: "2", label: "فبراير" },
  { value: "3", label: "مارس" },
  { value: "4", label: "أبريل" },
  { value: "5", label: "مايو" },
  { value: "6", label: "يونيو" },
  { value: "7", label: "يوليو" },
  { value: "8", label: "أغسطس" },
  { value: "9", label: "سبتمبر" },
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

/**
 * Generate year options for filter (current year ± range)
 * @param range - Number of years before and after current year (default: 2)
 * @returns Array of FilterOption for years
 */
export const generateYearOptions = (range: number = 2): FilterOption[] => {
  const currentYear = new Date().getFullYear();
  const years: FilterOption[] = [];
  
  for (let year = currentYear - range; year <= currentYear + range; year++) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  
  return years;
};

/**
 * Generate day options for a specific month and year
 * @param month - Month number (1-12)
 * @param year - Year number
 * @returns Array of FilterOption for days
 */
export const generateDayOptions = (month: number, year: number): FilterOption[] => {
  const days: FilterOption[] = [
    { value: "", label: "كل الأيام" }
  ];
  
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ value: day.toString(), label: day.toString() });
  }
  
  return days;
};

/**
 * Mark thresholds for color coding
 */
export const MARK_THRESHOLDS = {
  EXCELLENT: 9,
  VERY_GOOD: 8,
  GOOD: 7,
} as const;

/**
 * Performance level thresholds (percentages)
 */
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD: 70,
} as const;

/**
 * Progress bar colors based on status
 */
export const PROGRESS_COLORS = {
  completed: 'bg-green-500',
  in_progress: 'bg-yellow-500',
  not_started: 'bg-gray-400',
} as const;

/**
 * Height classes for progress bars
 */
export const PROGRESS_HEIGHT = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
} as const;

/**
 * Status badge configuration
 */
export const STATUS_CONFIG = {
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'تم رصد الكل',
    color: 'text-green-600',
  },
  in_progress: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    label: 'قيد التقييم',
    color: 'text-yellow-600',
  },
  not_started: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    label: 'لم يتم رصد',
    color: 'text-gray-600',
  },
} as const;

/**
 * Filter button color mapping
 */
export const FILTER_COLORS = {
  emerald: {
    selected: 'bg-emerald-500 text-white shadow-md border-2 border-emerald-600',
    default: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300',
  },
  teal: {
    selected: 'bg-teal-500 text-white shadow-md border-2 border-teal-600',
    default: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-300',
  },
  cyan: {
    selected: 'bg-cyan-500 text-white shadow-md border-2 border-cyan-600',
    default: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-2 border-cyan-200 hover:border-cyan-300',
  },
  green: {
    selected: 'bg-green-500 text-white shadow-md border-2 border-green-600',
    default: 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200 hover:border-green-300',
  },
} as const;

/**
 * Status filter options configuration
 */
export const STATUS_FILTERS = [
  {
    value: null,
    label: 'الكل',
    icon: 'List',
    color: 'emerald',
  },
  {
    value: 'completed',
    label: 'مكتملة',
    icon: 'CheckCircle',
    color: 'emerald',
  },
  {
    value: 'in_progress',
    label: 'قيد التقييم',
    icon: 'Clock',
    color: 'teal',
  },
  {
    value: 'not_started',
    label: 'لم تبدأ',
    icon: 'AlertCircle',
    color: 'cyan',
  },
] as const;
