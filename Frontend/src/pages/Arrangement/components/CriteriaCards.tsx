/**
 * Criteria Cards Component
 * Displays the criteria used for ranking
 * Uses shared Card component
 */

import { Card } from "../../../components/shared/UI/Card";

export const CriteriaCards = () => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      data-aos="fade-up"
      data-aos-delay="500">
      {/* Memorization Card */}
      <Card padding="lg" variant="default" hover>
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-center mb-2">الحفظ</h3>
        <p className="text-gray-600 text-center">
          يتم تقييم الطلاب بناءً على معدل الحفظ الشهري المسجل في النظام
        </p>
      </Card>

      {/* Review Card */}
      <Card padding="lg" variant="default" hover>
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-center mb-2">المراجعة</h3>
        <p className="text-gray-600 text-center">
          يتم التقييم بناءً على معدل المراجعة الشهري وأداء الطالب في المراجعات
        </p>
      </Card>

      {/* Overall Average Card */}
      <Card padding="lg" variant="default" hover>
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-center mb-2">المعدل الإجمالي</h3>
        <p className="text-gray-600 text-center">
          المعدل النهائي يحسب من مجموع معدلات الحفظ والمراجعة
        </p>
      </Card>
    </div>
  );
};
