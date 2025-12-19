// ============================================================================
// StudentsFilters - فلاتر البحث عن الطلاب
// ============================================================================

import React, { memo, useMemo, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { GroupsFilter } from '../types';

interface StudentsFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  groupsFilter: GroupsFilter;
  setGroupsFilter: (filter: GroupsFilter) => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const GENDER_OPTIONS = [
  { value: 'all', label: 'الكل', color: 'bg-slate-600', hoverColor: 'hover:bg-gray-100' },
  { value: 'ذكر', label: 'ذكر', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-50' },
  { value: 'أنثى', label: 'أنثى', color: 'bg-pink-600', hoverColor: 'hover:bg-pink-50' },
] as const;

const GROUPS_OPTIONS = [
  { value: 'all', label: 'الكل', color: 'bg-slate-600', hoverColor: 'hover:bg-gray-100' },
  { value: 'withGroups', label: 'لديهم حلقات', color: 'bg-emerald-600', hoverColor: 'hover:bg-emerald-50' },
  { value: 'withoutGroups', label: 'بلا حلقات', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-50' },
] as const;

const AGE_MARKERS = [0, 50, 100] as const;

// ============================================================================
// Sub-Components
// ============================================================================

const FilterButton = memo(
  ({
    value,
    currentValue,
    label,
    color,
    hoverColor,
    onClick,
    title,
  }: {
    value: string;
    currentValue: string;
    label: string;
    color: string;
    hoverColor: string;
    onClick: () => void;
    title?: string;
  }) => {
    const isActive = value === currentValue;

    return (
      <button
        onClick={onClick}
        title={title}
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
          isActive ? `${color} text-white shadow-sm` : `bg-gray-50 text-gray-700 ${hoverColor} border border-gray-200`
        }`}
      >
        {label}
      </button>
    );
  }
);
FilterButton.displayName = 'FilterButton';

const AgeRangeFilter = memo(
  ({ range, onChange }: { range: [number, number]; onChange: (range: [number, number]) => void }) => {
    const handleChange = useCallback((value: number) => onChange([range[0], value]), [range, onChange]);

    return (
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-gray-700">
          العمر: {range[0]} - {range[1]} سنة
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={range[1]}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            aria-label="الحد الأقصى للعمر"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            {AGE_MARKERS.map((marker) => (
              <span key={marker}>{marker}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
AgeRangeFilter.displayName = 'AgeRangeFilter';

const ActiveFiltersList = memo(
  ({
    selectedGender,
    groupsFilter,
    ageRange,
    searchTerm,
    activeCount,
  }: {
    selectedGender: string;
    groupsFilter: GroupsFilter;
    ageRange: [number, number];
    searchTerm: string;
    activeCount: number;
  }) => {
    const filters = useMemo(
      () => [
        selectedGender !== 'all' && {
          label: `الجنس: ${selectedGender}`,
          className: selectedGender === 'ذكر' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200',
        },
        groupsFilter !== 'all' && {
          label: `الحلقات: ${groupsFilter === 'withGroups' ? 'لديهم حلقات' : 'بلا حلقات'}`,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        (ageRange[0] !== 0 || ageRange[1] !== 100) && {
          label: `العمر: ${ageRange[0]}-${ageRange[1]}`,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        },
        searchTerm && {
          label: `البحث: "${searchTerm}"`,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        },
      ].filter(Boolean),
      [selectedGender, groupsFilter, ageRange, searchTerm]
    );

    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-600 font-medium">الفلاتر النشطة:</span>
        {activeCount === 0 ? (
          <span className="text-xs text-gray-400">لا توجد فلاتر مطبقة</span>
        ) : (
          filters.map((filter, index) =>
            filter ? (
              <span key={index} className={`px-2.5 py-1 rounded-md text-xs font-medium border ${filter.className}`}>
                {filter.label}
              </span>
            ) : null
          )
        )}
      </div>
    );
  }
);
ActiveFiltersList.displayName = 'ActiveFiltersList';

// ============================================================================
// Main Component
// ============================================================================

const StudentsFilters: React.FC<StudentsFiltersProps> = memo((props) => {
  const {
    showFilters,
    setShowFilters,
    searchTerm,
    selectedGender,
    setSelectedGender,
    groupsFilter,
    setGroupsFilter,
    ageRange,
    setAgeRange,
    activeFiltersCount,
    onResetFilters,
  } = props;

  if (!showFilters) return null;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative mt-4">
      <button
        onClick={() => setShowFilters(false)}
        className="absolute top-3 left-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="إغلاق الفلاتر"
        aria-label="إغلاق الفلاتر"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Gender Filter */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-700">تصفية حسب الجنس</label>
          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                value={option.value}
                currentValue={selectedGender}
                label={option.label}
                color={option.color}
                hoverColor={option.hoverColor}
                onClick={() => setSelectedGender(option.value)}
                title={
                  option.value === 'all'
                    ? 'عرض جميع الطلاب'
                    : `عرض ${option.value === 'ذكر' ? 'الطلاب الذكور' : 'الطالبات الإناث'} فقط`
                }
              />
            ))}
          </div>
        </div>

        {/* Groups Filter */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-700">تصفية حسب الحلقات</label>
          <div className="grid grid-cols-1 gap-2">
            {GROUPS_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                value={option.value}
                currentValue={groupsFilter}
                label={option.label}
                color={option.color}
                hoverColor={option.hoverColor}
                onClick={() => setGroupsFilter(option.value as GroupsFilter)}
                title={
                  option.value === 'all'
                    ? 'عرض جميع الطلاب'
                    : option.value === 'withGroups'
                      ? 'عرض الطلاب الذين لديهم حلقات'
                      : 'عرض الطلاب الذين لا ينتمون لأي حلقة'
                }
              />
            ))}
          </div>
        </div>

        {/* Age Range Filter */}
        <AgeRangeFilter range={ageRange} onChange={setAgeRange} />
      </div>

      {/* Filter Summary & Reset */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ActiveFiltersList
            selectedGender={selectedGender}
            groupsFilter={groupsFilter}
            ageRange={ageRange}
            searchTerm={searchTerm}
            activeCount={activeFiltersCount}
          />

          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1.5 text-xs font-medium border border-red-200 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
              إعادة تعيين
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
StudentsFilters.displayName = 'StudentsFilters';

export default StudentsFilters;
