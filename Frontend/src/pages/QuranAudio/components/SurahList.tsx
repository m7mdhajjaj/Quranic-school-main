import React, { useState, useMemo, useCallback, memo } from "react";
import SurahCard from "./SurahCard";
import { SearchInput, FilterSelect, FilterContainer } from "@/components/Filters";
import type { FilterOption } from "@/components/Filters";
import { EmptyState } from "@/components/UI";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { SurahListProps, SortOrder } from "../types/surahList";
import type { Surah } from "@/Api/quranAudioApi";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 12; // 12 سورة في العرض (3 صفوف × 4 أعمدة)

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

  // Carousel data
  const carouselData = useMemo(() => {
    const endIndex = Math.min(currentIndex + itemsPerView, filteredAndSorted.length);
    const visibleSurahs = filteredAndSorted.slice(currentIndex, endIndex);
    
    return {
      visibleSurahs,
      canGoNext: currentIndex + itemsPerView < filteredAndSorted.length,
      canGoPrev: currentIndex > 0,
      currentPosition: currentIndex + 1,
      totalCount: filteredAndSorted.length
    };
  }, [filteredAndSorted, currentIndex, itemsPerView]);

  // Reset to start when filters change
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm, sortOrder, revelationType]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + itemsPerView;
      // Make sure we don't go past the last page
      const maxIndex = Math.max(0, filteredAndSorted.length - itemsPerView);
      return Math.min(nextIndex, maxIndex);
    });
  }, [itemsPerView, filteredAndSorted.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - itemsPerView));
  }, [itemsPerView]);

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
        {/* Header with carousel navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            السور ({filteredAndSorted.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {carouselData.currentPosition} - {Math.min(carouselData.currentPosition + itemsPerView - 1, carouselData.totalCount)} من {carouselData.totalCount}
            </span>
          </div>
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
            <div className="relative px-12">
              {/* Previous Button */}
              {carouselData.canGoPrev && (
                <button
                  onClick={handlePrev}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-emerald-50 transition-all duration-200 hover:scale-110"
                  aria-label="السابق">
                  <ChevronRight className="w-6 h-6 text-emerald-600" />
                </button>
              )}

              {/* Surahs Grid - 3 rows x 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 auto-rows-fr">
                {carouselData.visibleSurahs.map((surah) => {
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

              {/* Next Button */}
              {carouselData.canGoNext && (
                <button
                  onClick={handleNext}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-emerald-50 transition-all duration-200 hover:scale-110"
                  aria-label="التالي">
                  <ChevronLeft className="w-6 h-6 text-emerald-600" />
                </button>
              )}
            </div>

            {/* Navigation Dots */}
            {filteredAndSorted.length > itemsPerView && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(filteredAndSorted.length / itemsPerView) }).map((_, index) => {
                  const startIndex = index * itemsPerView;
                  const endIndex = Math.min(startIndex + itemsPerView, filteredAndSorted.length);
                  // Check if currentIndex falls within this page range
                  const isActive = currentIndex >= startIndex && currentIndex < endIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(startIndex)}
                      className={`transition-all duration-200 ${
                        isActive 
                          ? 'w-8 h-2 bg-emerald-600' 
                          : 'w-2 h-2 bg-gray-300 hover:bg-emerald-400'
                      } rounded-full`}
                      aria-label={`المجموعة ${index + 1}`}
                    />
                  );
                })}
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
