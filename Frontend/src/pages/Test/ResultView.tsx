// ============================================================================
// ResultView - واجهة عرض النتيجة
// ============================================================================

import type { ResultViewProps } from "./types/test";
import { Button } from "../../components/shared/Form/Button";
import {
  calculatePercentage,
  getResultTitle,
  getResultIcon,
  getMotivationalMessage,
  getPerformanceGradient,
  getProgressColor,
  getPerformanceLevel,
} from "./utils/testHelpers";

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onResetTest,
  onGoHome,
}) => {
  const percentage = calculatePercentage(result.score, result.totalQuestions);
  const { isPerfect, isGood, isAverage } = getPerformanceLevel(percentage);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 text-center border border-emerald-100">
          {/* أيقونة النجاح */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-4 ${
                "bg-gradient-to-br " + getPerformanceGradient(percentage)
              } ${isPerfect ? "animate-bounce" : ""} shadow-lg`}>
              <span className="text-5xl">{getResultIcon(percentage)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">
              {getResultTitle(percentage)}
            </h1>
            <p className="text-gray-600 text-lg">
              انتهى الاختبار - إليك نتيجتك
            </p>
          </div>

          {/* دائرة التقدم */}
          <div className="mb-8 relative">
            <div className="relative inline-block">
              <svg
                className="w-48 h-48 mx-auto transform -rotate-90"
                viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={getProgressColor(percentage)}
                  strokeWidth="8"
                  strokeDasharray={`${percentage * 2.51} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`text-5xl md:text-6xl font-bold ${
                    isPerfect
                      ? "text-yellow-600"
                      : isGood
                      ? "text-emerald-600"
                      : isAverage
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}>
                  {percentage}%
                </div>
              </div>
            </div>
            <p className="text-xl text-gray-700 mt-4 font-medium">
              {result.score} من {result.totalQuestions} إجابة صحيحة
            </p>
          </div>

          {/* إحصائيات مفصلة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-emerald-600 mb-1">
                {result.correctAnswers}
              </div>
              <div className="text-sm font-medium text-emerald-700">
                ✓ إجابات صحيحة
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-red-600 mb-1">
                {result.wrongAnswers}
              </div>
              <div className="text-sm font-medium text-red-700">
                ✗ إجابات خاطئة
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {result.totalQuestions}
              </div>
              <div className="text-sm font-medium text-blue-700">
                📝 إجمالي الأسئلة
              </div>
            </div>
          </div>

          {/* رسالة تحفيزية */}
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 p-4 rounded-xl mb-6 border border-emerald-200">
            <p className="text-gray-700 font-medium">
              {getMotivationalMessage(percentage)}
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="space-y-3">
            <Button onClick={onResetTest} size="lg" className="w-full">
              🔄 اختبار جديد
            </Button>
            <Button
              onClick={onGoHome}
              variant="secondary"
              size="lg"
              className="w-full">
              🏠 العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
