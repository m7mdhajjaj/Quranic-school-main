// components/TeacherRankingsView.tsx
import type { TeacherRankingsViewProps } from '../types/pointsGame.types';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

export const TeacherRankingsView = ({
  loading,
  rankingType,
  realRankings,
  realBadgeRankings,
  onChangeType,
}: TeacherRankingsViewProps) => {
  const rankings = rankingType === 'points' ? realRankings : realBadgeRankings;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* أزرار التبديل */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-5xl sm:text-6xl mb-3">
            {rankingType === 'points' ? '🏆' : '🎖️'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {rankingType === 'points' ? 'لوحة الترتيب' : 'ترتيب الشارات'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {rankingType === 'points'
              ? 'أفضل 10 طلاب هذا الشهر'
              : 'أكثر الطلاب حصولاً على الشارات'}
          </p>
        </div>

        {/* أزرار التبديل */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4 sm:mb-6">
          <button
            onClick={() => onChangeType('points')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all ${
              rankingType === 'points'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="ml-2">📊</span>
            ترتيب النقاط
          </button>
          <button
            onClick={() => onChangeType('badges')}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
              rankingType === 'badges'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="ml-2">🏆</span>
            ترتيب الشارات
          </button>
        </div>

        {/* قائمة الترتيب */}
        <div className="max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-emerald-100 hover:scrollbar-thumb-emerald-600">
          {loading ? (
            <LoadingSpinner 
              size="lg" 
              color="emerald" 
              text="جاري تحميل الترتيبات..." 
              showIcon={true}
            />
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 text-lg font-bold">
                لا توجد بيانات حتى الآن
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {rankingType === 'points'
                  ? 'لم يقم الطلاب بحفظ النقاط بعد'
                  : 'لم يحصل الطلاب على شارات بعد'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {rankings.map((student, index) => (
                <div
                  key={student.studentId || index}
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    student.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  {/* الترتيب */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl ${
                        student.rank === 1
                          ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900'
                          : student.rank === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                            : student.rank === 3
                              ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900'
                              : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {student.rank}
                    </div>
                  </div>

                  {/* Emoji */}
                  <div className="text-2xl sm:text-3xl md:text-4xl">👤</div>

                  {/* الاسم */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 truncate">
                      {student.name}
                    </h3>
                    {rankingType === 'badges' && (
                      <div className="text-xs mt-1 text-gray-500">
                        {student.badgesCount || 0} شارات •{' '}
                        {student.totalBadgeRepeats || 0} تكرار إجمالي
                      </div>
                    )}
                  </div>

                  {/* النقاط أو الشارات */}
                  <div className="text-left flex-shrink-0">
                    {rankingType === 'points' ? (
                      <>
                        <div className="text-2xl sm:text-3xl font-black text-orange-600">
                          {student.points}
                        </div>
                        <div className="text-xs text-gray-500">نقطة</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-black text-purple-600">
                          {student.totalBadgeRepeats || 0}
                        </div>
                        <div className="text-xs text-gray-500">تكرار</div>
                        <div className="text-sm font-bold mt-1 text-gray-600">
                          🏆 {student.badgesCount || 0}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
