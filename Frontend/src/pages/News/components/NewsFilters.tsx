import { useMemo } from 'react';
import { SearchInput, FilterSelect } from '@/components/Filters';
import type { FilterOption } from '@/components/Filters';
import type { NewsFiltersProps } from '../Types/types';
import { Plus } from 'lucide-react';

interface ExtendedNewsFiltersProps extends NewsFiltersProps {
  onAddNews?: () => void;
  isTeacherOrAdmin?: boolean;
}

const NewsFilters = ({
  searchTerm,
  sortOrder,
  filterType,
  onSearchChange,
  onSortChange,
  onFilterTypeChange,
  onClearFilters,
  filteredCount,
  totalCount,
  onAddNews,
  isTeacherOrAdmin,
}: ExtendedNewsFiltersProps) => {
  const sortOptions = useMemo(
    (): FilterOption[] => [
      { value: 'newest', label: 'الأحدث أولاً' },
      { value: 'oldest', label: 'الأقدم أولاً' },
    ],
    []
  );

  const filterOptions = useMemo(
    (): FilterOption[] => [
      { value: 'all', label: 'الكل' },
      { value: 'general', label: 'عام' },
      { value: 'group', label: 'طلاب المعلم' },
    ],
    []
  );

  // Don't show filters if there are no news items
  if (totalCount === 0) return null;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">البحث والفلترة</h3>
                <p className="text-white/80 text-sm">
                  {filteredCount === totalCount
                    ? `${totalCount} خبر متاح`
                    : `${filteredCount} من ${totalCount} خبر`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(searchTerm !== '' || sortOrder !== 'newest' || filterType !== 'all') && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  مسح الفلاتر
                </button>
              )}
              
              {isTeacherOrAdmin && onAddNews && (
                <button
                  onClick={onAddNews}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 font-bold rounded-lg shadow-md hover:bg-emerald-50 transition-all duration-200 hover:scale-105"
                >
                  <Plus size={20} />
                  <span>إضافة خبر</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_200px_200px] gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البحث في الأخبار
              </label>
              <SearchInput
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="ابحث عن خبر..."
                size="md"
              />
            </div>

            {/* Filter Type Select */}
            <div>
              <FilterSelect
                label="نوع الخبر"
                value={filterType}
                options={filterOptions}
                onChange={(val) => onFilterTypeChange(val as 'all' | 'general' | 'group')}
                showAllOption={false}
              />
            </div>

            {/* Sort Select */}
            <div>
              <FilterSelect
                label="ترتيب حسب"
                value={sortOrder}
                options={sortOptions}
                onChange={onSortChange}
                showAllOption={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsFilters;
