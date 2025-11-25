import React, { useState, useMemo, useCallback, memo } from "react";
import SurahCard from "./SurahCard";
import { SearchInput, FilterSelect, FilterContainer } from "@/components/Filters";
import type { FilterOption } from "@/components/Filters";
import { EmptyState } from "@/components/UI";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import type { SurahListProps, SortOrder } from "../types/surahList";

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
  const [revelationType, setRevelationType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 سورة في كل صفحة

  // Filter and sort surahs
  const filteredAndSorted = useMemo(() => {
    let filtered = surahs;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((surah) => {
        const nameMatch = surah.name.toLowerCase().includes(searchLower);
        const englishMatch = surah.englishName.toLowerCase().includes(searchLower);
        const numberMatch = surah.number.toString().includes(searchLower);
        return nameMatch || englishMatch || numberMatch;
      });
    }

    // Apply revelation type filter
    if (revelationType !== "all") {
      filtered = filtered.filter((surah) => 
        surah.revelationType === revelationType
      );
    }

    // Apply sorting
    return sortOrder === "asc" ? filtered : [...filtered].reverse();
  }, [surahs, searchTerm, sortOrder, revelationType]);

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
  }, [searchTerm, sortOrder, revelationType]);

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sortOptions = useMemo((): FilterOption[] => [
    { value: "asc", label: "من الأولى إلى الأخيرة" },
    { value: "desc", label: "من الأخيرة إلى الأولى" },
  ], []);

  const revelationOptions = useMemo((): FilterOption[] => [
    { value: "all", label: "جميع السور" },
    { value: "Meccan", label: "السور المكية" },
    { value: "Medinan", label: "السور المدنية" },
  ], []);

  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value as SortOrder);
  }, []);

  const handleRevelationTypeChange = useCallback((value: string) => {
    setRevelationType(value);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSortOrder("asc");
    setRevelationType("all");
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
      {/* Filter Container - البحث والفلاتر */}
      <FilterContainer
        title="البحث والفلترة"
        resultsCount={filteredAndSorted.length}
        resultsLabel="سورة"
        onClear={handleClearFilters}
        showClearButton={searchTerm !== "" || sortOrder !== "asc" || revelationType !== "all"}
        variant="gradient"
      >
        <div className="space-y-4">
          {/* البحث عن السورة - سطر منفصل */}
          <div>
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="ابحث عن سورة بالاسم أو الرقم..."
              size="lg"
            />
          </div>

          {/* الفلاتر - سطر منفصل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* ترتيب السور */}
            <FilterSelect
              label="ترتيب السور"
              value={sortOrder}
              options={sortOptions}
              onChange={handleSortChange}
              showAllOption={false}
            />

            {/* نوع السورة */}
            <FilterSelect
              label="نوع السورة"
              value={revelationType}
              options={revelationOptions}
              onChange={handleRevelationTypeChange}
              showAllOption={false}
            />
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
