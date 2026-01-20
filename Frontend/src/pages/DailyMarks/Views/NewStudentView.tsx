import { memo, useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import { BookOpen, Target, ChevronLeft, BookMarked, Search, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useStudentGroupedSections } from '../hooks/data/useStudentGroupedSections';
import { SurahCard } from '../components/SurahCard';
import { SurahDetailsView } from '../components/SurahDetailsView';
import { getActiveSurahs, type ActiveSurahsResponse } from '@/Api/DailyMark/activeSurahApi';
import type { GroupedSurah } from '@/Api/DailyMark/studentGroupedSectionsApi';

interface NewStudentViewProps {
  studentId: string;
  groupId?: string;
}

// ============================================================================
// 🎨 Color Palette - ألوان متناسقة
// ============================================================================
const COLORS = {
  // Primary - الأخضر مع الأورق الهادئ
  primary: {
    gradient: 'from-emerald-600 via-teal-700 to-slate-700',
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    textDark: 'text-emerald-700',
  },
  // Secondary - الأزرق الهادئ (للمراجعة)
  secondary: {
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    bg: 'bg-slate-600',
    bgLight: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    textDark: 'text-slate-700',
  },
  // Neutral
  neutral: {
    bg: 'bg-slate-50',
    bgCard: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-600',
    textMuted: 'text-slate-400',
  }
};

// ============================================================================
// 📦 Components
// ============================================================================

/**
 * Loading Skeleton for Surah Cards
 */
const SurahCardSkeleton = memo(() => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <div className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 h-20 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-slate-200 rounded-full w-2/3 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-100 rounded-lg flex-1 animate-pulse" />
        <div className="h-8 bg-slate-100 rounded-lg flex-1 animate-pulse" />
      </div>
    </div>
  </div>
));
SurahCardSkeleton.displayName = 'SurahCardSkeleton';

/**
 * Empty State Component
 */
const EmptyState = memo(() => (
  <div className="text-center py-20">
    <div className={`bg-gradient-to-br ${COLORS.primary.bgLight} to-teal-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg`}>
      <BookOpen className={`w-12 h-12 ${COLORS.primary.text}`} />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-2">لا توجد مقاطع بعد</h3>
    <p className="text-slate-500 max-w-sm mx-auto">سيقوم المعلم بتعيين مقاطع الحفظ والمراجعة لك قريباً</p>
  </div>
));
EmptyState.displayName = 'EmptyState';

/**
 * Compact Header Component - كارد الهيدر المحسّن
 */
const StudentHeader = memo<{
  completedSurahs: number;
}>(({ completedSurahs }) => {
  const progressPercent = useMemo(() => 
    Math.round((completedSurahs / 114) * 100), 
    [completedSurahs]
  );

  return (
    <div className={`bg-gradient-to-r ${COLORS.primary.gradient} text-white rounded-b-3xl shadow-xl p-6 pb-8`}>
      <div className="space-y-5">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">مقاطعي في القرآن</h1>
            <p className="text-white/80 text-sm mt-0.5">تتبع تقدمك في الحفظ والمراجعة</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* السور المكتملة */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-4 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-3xl font-black">{completedSurahs}</span>
              <span className="text-xl text-white/60">/</span>
              <span className="text-xl text-white/70">114</span>
            </div>
            <p className="text-xs text-white/70 mt-2 font-medium">سورة مكتملة</p>
          </div>
          
          {/* نسبة الإنجاز */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-4 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
            <span className="text-3xl font-black block">{progressPercent}%</span>
            <p className="text-xs text-white/70 mt-2 font-medium">نسبة الإنجاز</p>
            {/* Mini progress bar */}
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/80 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
StudentHeader.displayName = 'StudentHeader';

/**
 * Filter Button Component
 */
const FilterButton = memo<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}>(({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
      isActive
        ? `bg-gradient-to-r ${COLORS.primary.gradient} text-white shadow-lg shadow-emerald-200/50 scale-105`
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
        isActive ? 'bg-white/20' : 'bg-slate-200'
      }`}>
        {count}
      </span>
    )}
  </button>
));
FilterButton.displayName = 'FilterButton';

/**
 * Filter and Search Section
 */
const FilterSection = memo<{
  filterStatus: 'all' | 'completed' | 'in_progress';
  onFilterChange: (status: 'all' | 'completed' | 'in_progress') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: { all: number; completed: number; inProgress: number };
}>(({ filterStatus, onFilterChange, searchQuery, onSearchChange, counts }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 -mt-4 mx-2 relative z-10">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterButton 
            label="الكل" 
            isActive={filterStatus === 'all'} 
            onClick={() => onFilterChange('all')}
            count={counts.all}
          />
          <FilterButton 
            label="مكتملة" 
            isActive={filterStatus === 'completed'} 
            onClick={() => onFilterChange('completed')}
            count={counts.completed}
          />
          <FilterButton 
            label="قيد الإكمال" 
            isActive={filterStatus === 'in_progress'} 
            onClick={() => onFilterChange('in_progress')}
            count={counts.inProgress}
          />
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن سورة..."
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 text-sm bg-slate-50 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
});
FilterSection.displayName = 'FilterSection';

/**
 * Progress Bar Component
 */
const ProgressBar = memo<{
  progress: number;
  remaining: number;
  total: number;
  current: number;
  colorClass: string;
  textColorClass: string;
}>(({ progress, remaining, total, current, colorClass, textColorClass }) => (
  <div className="mt-3 w-full">
    <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
      <span className="font-medium">{current}/{total} آية</span>
      <span>متبقي {remaining} آية</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className={`text-xs font-bold text-center mt-1.5 ${textColorClass}`}>
      {progress}% مكتمل
    </p>
  </div>
));
ProgressBar.displayName = 'ProgressBar';

/**
 * Active Surah Card - بطاقة السورة الفعالة بتصميم قوي
 */
const ActiveSurahCard = memo<{
  surah: NonNullable<ActiveSurahsResponse['memorization']>['activeSurah'];
  type: 'memorization' | 'review';
  onClick: () => void;
}>(({ surah, type, onClick }) => {
  if (!surah) return null;
  
  const isMemorization = type === 'memorization';
  const Icon = isMemorization ? BookMarked : Target;
  const label = isMemorization ? 'حفظ' : 'مراجعة';
  const title = isMemorization ? 'سورة الحفظ الفعالة' : 'سورة المراجعة الفعالة';
  
  // ✅ ألوان قوية مثل كروت السور
  const headerGradient = isMemorization 
    ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700' 
    : 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700';
  const progressColor = isMemorization 
    ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700' 
    : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600';
  const titleColor = isMemorization ? 'text-emerald-700' : 'text-slate-700';
  
  // ✅ إصلاح: استخدام قيمة افتراضية لـ totalAyahs
  const totalAyahs = surah.totalAyahs ?? 1;
  const progress = Math.min(100, Math.max(0, 
    surah.progressPercent ?? Math.round((surah.lastAyahEnd / totalAyahs) * 100)
  ));
  const remaining = surah.remainingAyahs ?? Math.max(0, totalAyahs - surah.lastAyahEnd);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Title Bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <Icon className={`w-4 h-4 ${titleColor}`} />
        <span className={`font-bold ${titleColor} text-sm`}>{title}</span>
      </div>
      
      {/* Card Content */}
      <button
        onClick={onClick}
        className="w-full text-right group"
      >
        {/* Header with gradient - مثل كروت السور */}
        <div className={`${headerGradient} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-xl">{surah.surahName}</p>
                <span className="text-white/80 text-sm">{label}</span>
              </div>
            </div>
            <ChevronLeft className="w-6 h-6 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="p-4 bg-white">
          <ProgressBar
            progress={progress}
            remaining={remaining}
            total={totalAyahs}
            current={surah.lastAyahEnd}
            colorClass={progressColor}
            textColorClass={titleColor}
          />
        </div>
      </button>
    </div>
  );
});
ActiveSurahCard.displayName = 'ActiveSurahCard';

/**
 * Active Surah Banner
 */
const ActiveSurahBanner = memo<{
  activeSurahs: ActiveSurahsResponse | null;
  onSurahClick: (surahNumber: number) => void;
}>(({ activeSurahs, onSurahClick }) => {
  if (!activeSurahs) return null;

  const memActive = activeSurahs.memorization?.activeSurah;
  const revActive = activeSurahs.review?.activeSurah;
  
  const hasMemorization = memActive && !memActive.isCompleted;
  const hasReview = revActive && !revActive.isCompleted;
  
  if (!hasMemorization && !hasReview) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {hasMemorization && (
        <ActiveSurahCard 
          surah={memActive} 
          type="memorization" 
          onClick={() => onSurahClick(memActive.surahNumber)} 
        />
      )}
      {hasReview && (
        <ActiveSurahCard 
          surah={revActive} 
          type="review" 
          onClick={() => onSurahClick(revActive.surahNumber)} 
        />
      )}
    </div>
  );
});
ActiveSurahBanner.displayName = 'ActiveSurahBanner';

/**
 * Loading Overlay - يظهر عند التحديث بدون إعادة render كاملة
 */
const LoadingOverlay = memo<{ isVisible: boolean }>(({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-slate-200 flex items-center gap-2">
      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
      <span className="text-sm text-slate-600 font-medium">جاري التحديث...</span>
    </div>
  );
});
LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * Surahs Grid - شبكة السور المحسّنة
 */
const SurahsGrid = memo<{
  surahs: GroupedSurah[];
  onSurahClick: (surah: GroupedSurah) => void;
}>(({ surahs, onSurahClick }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
    {surahs.map((surah, index) => (
      <div 
        key={surah.surahNumber}
        className="transform transition-all duration-300"
        style={{ 
          animationDelay: `${index * 30}ms`,
          animation: 'fadeSlideUp 0.4s ease-out forwards',
          opacity: 0 
        }}
      >
        <SurahCard
          surah={surah}
          onClick={() => onSurahClick(surah)}
        />
      </div>
    ))}
  </div>
));
SurahsGrid.displayName = 'SurahsGrid';

/**
 * Stats Legend - توضيح معاني الإحصائيات
 */
const StatsLegend = memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const legendItems = [
    {
      label: 'الجلسات',
      description: 'عدد المرات التي درست فيها هذه السورة (حفظ أو مراجعة). كل يوم يُحسب كجلسة واحدة حتى لو درست حفظ ومراجعة.',
      icon: '📅',
      color: 'bg-slate-50 border-slate-200 text-slate-700',
    },
    {
      label: 'المنجزة',
      description: 'عدد الجلسات التي حصلت فيها على علامة. إذا كانت الجلسة تحتوي حفظ ومراجعة، يجب أن تحصل على علامتين لتُحسب منجزة.',
      icon: '✅',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      label: 'المعدل',
      description: 'متوسط علاماتك في هذه السورة (من 10). يُحسب بجمع كل العلامات وقسمتها على عددها.',
      icon: '📊',
      color: 'bg-teal-50 border-teal-200 text-teal-700',
    },
    {
      label: 'نسبة الإتمام',
      description: 'النسبة المئوية للآيات التي وصلت إليها من إجمالي آيات السورة. مثلاً: وصلت للآية 50 من 286 = 17%',
      icon: '📈',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header - Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-semibold text-slate-700">ماذا تعني هذه الأرقام؟</span>
        </div>
        <ChevronLeft className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
      </button>
      
      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
          {legendItems.map((item, index) => (
            <div 
              key={item.label}
              className={`flex gap-3 p-3 rounded-xl border ${item.color}`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: isExpanded ? 'fadeSlideUp 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
StatsLegend.displayName = 'StatsLegend';

// ============================================================================
// 🚀 Main Component
// ============================================================================

/**
 * New Student View Component - عرض السور المجمعة للطالب
 * ✅ محسّن للأداء مع smooth transitions
 * ✅ دعم URL للتنقل بين الصفحات (زر الرجوع في المتصفح)
 */
export const NewStudentView = memo<NewStudentViewProps>(({ studentId, groupId }) => {
  // ✅ URL State Management
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ useTransition للتحديثات السلسة
  const [isPending, startTransition] = useTransition();
  
  const { surahs, summary, loading, error, refetch } = useStudentGroupedSections(studentId, groupId);
  const [activeSurahs, setActiveSurahs] = useState<ActiveSurahsResponse | null>(null);
  
  // ✅ URL-based state: read from URL params
  const selectedSurahNumber = searchParams.get('surah');
  const filterStatus = (searchParams.get('filter') as 'all' | 'completed' | 'in_progress') || 'all';
  const searchQuery = searchParams.get('search') || '';
  
  // ✅ Get selected surah from URL param
  const selectedSurah = useMemo(() => {
    if (!selectedSurahNumber) return null;
    return surahs.find(s => s.surahNumber === parseInt(selectedSurahNumber)) || null;
  }, [selectedSurahNumber, surahs]);

  // ✅ Fetch active surahs with memoized callback
  const fetchActiveSurahs = useCallback(async () => {
    if (!groupId) return;
    try {
      const result = await getActiveSurahs(groupId);
      if (result.success && result.data) {
        setActiveSurahs(result.data);
      }
    } catch (err) {
      console.error('Error fetching active surahs:', err);
    }
  }, [groupId]);

  useEffect(() => {
    fetchActiveSurahs();
  }, [fetchActiveSurahs]);

  // ✅ URL-aware filter change handler
  const handleFilterChange = useCallback((status: 'all' | 'completed' | 'in_progress') => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams);
      if (status === 'all') {
        newParams.delete('filter');
      } else {
        newParams.set('filter', status);
      }
      setSearchParams(newParams, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  // ✅ URL-aware search change handler
  const handleSearchChange = useCallback((query: string) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams);
      if (query.trim()) {
        newParams.set('search', query);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  // ✅ URL-aware surah click handler
  const handleSurahClick = useCallback((surah: GroupedSurah) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('surah', surah.surahNumber.toString());
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // ✅ URL-aware active surah click handler
  const handleActiveSurahClick = useCallback((surahNumber: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('surah', surahNumber.toString());
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // ✅ URL-aware back handler
  const handleBack = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('surah');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // ✅ Memoized filtered surahs
  const filteredSurahs = useMemo(() => {
    return surahs.filter(surah => {
      if (filterStatus !== 'all' && surah.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        return surah.surahName.includes(searchQuery) || 
               surah.surahNumber.toString().includes(searchQuery);
      }
      return true;
    });
  }, [surahs, filterStatus, searchQuery]);

  // ✅ Memoized counts
  const counts = useMemo(() => ({
    all: surahs.length,
    completed: surahs.filter(s => s.status === 'completed').length,
    inProgress: surahs.filter(s => s.status === 'in_progress').length,
  }), [surahs]);

  // ✅ If a surah is selected, show details view
  if (selectedSurah) {
    return (
      <SurahDetailsView
        surah={selectedSurah}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      {/* ✅ Loading overlay for smooth updates */}
      <LoadingOverlay isVisible={isPending} />
      
      {/* ✅ CSS Animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className={`min-h-screen w-full bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 transition-opacity duration-300 ${isPending ? 'opacity-90' : 'opacity-100'}`} dir="rtl">
        {/* Header */}
        <StudentHeader completedSurahs={summary?.completedSurahs || 0} />

        {/* Content */}
        <div className="px-4 md:px-6 lg:px-8 py-6 space-y-5">
          {/* Filter and Search Section */}
          <FilterSection
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            counts={counts}
          />
          
          {/* Active Surah Banner */}
          {!loading && groupId && (
            <ActiveSurahBanner 
              activeSurahs={activeSurahs} 
              onSurahClick={handleActiveSurahClick}
            />
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center shadow-sm">
              <p className="text-red-700 font-medium">{error}</p>
              <button 
                onClick={() => refetch()}
                className="mt-3 text-red-600 hover:text-red-800 text-sm font-semibold hover:underline"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SurahCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSurahs.length === 0 && <EmptyState />}

          {/* Surahs Grid */}
          {!loading && !error && filteredSurahs.length > 0 && (
            <SurahsGrid surahs={filteredSurahs} onSurahClick={handleSurahClick} />
          )}

          {/* Stats Legend - توضيح الإحصائيات */}
          {!loading && !error && filteredSurahs.length > 0 && (
            <StatsLegend />
          )}
        </div>
      </div>
    </>
  );
});

NewStudentView.displayName = 'NewStudentView';
