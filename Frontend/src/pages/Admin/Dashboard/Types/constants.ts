/**
 * خريطة الألوان لتحويل Tailwind classes إلى HEX colors
 * تستخدم في الرسوم البيانية (PieChart, DonutChart)
 */
export const COLOR_MAP: { [key: string]: string } = {
  "green-500": "#22c55e",
  "green-600": "#16a34a",
  "emerald-500": "#10b981",
  "emerald-600": "#059669",
  "teal-500": "#14b8a6",
  "teal-600": "#0d9488",
  "blue-500": "#3b82f6",
  "blue-600": "#2563eb",
  "pink-500": "#ec4899",
  "pink-600": "#db2777",
  "rose-400": "#fb7185",
  "rose-500": "#f43f5e",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  "orange-500": "#f97316",
  "orange-600": "#ea580c",
  "lime-500": "#84cc16",
  "lime-600": "#65a30d",
  "cyan-500": "#06b6d4",
  "cyan-600": "#0891b2",
};

/**
 * ألوان افتراضية للحلقات
 */
export const DEFAULT_GROUP_COLORS = [
  "from-green-500 to-green-600",
  "from-emerald-500 to-emerald-600",
  "from-teal-500 to-teal-600",
  "from-lime-500 to-lime-600",
  "from-cyan-500 to-cyan-600",
  "from-green-600 to-emerald-600",
  "from-emerald-600 to-teal-600",
  "from-teal-600 to-cyan-600",
  "from-lime-600 to-green-600",
  "from-cyan-600 to-blue-500",
];

/**
 * ألوان افتراضية للرسوم البيانية (Donut Chart)
 */
export const DEFAULT_DONUT_COLORS = [
  "from-green-500 to-green-600",
  "from-emerald-500 to-emerald-600",
  "from-teal-500 to-teal-600",
  "from-green-600 to-emerald-600",
  "from-emerald-600 to-teal-600",
  "from-lime-500 to-lime-600",
  "from-cyan-500 to-cyan-600",
  "from-blue-500 to-blue-600",
];

/**
 * ألوان افتراضية للرسوم البيانية (Pie Chart)
 */
export const DEFAULT_PIE_COLORS = [
  "from-green-500 to-green-600",
  "from-emerald-500 to-emerald-600",
  "from-teal-500 to-teal-600",
  "from-green-600 to-emerald-600",
  "from-emerald-600 to-teal-600",
];

/**
 * ألوان افتراضية للرسوم البيانية (Bar Chart)
 */
export const DEFAULT_BAR_COLORS = [
  "bg-gradient-to-t from-green-500 to-green-600",
  "bg-gradient-to-t from-emerald-500 to-emerald-600",
  "bg-gradient-to-t from-teal-500 to-teal-600",
  "bg-gradient-to-t from-lime-500 to-lime-600",
  "bg-gradient-to-t from-green-600 to-emerald-600",
];
