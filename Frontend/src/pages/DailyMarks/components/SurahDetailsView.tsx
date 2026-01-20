import { memo } from 'react';
import { ArrowRight, Calendar, BookMarked, BookOpen, XCircle } from 'lucide-react';
import type { GroupedSurah, SurahSegment } from '@/Api/DailyMark/studentGroupedSectionsApi';
import { formatDateArabic } from '@/utils/timezone';

interface SurahDetailsViewProps {
  surah: GroupedSurah;
  onBack: () => void;
}

/**
 * Segment Row Component - عرض صف مقطع واحد
 */
const SegmentRow = memo<{ segment: SurahSegment }>(({ segment }) => {
  const hasMark = segment.mark && (segment.mark.memorizationMark !== null || segment.mark.reviewMark !== null);
  const markValue = segment.type === 'memorization' 
    ? segment.mark?.memorizationMark 
    : segment.mark?.reviewMark;

  const getMarkColor = (mark: number | null | undefined) => {
    if (!mark) return 'text-gray-400';
    if (mark >= 90) return 'text-green-600';
    if (mark >= 75) return 'text-blue-600';
    if (mark >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarkBg = (mark: number | null | undefined) => {
    if (!mark) return 'bg-gray-50 border-gray-200';
    if (mark >= 90) return 'bg-green-50 border-green-200';
    if (mark >= 75) return 'bg-blue-50 border-blue-200';
    if (mark >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTypeLabel = () => {
    return segment.type === 'memorization' ? 'حفظ' : 'مراجعة';
  };

  const getTypeIcon = () => {
    return segment.type === 'memorization' 
      ? <BookMarked className="w-4 h-4" />
      : <BookOpen className="w-4 h-4" />;
  };

  const getTypeColor = () => {
    return segment.type === 'memorization' 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all overflow-hidden">
      {/* Header with Type Badge */}
      <div className={`px-4 py-3 flex items-center justify-between ${segment.type === 'memorization' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-bold ${getTypeColor()}`}>
            {getTypeIcon()}
            {getTypeLabel()}
          </span>
          <span className="text-sm font-medium text-gray-700">
            من الآية {segment.ayahStart} إلى {segment.ayahEnd}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{formatDateArabic(segment.sectionDate)}</span>
        </div>

        {/* Mark Display */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">العلامة:</span>
          <div className={`flex items-center justify-center px-4 py-2 rounded-lg border-2 ${getMarkBg(markValue)} min-w-[100px]`}>
            {hasMark ? (
              <div className="text-center">
                <span className={`text-2xl font-bold ${getMarkColor(markValue)}`}>
                  {markValue}
                </span>
                <span className="text-xs text-gray-500 mr-1">/ 100</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">غير مسجلة</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SegmentRow.displayName = 'SegmentRow';

/**
 * Surah Details View Component - عرض تفاصيل مقاطع السورة
 */
export const SurahDetailsView = memo<SurahDetailsViewProps>(({ surah, onBack }) => {
  // Group segments by type
  const memorizationSegments = surah.segments.filter(s => s.type === 'memorization');
  const reviewSegments = surah.segments.filter(s => s.type === 'review');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/40 via-white to-cyan-50/40" dir="rtl">
      <div className="w-full space-y-0">
        {/* Header Card */}
        <div className="bg-white overflow-hidden">
          {/* Header Band */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 md:px-8 lg:px-12 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
            
            <div className="relative">
              {/* Back Button */}
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm">رجوع للسور</span>
              </button>

              {/* Title */}
              <div className="flex items-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{surah.surahName}</h1>
                  <p className="text-white/90 text-sm mt-1">
                    رقم {surah.surahNumber} • {surah.surahAyahCount} آية
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="px-4 md:px-8 lg:px-12 py-6 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
              <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-gray-900">{surah.totalSegments}</p>
                <p className="text-sm text-gray-600 mt-1">عدد الجلسات</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-3xl font-bold text-green-700">{surah.completedSegments}</p>
                <p className="text-sm text-green-600 mt-1">جلسات منجزة</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
               <p className="text-3xl font-bold text-blue-700">{surah.progressPercentage}%</p>
                <p className="text-sm text-blue-600 mt-1">نسبة الإتمام</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-3xl font-bold text-purple-700">
                  {surah.averageMark > 0 ? surah.averageMark : '-'}
                </p>
                <p className="text-sm text-purple-600 mt-1">معدل الجلسات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Memorization Segments */}
        {memorizationSegments.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50/30 to-green-50/20 border-t-4 border-emerald-500 px-4 md:px-8 lg:px-12 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 p-3 rounded-xl shadow-md">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">مقاطع الحفظ</h2>
                <p className="text-sm text-gray-600">إجمالي {memorizationSegments.length} مقطع</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memorizationSegments.map(segment => (
                <SegmentRow key={segment.segmentId} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {/* Review Segments */}
        {reviewSegments.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50/30 to-cyan-50/20 border-t-4 border-blue-500 px-4 md:px-8 lg:px-12 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 p-3 rounded-xl shadow-md">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">مقاطع المراجعة</h2>
                <p className="text-sm text-gray-600">إجمالي {reviewSegments.length} مقطع</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewSegments.map(segment => (
                <SegmentRow key={segment.segmentId} segment={segment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SurahDetailsView.displayName = 'SurahDetailsView';
