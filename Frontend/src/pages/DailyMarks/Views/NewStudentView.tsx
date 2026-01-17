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
  totalSurahs: number;
  completedSurahs: number;
  overallProgress: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}>(({ totalSurahs, completedSurahs, overallProgress, onRefresh, isRefreshing }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-lg p-6">
      <div className="space-y-4">
        {/* Title Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">مقاطعي في القرآن</h1>
              <p className="text-white/90 text-sm">تتبع تقدمك في الحفظ والمراجعة</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="تحديث البيانات"
              aria-label="تحديث البيانات"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm p-3 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Stats Cards - Second Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-bold block">{totalSurahs}</span>
            <p className="text-xs text-white/80 mt-1">سورة</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-bold block">{completedSurahs}</span>
            <p className="text-xs text-white/80 mt-1">مكتملة</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-bold block">{overallProgress}%</span>
            <p className="text-xs text-white/80 mt-1">التقدم</p>
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
  filterStatus: 'all' | 'completed' | 'in_progress' | 'not_started';
  onFilterChange: (status: 'all' | 'completed' | 'in_progress' | 'not_started') => void;
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
            قيد التقدم
          </button>
          <button
            onClick={() => onFilterChange('not_started')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'not_started'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            لم تبدأ
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
 * Active Surah Banner - بانر السورة الفعالة (مختصر)
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

  // إذا نفس السورة للحفظ والمراجعة
  const isSameSurah = hasMemorization && hasReview && memActive.surahNumber === revActive.surahNumber;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <span className="font-bold text-amber-800">السورة الفعالة الآن</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {isSameSurah ? (
          // نفس السورة للحفظ والمراجعة
          <button
            onClick={() => onSurahClick?.(memActive.surahNumber)}
            className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all flex-1 min-w-[200px]"
          >
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-right flex-1">
              <p className="font-bold text-gray-900 text-lg">{memActive.surahName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">حفظ</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">مراجعة</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        ) : (
          <>
            {/* سورة الحفظ */}
            {hasMemorization && (
              <button
                onClick={() => onSurahClick?.(memActive.surahNumber)}
                className="flex items-center gap-3 bg-white rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all flex-1 min-w-[180px]"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-2 rounded-lg">
                  <BookMarked className="w-5 h-5 text-white" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold text-gray-900">{memActive.surahName}</p>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">حفظ</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* سورة المراجعة */}
            {hasReview && (
              <button
                onClick={() => onSurahClick?.(revActive.surahNumber)}
                className="flex items-center gap-3 bg-white rounded-xl p-3 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all flex-1 min-w-[180px]"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold text-gray-900">{revActive.surahName}</p>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">مراجعة</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </>
        )}
      </div>
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
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
        totalSurahs={summary?.totalSurahs || 0}
        completedSurahs={summary?.completedSurahs || 0}
        overallProgress={overallProgress}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
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
            {filteredSurahs.map(surah => {
              const { isActiveMemorization, isActiveReview } = checkIfActive(surah.surahNumber);
              return (
                <SurahCard
                  key={surah.surahNumber}
                  surah={surah}
                  onClick={() => setSelectedSurah(surah)}
                  isActiveMemorization={isActiveMemorization}
                  isActiveReview={isActiveReview}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

NewStudentView.displayName = 'NewStudentView';
