// ============================================================================
// SurahSelectionView - واجهة اختيار السور
// ============================================================================

import { useState } from 'react';
import type { SurahSelectionViewProps } from '../../types/test';
import { Button } from '@/components/UI/';
import { SurahCard, StatisticsCards } from '.';
import PageHeader from '@/components/UI/PageHeader';

export const SurahSelectionView: React.FC<SurahSelectionViewProps> = ({
  surahs,
  selectedSurahs,
  onSurahSelect,
  onStartTest,
  onClearAll,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 18;
  const totalPages = Math.ceil(surahs.length / itemsPerPage);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* العنوان */}
        <PageHeader
          title="اختبار القرآن الكريم"
          subtitle="اختر السور التي تريد أن تختبر حفظك فيها - يمكنك اختيار سورة واحدة أو عدة سور"
          icon={<div className="text-6xl">📖</div>}
        />

        {/* بطاقة السور */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 mb-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl shadow-md">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">اختر السور</h2>
                <p className="text-sm text-gray-500">اختر من القائمة أدناه</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-5 py-3 rounded-2xl border-2 border-emerald-300 shadow-md">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700">
                  {selectedSurahs.length}
                </div>
                <div className="text-xs font-medium text-emerald-600">
                  سورة محددة
                </div>
              </div>
            </div>
          </div>

          {selectedSurahs.length === 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-200">
              <p className="text-gray-700 text-center font-medium">
                👈 اختر سورة واحدة على الأقل للبدء في الاختبار
              </p>
            </div>
          )}

          {/* أزرار التنقل */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <Button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                variant="secondary"
                size="sm"
              >
                ◄ السابق
              </Button>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                {currentPage + 1} / {totalPages}
              </div>

              <Button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage >= totalPages - 1}
                variant="secondary"
                size="sm"
              >
                التالي ►
              </Button>
            </div>
          </div>

          {/* شبكة السور */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {surahs
              .slice(
                currentPage * itemsPerPage,
                (currentPage + 1) * itemsPerPage
              )
              .map((surah) => (
                <SurahCard
                  key={surah.number}
                  surah={surah}
                  isSelected={selectedSurahs.includes(surah.number)}
                  onClick={() => onSurahSelect(surah.number)}
                />
              ))}
          </div>

          <div className="mt-4 text-center">
            <div className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 px-3 sm:px-4 py-2 rounded-full border border-gray-300">
              <span className="text-gray-700 font-medium text-xs sm:text-sm">
                عرض {currentPage * itemsPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * itemsPerPage, surahs.length)} من{' '}
                {surahs.length} سورة
              </span>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={onStartTest}
            disabled={selectedSurahs.length === 0}
            size="lg"
            className="group relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🎯</span>
              <span>بدء الاختبار</span>
              {selectedSurahs.length > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {selectedSurahs.length}
                </span>
              )}
            </div>
          </Button>

          {selectedSurahs.length > 0 && (
            <Button onClick={onClearAll} variant="secondary" size="lg">
              🗑️ مسح الكل
            </Button>
          )}
        </div>

        {/* الإحصائيات */}
        <StatisticsCards selectedSurahs={selectedSurahs} surahs={surahs} />
      </div>
    </div>
  );
};
