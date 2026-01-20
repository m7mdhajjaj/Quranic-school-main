import { memo, useState, useEffect } from 'react';
import { BookOpen, Target, Sparkles, RefreshCw, ChevronLeft, BookMarked, Search } from 'lucide-react';
import { useStudentGroupedSections } from '../hooks/data/useStudentGroupedSections';
import { SurahCard } from '../components/SurahCard';
import { SurahDetailsView } from '../components/SurahDetailsView';
import { getActiveSurahs, type ActiveSurahsResponse } from '@/Api/DailyMark/activeSurahApi';
import type { GroupedSurah } from '@/Api/DailyMark/studentGroupedSectionsApi';

interface NewStudentViewProps {
  studentId: string;
  groupId?: string;
}

/**
 * Loading Skeleton for Surah Cards
 */
const SurahCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-20" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded-full w-2/3" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
      </div>
    </div>
  </div>
);

/**
 * Empty State Component
 */
const EmptyState = () => (
  <div className="text-center py-20">
    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
      <BookOpen className="w-12 h-12 text-emerald-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد مقاطع بعد</h3>
    <p className="text-gray-500 max-w-sm mx-auto">سيقوم المعلم بتعيين مقاطع الحفظ والمراجعة لك قريباً</p>
  </div>
);

/**
 * Compact Header Component - كارد الهيدر
 */
const StudentHeader = memo<{
  completedSurahs: number;
}>(({ completedSurahs }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-lg p-6">
      <div className="space-y-4">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">مقاطعي في القرآن</h1>
            <p className="text-white/90 text-sm">تتبع تقدمك في الحفظ والمراجعة</p>
          </div>
        </div>

        {/* Stats Cards - Second Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* ✅ السور المكتملة من إجمالي سور القرآن (114) */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold">{completedSurahs}</span>
              <span className="text-lg text-white/70">/</span>
              <span className="text-lg text-white/80">114</span>
            </div>
            <p className="text-xs text-white/80 mt-1">سورة مكتملة</p>
          </div>
          {/* ✅ نسبة التقدم */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-bold block">{Math.round((completedSurahs / 114) * 100)}%</span>
            <p className="text-xs text-white/80 mt-1">نسبة الإنجاز</p>
          </div>
        </div>
      </div>
    </div>
  );
});

StudentHeader.displayName = 'StudentHeader';

/**
 * Filter and Search Section
 */
const FilterSection = memo<{
  filterStatus: 'all' | 'completed' | 'in_progress';
  onFilterChange: (status: 'all' | 'completed' | 'in_progress') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}>(({ filterStatus, onFilterChange, searchQuery, onSearchChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            مكتملة
          </button>
          <button
            onClick={() => onFilterChange('in_progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'in_progress'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            قيد الإكمال
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن سورة..."
            className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
});

FilterSection.displayName = 'FilterSection';

/**
 * Active Surah Banner - بانر السورة الفعالة (مختصر مع التقدم)
 * ✅ V8: Added progress bar and remaining ayahs display
 */
const ActiveSurahBanner = memo<{
  activeSurahs: ActiveSurahsResponse | null;
  onSurahClick?: (surahNumber: number) => void;
}>(({ activeSurahs, onSurahClick }) => {
  if (!activeSurahs) return null;

  const memActive = activeSurahs.memorization?.activeSurah;
  const revActive = activeSurahs.review?.activeSurah;
  
  // تحديد نوع المقطع
  const hasMemorization = memActive && !memActive.isCompleted;
  const hasReview = revActive && !revActive.isCompleted;
  
  if (!hasMemorization && !hasReview) return null;

  // Helper to render progress bar
  const renderProgressBar = (surah: typeof memActive, colorClass: string, textColorClass: string) => {
    if (!surah?.totalAyahs || surah.totalAyahs === 0) return null;
    // ✅ حساب النسبة مع حماية من تجاوز 100%
    const rawProgress = surah.progressPercent ?? Math.round((surah.lastAyahEnd / surah.totalAyahs) * 100);
    const progress = Math.min(100, Math.max(0, rawProgress)); // بين 0 و 100
    const remaining = surah.remainingAyahs ?? Math.max(0, surah.totalAyahs - surah.lastAyahEnd);
    
    return (
      <div className="mt-2 w-full">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>{surah.lastAyahEnd}/{surah.totalAyahs} آية</span>
          <span>متبقي {remaining} آية</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`text-[11px] font-bold text-center mt-1 ${textColorClass}`}>
          {progress}% مكتمل
        </p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* ✅ بانر سورة الحفظ الفعالة */}
      {hasMemorization && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookMarked className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-emerald-800 text-sm">سورة الحفظ الفعالة</span>
          </div>
          <button
            onClick={() => onSurahClick?.(memActive.surahNumber)}
            className="flex flex-col bg-white rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all w-full"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-2 rounded-lg">
                <BookMarked className="w-5 h-5 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-gray-900 text-lg">{memActive.surahName}</p>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">حفظ</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </div>
            {renderProgressBar(memActive, 'bg-gradient-to-r from-emerald-500 to-green-500', 'text-emerald-700')}
          </button>
        </div>
      )}

      {/* ✅ بانر سورة المراجعة الفعالة */}
      {hasReview && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-blue-800 text-sm">سورة المراجعة الفعالة</span>
          </div>
          <button
            onClick={() => onSurahClick?.(revActive.surahNumber)}
            className="flex flex-col bg-white rounded-xl p-3 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all w-full"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-gray-900 text-lg">{revActive.surahName}</p>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">مراجعة</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </div>
            {renderProgressBar(revActive, 'bg-gradient-to-r from-blue-500 to-cyan-500', 'text-blue-700')}
          </button>
        </div>
      )}
    </div>
  );
});

ActiveSurahBanner.displayName = 'ActiveSurahBanner';

/**
 * New Student View Component - عرض السور المجمعة للطالب
 */
export const NewStudentView = memo<NewStudentViewProps>(({ studentId, groupId }) => {
  const { surahs, summary, loading, error, refetch } = useStudentGroupedSections(studentId, groupId);
  const [selectedSurah, setSelectedSurah] = useState<GroupedSurah | null>(null);
  const [activeSurahs, setActiveSurahs] = useState<ActiveSurahsResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch active surahs
  useEffect(() => {
    const fetchActiveSurahs = async () => {
      if (!groupId) return;
      try {
        const result = await getActiveSurahs(groupId);
        if (result.success && result.data) {
          setActiveSurahs(result.data);
        }
      } catch (err) {
        console.error('Error fetching active surahs:', err);
      }
    };
    fetchActiveSurahs();
  }, [groupId]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    if (groupId) {
      const result = await getActiveSurahs(groupId);
      if (result.success && result.data) {
        setActiveSurahs(result.data);
      }
    }
    setIsRefreshing(false);
  };

  // Handle clicking on active surah banner
  const handleActiveSurahClick = (surahNumber: number) => {
    const surah = surahs.find(s => s.surahNumber === surahNumber);
    if (surah) {
      setSelectedSurah(surah);
    }
  };

  // Filter surahs based on status and search query
  const filteredSurahs = surahs.filter(surah => {
    // Filter by status
    if (filterStatus !== 'all' && surah.status !== filterStatus) {
      return false;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      return surah.surahName.includes(searchQuery) || 
             surah.surahNumber.toString().includes(searchQuery);
    }
    return true;
  });

  // Calculate progress
  const overallProgress = summary?.totalSegments 
    ? Math.round((summary.completedSegments / summary.totalSegments) * 100)
    : 0;

  // Check if a surah is active
  const checkIfActive = (surahNumber: number) => {
    const memActive = activeSurahs?.memorization?.activeSurah;
    const revActive = activeSurahs?.review?.activeSurah;
    return {
      isActiveMemorization: memActive?.surahNumber === surahNumber && !memActive?.isCompleted,
      isActiveReview: revActive?.surahNumber === surahNumber && !revActive?.isCompleted,
    };
  };

  // If a surah is selected, show details view
  if (selectedSurah) {
    return (
      <SurahDetailsView
        surah={selectedSurah}
        onBack={() => setSelectedSurah(null)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50" dir="rtl">
      {/* Header */}
      <StudentHeader
        completedSurahs={summary?.completedSurahs || 0}
      />

      {/* Content */}
      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Filter and Search Section */}
        <FilterSection
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <SurahCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSurahs.length === 0 && <EmptyState />}

        {/* Surahs Grid */}
        {!loading && !error && filteredSurahs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredSurahs.map(surah => (
              <SurahCard
                key={surah.surahNumber}
                surah={surah}
                onClick={() => setSelectedSurah(surah)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

NewStudentView.displayName = 'NewStudentView';
