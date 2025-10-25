import React, { useState, useMemo, useCallback, memo } from "react";
import type { Surah } from "../../../Api/quranAudioApi";
import SurahCard from "./SurahCard";
import { SearchInput, FilterSelect, FilterContainer } from "../../../components/shared/Filter";
import type { FilterOption } from "../../../components/shared/Filter";
import { EmptyState } from "../../../components/shared";
import ResponsivePagination from "../../../components/shared/Navigation/ResponsivePagination";

interface SurahListProps {
  surahs: Surah[];
  selectedSurah: Surah | null;
  isPlaying: boolean;
  loading: boolean;
  onSurahSelect: (surah: Surah) => void;
  onPlayPause: (surah: Surah) => void;
}

type SortOrder = "asc" | "desc";

const SurahList: React.FC<SurahListProps> = ({
  surahs,
  selectedSurah,
  isPlaying,
  loading,
  onSurahSelect,
  onPlayPause,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 سورة في كل صفحة

  // Filter and sort surahs
  const filteredAndSorted = useMemo(() => {
    let filtered = surahs;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = surahs.filter((surah) => {
        const nameMatch = surah.name.toLowerCase().includes(searchLower);
        const englishMatch = surah.englishName.toLowerCase().includes(searchLower);
        const numberMatch = surah.number.toString().includes(searchLower);
        return nameMatch || englishMatch || numberMatch;
      });
    }

    // Apply sorting
    return sortOrder === "asc" ? filtered : [...filtered].reverse();
  }, [surahs, searchTerm, sortOrder]);

  // ✅ Optimized pagination - only compute when dependencies change
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSurahs = filteredAndSorted.slice(startIndex, endIndex);

    return {
      currentSurahs,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      startIndex,
      endIndex: Math.min(endIndex, filteredAndSorted.length),
    };
  }, [filteredAndSorted, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sortOptions = useMemo((): FilterOption[] => [
    { value: "asc", label: "من الأولى إلى الأخيرة" },
    { value: "desc", label: "من الأخيرة إلى الأولى" },
  ], []);

  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value as SortOrder);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSortOrder("asc");
  }, []);

  // ✅ Optimized play/pause - immediate response
  const handlePlayPause = useCallback((e: React.MouseEvent, surah: Surah) => {
    e.stopPropagation();
    onPlayPause(surah);
  }, [onPlayPause]);
  
  // ✅ Memoize onSurahSelect to prevent recreating on each render
  const handleSurahSelect = useCallback((surah: Surah) => {
    onSurahSelect(surah);
  }, [onSurahSelect]);

  return (
    <div className="mb-6 sm:mb-8 animate-fadeIn">
      {/* Search Bar - بروز عالي */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mb-4 border-2 border-emerald-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-2.5">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">ابحث عن السورة</h3>
        </div>
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="اكتب اسم السورة أو رقمها... (مثال: الفاتحة، البقرة، 1)"
          size="lg"
        />
      </div>

      {/* Filter Container */}
      <FilterContainer
        title="خيارات الترتيب والعرض"
        resultsCount={filteredAndSorted.length}
        resultsLabel="سورة"
        onClear={handleClearFilters}
        showClearButton={searchTerm !== "" || sortOrder !== "asc"}
        variant="gradient"
      >
        <div className="space-y-3 sm:space-y-4">
          {/* ترتيب السور */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <FilterSelect
              label="ترتيب السور"
              value={sortOrder}
              options={sortOptions}
              onChange={handleSortChange}
              showAllOption={false}
            />
          </div>
          
          {/* رسالة توضيحية محسّنة */}
          <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-2 shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-bold text-blue-900 mb-1">كيف تستخدم الصفحة؟</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    <span>اضغط على السورة لعرض نص الآيات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    <span>اضغط على زر التشغيل لسماع السورة كاملة</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </FilterContainer>

      {/* Surahs List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-emerald-100">
        {/* Header with pagination info */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            السور ({filteredAndSorted.length})
          </h3>
          {paginationData.totalPages > 1 && (
            <div className="text-sm text-gray-600">
              صفحة {currentPage} من {paginationData.totalPages}
            </div>
          )}
        </div>

        {loading && surahs.length === 0 ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : filteredAndSorted.length === 0 ? (
          <EmptyState
            illustration="search"
            title="لم يتم العثور على سورة"
            description="جرب البحث باسم آخر أو رقم السورة"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {paginationData.currentSurahs.map((surah) => {
                // ✅ Pre-compute booleans to avoid inline calculations
                const isSelected = selectedSurah?.number === surah.number;
                const isCurrentlyPlaying = isPlaying && isSelected;
                
                return (
                  <SurahCard
                    key={surah.number}
                    surah={surah}
                    isSelected={isSelected}
                    isPlaying={isCurrentlyPlaying}
                    onSelect={handleSurahSelect}
                    onPlayPause={(e) => handlePlayPause(e, surah)}
                  />
                );
              })}
            </div>

            {/* Pagination Controls */}
            {paginationData.totalPages > 1 && (
              <div className="border-t border-emerald-200 pt-6">
                <ResponsivePagination
                  currentPage={currentPage}
                  totalPages={paginationData.totalPages}
                  totalItems={filteredAndSorted.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageClick}
                  itemName="سورة"
                  showQuickJump={true}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ✅ Memoize component to prevent unnecessary re-renders
export default memo(SurahList);
