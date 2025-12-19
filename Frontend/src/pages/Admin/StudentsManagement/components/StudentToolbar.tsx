// ============================================================================
// StudentToolbar - شريط الأدوات للبحث والفلترة
// ============================================================================

import React, { memo, useCallback } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { LayoutGrid, List } from 'lucide-react';
import StudentsFilters from './StudentsFilters';
import type { ViewMode, GroupsFilter } from '../types';

interface StudentToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  groupsFilter: GroupsFilter;
  setGroupsFilter: (filter: GroupsFilter) => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

const VIEW_MODE_CONFIG = {
  table: {
    icon: List,
    label: 'عرض الجدول',
    position: 'right-1.5',
  },
  grid: {
    icon: LayoutGrid,
    label: 'عرض البطاقات',
    position: 'left-1.5',
  },
} as const;

// ============================================================================
// Sub-Components
// ============================================================================

const SearchInput = memo(
  ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div className="relative">
      <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="بحث (الاسم الثلاثي، رقم الهوية، المعلم، الحلقة...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
      />
    </div>
  )
);
SearchInput.displayName = 'SearchInput';

const FilterButton = memo(
  ({ onClick, isActive, count }: { onClick: () => void; isActive: boolean; count: number }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-all ${
        isActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-label="تبديل الفلاتر"
      title="تبديل الفلاتر"
    >
      <FaFilter className="w-4 h-4" />
      {count > 0 && (
        <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
          {count}
        </span>
      )}
      فلاتر
    </button>
  )
);
FilterButton.displayName = 'FilterButton';

const ViewModeToggle = memo(
  ({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) => {
    const handleClick = useCallback((newMode: ViewMode) => onChange(newMode), [onChange]);

    return (
      <div
        className="relative flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 shadow-inner border border-gray-200"
        dir="rtl"
      >
        <div
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-lg shadow-lg transition-all duration-300 ease-out ${
            VIEW_MODE_CONFIG[mode].position
          }`}
        />

        {(['table', 'grid'] as const).map((viewMode) => {
          const config = VIEW_MODE_CONFIG[viewMode];
          const Icon = config.icon;
          const isActive = mode === viewMode;

          return (
            <button
              key={viewMode}
              onClick={() => handleClick(viewMode)}
              className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isActive ? 'text-white shadow-md transform scale-105' : 'text-gray-600 hover:text-gray-900'
              }`}
              title={config.label}
              aria-label={`التبديل إلى ${config.label}`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className="hidden sm:inline whitespace-nowrap">
                {viewMode === 'table' ? 'جدول' : 'كاردات'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);
ViewModeToggle.displayName = 'ViewModeToggle';

// ============================================================================
// Main Component
// ============================================================================

export const StudentToolbar: React.FC<StudentToolbarProps> = memo((props) => {
  const {
    searchTerm,
    onSearchChange,
    showFilters,
    onToggleFilters,
    setShowFilters,
    activeFiltersCount,
    viewMode,
    onViewModeChange,
    selectedGender,
    setSelectedGender,
    groupsFilter,
    setGroupsFilter,
    ageRange,
    setAgeRange,
    onResetFilters,
  } = props;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={searchTerm} onChange={onSearchChange} />
        </div>

        <div className="flex gap-2">
          <FilterButton onClick={onToggleFilters} isActive={showFilters || activeFiltersCount > 0} count={activeFiltersCount} />
          <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      <StudentsFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        groupsFilter={groupsFilter}
        setGroupsFilter={setGroupsFilter}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      />
    </div>
  );
});
StudentToolbar.displayName = 'StudentToolbar';
