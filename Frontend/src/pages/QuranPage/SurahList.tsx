import { useState, useMemo, useCallback } from "react";
import { EmptyState } from "@/components/UI";
import {
  SearchInput,
  FilterSelect,
  FilterContainer,
} from "@/components/Filters";
import type { FilterOption } from "@/components/Filters";
import SurahCard from "./SurahCard";
import { filterSurahs } from "./utils/filterSurahs";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { Surah, SortOrder } from "./types/quran.types";

interface SurahListProps {
  surahs: Surah[];
  onSelectSurah: (surahNumber: number) => void;
}

const SurahList = ({ surahs, onSelectSurah }: SurahListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterSurahs(surahs, debouncedSearch);
    return sortOrder === "asc" ? filtered : [...filtered].reverse();
  }, [surahs, debouncedSearch, sortOrder]);

  const sortOptions = useMemo(
    (): FilterOption[] => [
      { value: "asc", label: "من الأولى إلى الأخيرة" },
      { value: "desc", label: "من الأخيرة إلى الأولى" },
    ],
    []
  );

  // ✅ استخدام useCallback لتحسين الأداء
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

  return (
    <div className="max-w-7xl mx-auto animate-slideUp">
      {/* ✨ Enhanced Filter & Search Section */}
      <FilterContainer
        title="البحث والفلترة"
        resultsCount={filteredAndSorted.length}
        resultsLabel="سورة"
        onClear={handleClearFilters}
        showClearButton={searchTerm !== "" || sortOrder !== "asc"}
        variant="gradient">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ابحث عن سورة بالاسم أو الرقم..."
            size="md"
          />

          <div className="w-full lg:w-72">
            <FilterSelect
              label="ترتيب السور"
              value={sortOrder}
              options={sortOptions}
              onChange={handleSortChange}
              showAllOption={false}
            />
          </div>
        </div>
      </FilterContainer>

      {/* ✨ Enhanced Surah Grid with better scrolling */}
      <div className="max-h-[65vh] overflow-y-auto px-2 scrollbar-thin rounded-2xl contain-layout">
        {filteredAndSorted.length === 0 ? (
          <EmptyState
            illustration="search"
            title="لم يتم العثور على سورة"
            description="جرب البحث باسم آخر أو رقم السورة"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
            {filteredAndSorted.map((surah) => {
              // ✅ تحسين الأداء - استخدام key مع useCallback
              const handleClick = () => onSelectSurah(surah.number);

              return (
                <SurahCard
                  key={surah.number}
                  surah={surah}
                  onClick={handleClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahList;
