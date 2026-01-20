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
 * ✅ محسّن بألوان هادئة ومتناسقة
 */
export const SurahCard = memo<SurahCardProps>(({ surah, onClick }) => {
  // تحديد اللون حسب حالة السورة - ألوان هادئة
  const getStatusColor = () => {
    if (surah.status === 'completed') return 'from-emerald-600 via-teal-700 to-slate-700';
    return 'from-slate-500 via-slate-600 to-slate-700'; // قيد الإكمال
  };

  const getStatusIcon = () => {
    if (surah.status === 'completed') 
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    return <Clock className="w-5 h-5 text-slate-600" />; // قيد الإكمال
  };

  const getStatusText = () => {
    if (surah.status === 'completed') return 'مكتمل';
    return 'قيد الإكمال'; // in_progress
  };

  const getStatusBg = () => {
    if (surah.status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-700 border-slate-200'; // قيد الإكمال
  };

  const cardClasses = `group w-full text-right bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`;

  // ✅ FIX: Count unique dates for memorization and review sessions
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
            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-white">{surah.surahName}</h3>
              <p className="text-white/80 text-sm">
                رقم {surah.surahNumber} • {surah.surahAyahCount} آية
              </p>
            </div>
          </div>
          <ChevronLeft className="w-6 h-6 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Segment Types Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {memorizationCount > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
              <BookMarked className="w-4 h-4" />
              <span className="text-xs font-bold">{memorizationCount} حفظ</span>
            </div>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold">{reviewCount} مراجعة</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">نسبة الإتمام</span>
            <span className="font-bold text-slate-800">{surah.progressPercentage}%</span>
          </div>
          <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 right-0 bg-gradient-to-l ${getStatusColor()} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${surah.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xl font-bold text-slate-800">{surah.totalSegments}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">الجلسات</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-xl font-bold text-emerald-700">{surah.completedSegments}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">المنجزة</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
            <p className="text-xl font-bold text-teal-700">
              {surah.averageMark > 0 ? surah.averageMark : '-'}
            </p>
            <p className="text-[11px] text-teal-600 mt-0.5">المعدل</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusBg()} text-sm font-semibold`}>
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </div>
      </div>
    </button>
  );
});

SurahCard.displayName = 'SurahCard';
