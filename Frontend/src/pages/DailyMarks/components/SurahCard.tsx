import { memo } from 'react';
import { ChevronLeft, BookOpen, CheckCircle2, Clock, Circle, Sparkles, BookMarked } from 'lucide-react';
import type { GroupedSurah } from '@/Api/DailyMark/studentGroupedSectionsApi';

interface SurahCardProps {
  surah: GroupedSurah;
  onClick: () => void;
  isActiveMemorization?: boolean;
  isActiveReview?: boolean;
}

/**
 * Surah Card Component - عرض بطاقة السورة مع معلومات التقدم
 */
export const SurahCard = memo<SurahCardProps>(({ surah, onClick, isActiveMemorization, isActiveReview }) => {
  const isActive = isActiveMemorization || isActiveReview;

  // تحديد اللون حسب حالة السورة
  const getStatusColor = () => {
    if (isActive) return 'from-amber-500 via-orange-500 to-amber-600';
    if (surah.status === 'completed') return 'from-green-500 to-emerald-600';
    if (surah.status === 'in_progress') return 'from-blue-500 to-cyan-600';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusIcon = () => {
    if (isActive) 
      return <Sparkles className="w-6 h-6 text-amber-600" />;
    if (surah.status === 'completed') 
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    if (surah.status === 'in_progress') 
      return <Clock className="w-6 h-6 text-blue-600" />;
    return <Circle className="w-6 h-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isActiveMemorization && isActiveReview) return 'السورة الفعالة (حفظ + مراجعة)';
    if (isActiveMemorization) return 'السورة الفعالة للحفظ';
    if (isActiveReview) return 'السورة الفعالة للمراجعة';
    if (surah.status === 'completed') return 'مكتمل';
    if (surah.status === 'in_progress') return 'قيد التقدم';
    return 'لم يبدأ';
  };

  const getStatusBg = () => {
    if (isActive) return 'bg-amber-50 text-amber-700 border-amber-300';
    if (surah.status === 'completed') return 'bg-green-50 text-green-700 border-green-200';
    if (surah.status === 'in_progress') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const cardClasses = `group w-full text-right bg-white rounded-2xl border-2 ${
    isActive 
      ? 'border-amber-300 ring-4 ring-amber-200 ring-offset-2 shadow-xl shadow-amber-100' 
      : 'border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-xl'
  } transition-all duration-300 overflow-hidden`;

  // Count memorization and review segments
  const memorizationCount = surah.segments?.filter(s => s.type === 'memorization').length || 0;
  const reviewCount = surah.segments?.filter(s => s.type === 'review').length || 0;

  return (
    <button
      onClick={onClick}
      className={cardClasses}
    >
      {/* Header with gradient */}
      <div className={`relative bg-gradient-to-r ${getStatusColor()} p-5`}>
        <div className="absolute inset-0 bg-black/5" />
        {/* Active Surah Glow Animation */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-transparent to-amber-400/20 animate-pulse" />
        )}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${isActive ? 'bg-amber-100/30' : 'bg-white/20'} backdrop-blur-sm p-2 rounded-xl`}>
              {isActive ? (
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <BookOpen className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{surah.surahName}</h3>
                {isActive && (
                  <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                    فعّال
                  </span>
                )}
              </div>
              <p className="text-white/90 text-sm">
                رقم {surah.surahNumber} • {surah.surahAyahCount} آية
              </p>
            </div>
          </div>
          <ChevronLeft className="w-6 h-6 text-white group-hover:translate-x-[-4px] transition-transform" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Segment Types Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {memorizationCount > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
              <BookMarked className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{memorizationCount} حفظ</span>
            </div>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{reviewCount} مراجعة</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">نسبة الإتمام</span>
            <span className="font-bold text-gray-900">{surah.progressPercentage}%</span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 right-0 bg-gradient-to-l ${getStatusColor()} rounded-full transition-all duration-500`}
              style={{ width: `${surah.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{surah.totalSegments}</p>
            <p className="text-xs text-gray-600 mt-1">مقطع</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
            <p className="text-2xl font-bold text-green-700">{surah.completedSegments}</p>
            <p className="text-xs text-green-600 mt-1">مكتمل</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
            <p className="text-2xl font-bold text-blue-700">
              {surah.averageMark > 0 ? surah.averageMark : '-'}
            </p>
            <p className="text-xs text-blue-600 mt-1">المعدل</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusBg()} text-sm font-medium`}>
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </div>
      </div>
    </button>
  );
});

SurahCard.displayName = 'SurahCard';
