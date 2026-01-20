import { memo } from 'react';
import { ChevronLeft, BookOpen, CheckCircle2, Clock, BookMarked } from 'lucide-react';
import type { GroupedSurah } from '@/Api/DailyMark/studentGroupedSectionsApi';

interface SurahCardProps {
  surah: GroupedSurah;
  onClick: () => void;
}

/**
 * Surah Card Component - عرض بطاقة السورة مع معلومات التقدم
 * الحالات: مكتمل (100%) أو قيد الإكمال (أقل من 100%)
 */
export const SurahCard = memo<SurahCardProps>(({ surah, onClick }) => {
  // تحديد اللون حسب حالة السورة
  const getStatusColor = () => {
    if (surah.status === 'completed') return 'from-green-500 to-emerald-600';
    return 'from-blue-500 to-cyan-600'; // قيد الإكمال
  };

  const getStatusIcon = () => {
    if (surah.status === 'completed') 
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    return <Clock className="w-6 h-6 text-blue-600" />; // قيد الإكمال
  };

  const getStatusText = () => {
    if (surah.status === 'completed') return 'مكتمل';
    return 'قيد الإكمال'; // in_progress
  };

  const getStatusBg = () => {
    if (surah.status === 'completed') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-700 border-blue-200'; // قيد الإكمال
  };

  const cardClasses = `group w-full text-right bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`;

  // ✅ FIX: Count unique dates for memorization and review sessions
  // حساب الجلسات الفريدة بناءً على التاريخ وليس عدد المقاطع
  const getUniqueDateCount = (type: 'memorization' | 'review') => {
    const segments = surah.segments?.filter(s => s.type === type) || [];
    const uniqueDates = new Set(
      segments.map(s => s.sectionDate ? new Date(s.sectionDate).toISOString().split('T')[0] : s.sectionId)
    );
    return uniqueDates.size;
  };

  const memorizationCount = getUniqueDateCount('memorization');
  const reviewCount = getUniqueDateCount('review');

  return (
    <button
      onClick={onClick}
      className={cardClasses}
    >
      {/* Header with gradient */}
      <div className={`relative bg-gradient-to-r ${getStatusColor()} p-5`}>
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-white">{surah.surahName}</h3>
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
            <p className="text-xs text-gray-600 mt-1">عدد الجلسات</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
            <p className="text-2xl font-bold text-green-700">{surah.completedSegments}</p>
            <p className="text-xs text-green-600 mt-1">الجلسات المنجزة</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
            <p className="text-2xl font-bold text-blue-700">
              {surah.averageMark > 0 ? surah.averageMark : '-'}
            </p>
            <p className="text-xs text-blue-600 mt-1">معدل الجلسات</p>
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
