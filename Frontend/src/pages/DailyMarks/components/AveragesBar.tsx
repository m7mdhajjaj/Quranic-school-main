import type { AveragesBarProps } from "../types/dailyMarks";
import { StatCard } from "../../../components/shared/Features";
import { Award, TrendingUp } from "lucide-react";

/**
 * Enhanced Averages bar component with visual indicators
 * Shows 3 metric cards with progress rings and performance badges
 */
export const AveragesBar = ({
  reviewAverage,
  memorizationAverage,
  overallAverage,
  totalMarks,
}: AveragesBarProps) => {
  // Calculate performance level
  const getPerformanceLevel = (average: number, max: number = 10) => {
    const percentage = (average / max) * 100;
    if (percentage >= 90) return { label: "ممتاز", color: "emerald", emoji: "🌟" };
    if (percentage >= 80) return { label: "جيد جداً", color: "blue", emoji: "⭐" };
    if (percentage >= 70) return { label: "جيد", color: "amber", emoji: "✨" };
    return { label: "يحتاج تحسين", color: "red", emoji: "📚" };
  };

  const overallPerformance = getPerformanceLevel(overallAverage, 100);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-t-2 border-emerald-200">
      {/* Header with performance badge */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
            <Award className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              📊 معدلات الشهر المحدد
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              إجمالي العلامات: {totalMarks}
            </p>
          </div>
        </div>
        
        {/* Overall Performance Badge */}
        <div className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-${overallPerformance.color}-500 to-${overallPerformance.color}-600 rounded-full shadow-lg`}>
          <TrendingUp className="text-white" size={20} />
          <span className="text-white font-bold text-sm">
            {overallPerformance.emoji} الأداء: {overallPerformance.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
        {/* Memorization Average */}
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="📖 معدل الحفظ"
            value={`${memorizationAverage}/10`}
            description={`من ${totalMarks} علامة`}
            color="amber"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
          {/* Progress Ring */}
          <div className="mt-3 flex justify-center">
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  fill="transparent"
                  className="opacity-20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${(memorizationAverage / 10) * 201} 201`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-sm">{Math.round((memorizationAverage / 10) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Average */}
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="🔄 معدل المراجعة"
            value={`${reviewAverage}/10`}
            description={`من ${totalMarks} علامة`}
            color="emerald"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            }
          />
          {/* Progress Ring */}
          <div className="mt-3 flex justify-center">
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10b981"
                  strokeWidth="6"
                  fill="transparent"
                  className="opacity-20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#059669"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${(reviewAverage / 10) * 201} 201`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">{Math.round((reviewAverage / 10) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Average */}
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="⭐ المعدل الإجمالي"
            value={`${overallAverage}/100`}
            description="الحفظ + المراجعة"
            color="blue"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          {/* Progress Ring */}
          <div className="mt-3 flex justify-center">
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  fill="transparent"
                  className="opacity-20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#2563eb"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${(overallAverage / 100) * 201} 201`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{Math.round(overallAverage)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
