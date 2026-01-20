import { memo, useState, useMemo } from 'react';
import { ArrowRight, Calendar, BookMarked, BookOpen, XCircle, CalendarDays, CalendarRange, CheckCircle2, Clock, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { GroupedSurah, SurahSegment } from '@/Api/DailyMark/studentGroupedSectionsApi';
import { formatDateArabic } from '@/utils/timezone';

interface SurahDetailsViewProps {
  surah: GroupedSurah;
  onBack: () => void;
}

// نوع الفلتر
type SegmentFilter = 'all' | 'memorization' | 'review';
type TimeFilter = 'all' | 'month' | 'week' | 'custom';
type MarkFilter = 'all' | 'with-mark' | 'without-mark';

// واجهة نطاق التاريخ
interface DateRange {
  from: string;
  to: string;
}

/**
 * دالة للتحقق إذا التاريخ ضمن الفترة الزمنية المحددة
 */
const isWithinTimeRange = (dateStr: string, timeFilter: TimeFilter, customRange?: DateRange): boolean => {
  if (timeFilter === 'all') return true;
  if (!dateStr) return true; // إذا لم يوجد تاريخ، أظهر المقطع
  
  const segmentDate = new Date(dateStr);
  segmentDate.setHours(12, 0, 0, 0); // منتصف اليوم لتجنب مشاكل التوقيت
  
  const now = new Date();
  
  if (timeFilter === 'month') {
    // الشهر الحالي
    return segmentDate.getMonth() === now.getMonth() && 
           segmentDate.getFullYear() === now.getFullYear();
  }
  
  if (timeFilter === 'week') {
    // ✅ FIX: الأسبوع الحالي = 7 أيام للخلف + 7 أيام للأمام (لتشمل المقاطع المجدولة)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 7);
    weekAhead.setHours(23, 59, 59, 999);
    
    return segmentDate.getTime() >= weekAgo.getTime() && segmentDate.getTime() <= weekAhead.getTime();
  }
  
  if (timeFilter === 'custom' && customRange) {
    // نطاق تاريخ مخصص
    const fromDate = new Date(customRange.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(customRange.to);
    toDate.setHours(23, 59, 59, 999);
    return segmentDate.getTime() >= fromDate.getTime() && segmentDate.getTime() <= toDate.getTime();
  }
  
  return true;
};

/**
 * Segment Row Component - عرض كارد مقطع واحد
 * ✅ تصميم جديد مع تخطيط أفقي وألوان متناسقة
 */
const SegmentRow = memo<{ segment: SurahSegment }>(({ segment }) => {
  const hasMark = segment.mark && (segment.mark.memorizationMark !== null || segment.mark.reviewMark !== null);
  const markValue = segment.type === 'memorization' 
    ? segment.mark?.memorizationMark 
    : segment.mark?.reviewMark;

  const getMarkGradient = (mark: number | null | undefined) => {
    if (!mark) return 'from-slate-400 to-slate-500';
    if (mark >= 9) return 'from-emerald-600 via-teal-700 to-slate-700';
    if (mark >= 7) return 'from-teal-600 via-slate-600 to-emerald-700';
    if (mark >= 5) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const isMemorization = segment.type === 'memorization';
  
  // استخراج اسم اليوم
  const dayName = new Date(segment.sectionDate).toLocaleDateString('ar-SA', { weekday: 'long' });

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
      isMemorization 
        ? 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40' 
        : 'bg-gradient-to-br from-white via-slate-50/50 to-slate-100/40'
    }`}>
      {/* Header Band - شريط ملون علوي */}
      <div className={`px-4 py-3 ${
        isMemorization 
          ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700' 
          : 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              {isMemorization 
                ? <BookMarked className="w-5 h-5 text-white" />
                : <BookOpen className="w-5 h-5 text-white" />
              }
            </div>
            <span className="text-white font-bold">
              {isMemorization ? 'حفظ' : 'مراجعة'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-xl">
            <span className="text-white/90 text-sm font-medium">
              الآية {segment.ayahStart} - {segment.ayahEnd}
            </span>
          </div>
        </div>
      </div>

      {/* Body - تخطيط أفقي */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* اليوم */}
          <div className={`flex-1 flex items-center gap-3 p-3 rounded-xl ${
            isMemorization 
              ? 'bg-gradient-to-r from-emerald-100/80 to-teal-100/60' 
              : 'bg-gradient-to-r from-slate-100 to-slate-200/70'
          }`}>
            <div className={`p-2.5 rounded-xl shadow-sm ${
              isMemorization 
                ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700' 
                : 'bg-gradient-to-br from-slate-500 to-slate-600'
            }`}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${
                isMemorization ? 'text-emerald-700' : 'text-slate-700'
              }`}>{dayName}</span>
              <span className="text-xs text-slate-500">{formatDateArabic(segment.sectionDate)}</span>
            </div>
          </div>

          {/* العلامة */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            hasMark 
              ? `bg-gradient-to-r ${getMarkGradient(markValue)} shadow-lg` 
              : 'bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-dashed border-slate-300'
          }`}>
            {hasMark ? (
              <>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-white drop-shadow-md">
                    {markValue}
                  </span>
                  <span className="text-xs text-white/80 font-medium">من 10</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-500">لم تُدرج</span>
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
 * Filter Tab Button - زر التبويب
 */
const FilterTab = memo<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  count: number;
  colorClass: string;
}>(({ label, icon, isActive, onClick, count, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? `${colorClass} text-white shadow-lg scale-105`
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
      isActive ? 'bg-white/20' : 'bg-slate-200'
    }`}>
      {count}
    </span>
  </button>
));
FilterTab.displayName = 'FilterTab';

/**
 * Time Filter Tab - زر تبويب الفترة الزمنية
 */
const TimeFilterTab = memo<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}>(({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-teal-600 to-slate-600 text-white shadow-md'
        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
));
TimeFilterTab.displayName = 'TimeFilterTab';

/**
 * Surah Details View Component - عرض تفاصيل مقاطع السورة
 * ✅ محسّن بألوان متناسقة مع التدرجات الجديدة
 * ✅ مع فلتر للتحكم بعرض الحفظ/المراجعة
 * ✅ مع فلتر للفترة الزمنية (الشهر/الأسبوع/مخصص)
 * ✅ مع فلتر لحالة العلامات (بعلامة/بدون علامة)
 */
export const SurahDetailsView = memo<SurahDetailsViewProps>(({ surah, onBack }) => {
  // فلتر نوع المقاطع
  const [typeFilter, setTypeFilter] = useState<SegmentFilter>('all');
  // فلتر الفترة الزمنية
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  // فلتر حالة العلامات
  const [markFilter, setMarkFilter] = useState<MarkFilter>('all');
  // نطاق التاريخ المخصص
  const [customRange, setCustomRange] = useState<DateRange>({ from: '', to: '' });
  // إظهار/إخفاء حقول التاريخ المخصص
  const [showCustomRange, setShowCustomRange] = useState(false);
  // إظهار/إخفاء قسم الفلاتر
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // دالة للتحقق من وجود علامة
  const hasMark = (segment: SurahSegment) => {
    if (segment.type === 'memorization') {
      return segment.mark?.memorizationMark !== null && segment.mark?.memorizationMark !== undefined;
    }
    return segment.mark?.reviewMark !== null && segment.mark?.reviewMark !== undefined;
  };
  
  // تصفية المقاطع حسب الفترة الزمنية أولاً
  // ✅ FIX: استخدام sectionDate بدلاً من date
  const timeFilteredSegments = useMemo(() => {
    return surah.segments.filter(s => isWithinTimeRange(s.sectionDate, timeFilter, customRange));
  }, [surah.segments, timeFilter, customRange]);
  
  // تصفية حسب حالة العلامات
  const markFilteredSegments = useMemo(() => {
    if (markFilter === 'all') return timeFilteredSegments;
    if (markFilter === 'with-mark') return timeFilteredSegments.filter(s => hasMark(s));
    return timeFilteredSegments.filter(s => !hasMark(s));
  }, [timeFilteredSegments, markFilter]);
  
  // ثم تقسيم حسب النوع
  const memorizationSegments = useMemo(() => 
    markFilteredSegments.filter(s => s.type === 'memorization'),
    [markFilteredSegments]
  );
  const reviewSegments = useMemo(() => 
    markFilteredSegments.filter(s => s.type === 'review'),
    [markFilteredSegments]
  );
  
  // إحصائيات العلامات
  const withMarkCount = useMemo(() => 
    timeFilteredSegments.filter(s => hasMark(s)).length,
    [timeFilteredSegments]
  );
  const withoutMarkCount = useMemo(() => 
    timeFilteredSegments.filter(s => !hasMark(s)).length,
    [timeFilteredSegments]
  );
  
  // تحديد ما يظهر حسب الفلتر
  const showMemorization = typeFilter === 'all' || typeFilter === 'memorization';
  const showReview = typeFilter === 'all' || typeFilter === 'review';
  
  // إخفاء تبويبات النوع إذا كان نوع واحد فقط موجود
  const hasBothTypes = memorizationSegments.length > 0 && reviewSegments.length > 0;
  
  // التحقق من صحة النطاق المخصص
  const isCustomRangeValid = customRange.from && customRange.to && customRange.from <= customRange.to;

  // عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (timeFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (markFilter !== 'all') count++;
    return count;
  }, [timeFilter, typeFilter, markFilter]);

  // معالجة اختيار النطاق المخصص
  const handleCustomRangeSelect = () => {
    if (isCustomRangeValid) {
      setTimeFilter('custom');
      setShowCustomRange(false);
    }
  };
  
  // إعادة تعيين كل الفلاتر
  const resetAllFilters = () => {
    setTimeFilter('all');
    setTypeFilter('all');
    setMarkFilter('all');
    setCustomRange({ from: '', to: '' });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20" dir="rtl">
      <div className="w-full space-y-0">
        {/* Header Card */}
        <div className="bg-white overflow-hidden">
          {/* Header Band - تدرجات جديدة */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-4 md:px-8 lg:px-12 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
            
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
                  <p className="text-white/80 text-sm mt-1">
                    رقم {surah.surahNumber} • {surah.surahAyahCount} آية
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Summary - كاردات إحصائية متناسقة */}
          <div className="px-4 md:px-8 lg:px-12 py-8 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* عدد الجلسات */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <p className="text-4xl font-black text-white mb-1">{surah.totalSegments}</p>
                  <p className="text-sm font-medium text-slate-200">عدد الجلسات</p>
                </div>
              </div>
              
              {/* جلسات منجزة */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <p className="text-4xl font-black text-white mb-1">{surah.completedSegments}</p>
                  <p className="text-sm font-medium text-emerald-100">جلسات منجزة</p>
                </div>
              </div>
              
              {/* نسبة الإتمام */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-slate-600 to-emerald-700 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <p className="text-4xl font-black text-white mb-1">{surah.progressPercentage}%</p>
                  <p className="text-sm font-medium text-teal-100">نسبة الإتمام</p>
                </div>
              </div>
              
              {/* معدل الجلسات */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-700 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <p className="text-4xl font-black text-white mb-1">
                    {surah.averageMark > 0 ? surah.averageMark : '-'}
                  </p>
                  <p className="text-sm font-medium text-emerald-100">معدل الجلسات</p>
                </div>
              </div>
            </div>

            {/* Filter Section - قسم الفلاتر المركبة */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* زر فتح/إغلاق الفلاتر */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 p-2.5 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 text-base">فلترة المقاطع</span>
                    <p className="text-xs text-slate-500 mt-0.5">تصفية حسب الفترة والنوع والعلامة</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {activeFiltersCount} فلتر نشط
                    </span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {/* محتوى الفلاتر القابل للطي */}
              <div className={`transition-all duration-300 ease-out overflow-hidden ${isFiltersOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 space-y-5 border-t border-slate-100">
              {/* فلتر الفترة الزمنية */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4">
                <span className="text-sm text-slate-600 font-semibold flex items-center gap-2 min-w-[80px]">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  الفترة:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <TimeFilterTab
                    label="الكل"
                    icon={<CalendarRange className="w-4 h-4" />}
                    isActive={timeFilter === 'all'}
                    onClick={() => { setTimeFilter('all'); setShowCustomRange(false); }}
                  />
                  <TimeFilterTab
                    label="هذا الشهر"
                    icon={<CalendarDays className="w-4 h-4" />}
                    isActive={timeFilter === 'month'}
                    onClick={() => { setTimeFilter('month'); setShowCustomRange(false); }}
                  />
                  <TimeFilterTab
                    label="هذا الأسبوع"
                    icon={<Calendar className="w-4 h-4" />}
                    isActive={timeFilter === 'week'}
                    onClick={() => { setTimeFilter('week'); setShowCustomRange(false); }}
                  />
                  <TimeFilterTab
                    label={timeFilter === 'custom' && isCustomRangeValid ? `${customRange.from} → ${customRange.to}` : 'نطاق مخصص'}
                    icon={<CalendarRange className="w-4 h-4" />}
                    isActive={timeFilter === 'custom' || showCustomRange}
                    onClick={() => setShowCustomRange(!showCustomRange)}
                  />
                </div>
              </div>
              
              {/* حقول اختيار النطاق المخصص */}
              {showCustomRange && (
                <div className="flex flex-wrap items-end gap-3 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="dateFrom" className="text-sm font-medium text-slate-600">من تاريخ</label>
                    <input
                      id="dateFrom"
                      type="date"
                      value={customRange.from}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                      title="تاريخ البداية"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="dateTo" className="text-sm font-medium text-slate-600">إلى تاريخ</label>
                    <input
                      id="dateTo"
                      type="date"
                      value={customRange.to}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                      title="تاريخ النهاية"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCustomRangeSelect}
                    disabled={!isCustomRangeValid}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCustomRangeValid
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-md'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    تطبيق
                  </button>
                  <button
                    onClick={() => { setShowCustomRange(false); setCustomRange({ from: '', to: '' }); }}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              )}
              
              {/* فلتر نوع المقاطع - يظهر فقط إذا كان هناك نوعين */}
              {hasBothTypes && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-600 font-semibold flex items-center gap-2 min-w-[80px]">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    النوع:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterTab
                      label="الكل"
                      icon={<BookOpen className="w-4 h-4" />}
                      isActive={typeFilter === 'all'}
                      onClick={() => setTypeFilter('all')}
                      count={memorizationSegments.length + reviewSegments.length}
                      colorClass="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700"
                    />
                    <FilterTab
                      label="الحفظ"
                      icon={<BookMarked className="w-4 h-4" />}
                      isActive={typeFilter === 'memorization'}
                      onClick={() => setTypeFilter('memorization')}
                      count={memorizationSegments.length}
                      colorClass="bg-gradient-to-r from-emerald-600 to-teal-700"
                    />
                    <FilterTab
                      label="المراجعة"
                      icon={<BookOpen className="w-4 h-4" />}
                      isActive={typeFilter === 'review'}
                      onClick={() => setTypeFilter('review')}
                      count={reviewSegments.length}
                      colorClass="bg-gradient-to-r from-slate-500 to-slate-700"
                    />
                  </div>
                </div>
              )}
              
              {/* فلتر حالة العلامات */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-600 font-semibold flex items-center gap-2 min-w-[80px]">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  العلامة:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <FilterTab
                    label="الكل"
                    icon={<BookOpen className="w-4 h-4" />}
                    isActive={markFilter === 'all'}
                    onClick={() => setMarkFilter('all')}
                    count={timeFilteredSegments.length}
                    colorClass="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700"
                  />
                  <FilterTab
                    label="بعلامة"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    isActive={markFilter === 'with-mark'}
                    onClick={() => setMarkFilter('with-mark')}
                    count={withMarkCount}
                    colorClass="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700"
                  />
                  <FilterTab
                    label="بدون علامة"
                    icon={<Clock className="w-4 h-4" />}
                    isActive={markFilter === 'without-mark'}
                    onClick={() => setMarkFilter('without-mark')}
                    count={withoutMarkCount}
                    colorClass="bg-gradient-to-r from-amber-500 to-orange-600"
                  />
                </div>
              </div>
              
              {/* عرض عدد النتائج المفلترة */}
              {(timeFilter !== 'all' || typeFilter !== 'all' || markFilter !== 'all') && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-teal-700 bg-teal-50 px-4 py-3 rounded-xl border border-teal-200 mt-4">
                  <span className="font-medium">
                    📊 يظهر {markFilteredSegments.length} مقطع 
                    {timeFilter === 'month' && ' من هذا الشهر'}
                    {timeFilter === 'week' && ' من هذا الأسبوع'}
                    {timeFilter === 'custom' && ` من ${customRange.from} إلى ${customRange.to}`}
                    {markFilter === 'with-mark' && ' بعلامات مدرجة'}
                    {markFilter === 'without-mark' && ' بدون علامات'}
                  </span>
                  <button 
                    onClick={resetAllFilters}
                    className="text-teal-600 hover:text-teal-800 font-semibold hover:underline transition-all"
                  >
                    🔄 إعادة تعيين
                  </button>
                </div>
              )}
              
              {/* رسالة إذا لم يوجد مقاطع في الفترة المحددة */}
              {timeFilteredSegments.length === 0 && timeFilter !== 'all' && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200 mt-4">
                  <XCircle className="w-4 h-4" />
                  <span>
                    لا توجد مقاطع في {timeFilter === 'month' ? 'هذا الشهر' : timeFilter === 'week' ? 'هذا الأسبوع' : 'النطاق المحدد'}
                  </span>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memorization Segments - تدرجات جديدة */}
        {showMemorization && memorizationSegments.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-slate-50/30 border-t-4 border-emerald-600 px-4 md:px-8 lg:px-12 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-3 rounded-xl shadow-md">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">مقاطع الحفظ</h2>
                <p className="text-sm text-slate-600">إجمالي {memorizationSegments.length} مقطع</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memorizationSegments.map(segment => (
                <SegmentRow key={segment.segmentId} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {/* Review Segments - تدرجات جديدة */}
        {showReview && reviewSegments.length > 0 && (
          <div className="bg-gradient-to-br from-slate-50/40 via-slate-100/30 to-slate-50/20 border-t-4 border-slate-500 px-4 md:px-8 lg:px-12 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-slate-500 to-slate-700 p-3 rounded-xl shadow-md">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">مقاطع المراجعة</h2>
                <p className="text-sm text-slate-600">إجمالي {reviewSegments.length} مقطع</p>
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
