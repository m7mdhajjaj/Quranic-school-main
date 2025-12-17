// components/RankingsModal.tsx
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import type { RankingsModalProps } from '../types/pointsGame.types';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

export const RankingsModal = ({
  show,
  loading,
  rankingType,
  realRankings,
  realBadgeRankings,
  currentUserId,
  currentUserName,
  onClose,
  onChangeType,
}: RankingsModalProps) => {
  if (!show) return null;

  const rankings = rankingType === 'points' ? realRankings : realBadgeRankings;

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={rankingType === 'points' ? 'لوحة الترتيب' : 'ترتيب الشارات'}
      size="lg"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white relative">
          <div className="text-center">
            <div className="text-6xl mb-3">
              {rankingType === 'points' ? '🏆' : '🎖️'}
            </div>
            <h2 className="text-3xl font-bold">
              {rankingType === 'points' ? 'لوحة الترتيب' : 'ترتيب الشارات'}
            </h2>
            <p className="text-sm opacity-90 mt-2">
              {rankingType === 'points'
                ? 'أفضل 10 طلاب هذا الشهر'
                : 'أكثر الطلاب حصولاً على الشارات'}
            </p>
          </div>

          {/* أزرار التبديل */}
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              onClick={() => onChangeType('points')}
              variant={rankingType === 'points' ? 'primary' : 'ghost'}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                rankingType === 'points'
                  ? 'bg-white text-emerald-700 shadow-lg scale-105'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span className="ml-2">📊</span>
              ترتيب النقاط
            </Button>
            <Button
              onClick={() => onChangeType('badges')}
              variant={rankingType === 'badges' ? 'primary' : 'ghost'}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                rankingType === 'badges'
                  ? 'bg-white text-emerald-700 shadow-lg scale-105'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span className="ml-2">🏆</span>
              ترتيب الشارات
            </Button>
          </div>
        </div>

        {/* Rankings List */}
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-6">
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
                  ? 'ابدأ بحفظ نقاطك اليومية لتظهر في الترتيب!'
                  : 'احصل على شارات لتظهر في الترتيب!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((student, index) => {
                const isCurrentUser =
                  student.name === currentUserName ||
                  student.studentId === currentUserId;

                return (
                  <div
                    key={student.studentId || index}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl scale-105'
                        : student.rank <= 3
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 hover:shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    {/* الترتيب */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                          isCurrentUser
                            ? 'bg-white/30 text-white'
                            : student.rank === 1
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
                    <div className="text-4xl">👤</div>

                    {/* الاسم */}
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${
                          isCurrentUser ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {student.name}
                        {isCurrentUser && (
                          <span className="text-sm bg-white/30 px-2 py-1 rounded-full mr-2">
                            أنت
                          </span>
                        )}
                      </h3>
                      {rankingType === 'badges' && (
                        <div
                          className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {student.badgesCount || 0} شارات •{' '}
                          {student.totalBadgeRepeats || 0} تكرار إجمالي
                        </div>
                      )}
                    </div>

                    {/* النقاط أو الشارات */}
                    <div className="text-left">
                      {rankingType === 'points' ? (
                        <>
                          <div
                            className={`text-3xl font-black ${
                              isCurrentUser ? 'text-white' : 'text-emerald-700'
                            }`}
                          >
                            {student.points}
                          </div>
                          <div
                            className={`text-xs ${
                              isCurrentUser ? 'text-white/80' : 'text-gray-500'
                            }`}
                          >
                            نقطة
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={`text-3xl font-black ${
                              isCurrentUser ? 'text-white' : 'text-emerald-700'
                            }`}
                          >
                            {student.totalBadgeRepeats || 0}
                          </div>
                          <div
                            className={`text-xs ${
                              isCurrentUser ? 'text-white/80' : 'text-gray-500'
                            }`}
                          >
                            تكرار
                          </div>
                          <div
                            className={`text-sm font-bold mt-1 ${
                              isCurrentUser ? 'text-white/90' : 'text-gray-600'
                            }`}
                          >
                            🏆 {student.badgesCount || 0}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t">
          <Button
            onClick={onClose}
            variant="primary"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};
