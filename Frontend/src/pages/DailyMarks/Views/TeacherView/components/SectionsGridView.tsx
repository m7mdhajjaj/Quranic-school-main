import { Card, Button } from '@/components/UI';
import { Users, BookOpen, ArrowLeft, Plus, Trash2, Filter } from 'lucide-react';
import { SearchInput } from '@/components/Filters';
import { DateRangePicker } from '@/components/UI/DateRangePicker';
import SectionStatusFilter from '../../../components/SectionStatusFilter';
import { PeriodFilterToggle } from '../../../components/PeriodFilterToggle';
import type { MarkStatus } from '../../../components/SectionStatusBadge';
import type { Section } from '../../../types/types';
import { SectionItem } from './SectionItem';
import { AiRepairButton } from '../../../components/AiRepairButton';
import { CompletedSurahsModal } from '../../../components/CompletedSurahsModal';
import { useState } from 'react';

interface SectionsGridViewProps {
  selectedGroup: string;
  sections: Section[];
  loadingMarks: boolean;
  isFilterOpen: boolean;
  selectedStatus: MarkStatus | null;
  statusCounts: {
    all: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
  filteredSectionsByStatus: Section[];
  selectedMonth: number | null;
  selectedYear: number | null;
  selectedDay: number | null;
  searchQuery: string;
  onGroupSelect: (group: string) => void;
  onAddSection?: () => void;
  onBulkDelete?: () => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onRefreshData?: () => void;
  onSectionSelect: (section: Section) => void;
  onFilterToggle: () => void;
  onStatusChange: (status: MarkStatus | null) => void;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
  onDayChange: (day: number | null) => void;
  onSearchChange: (query: string) => void;
  startDate?: string | null;
  endDate?: string | null;
  onStartDateChange?: (date: string | null) => void;
  onEndDateChange?: (date: string | null) => void;
  selectedFilterMode?: 'week' | 'all';
  onFilterModeChange?: (mode: 'week' | 'all') => void;
}

/**
 * عرض Grid للمقاطع مع الفلاتر
 */
export const SectionsGridView = ({
  selectedGroup,
  sections,
  loadingMarks, // Added loadingMarks here
  selectedStatus,
  statusCounts,
  filteredSectionsByStatus,

  searchQuery,
  onGroupSelect,
  onAddSection,
  onBulkDelete,
  onEditSection,
  onDeleteSection,
  onRefreshData,
  onSectionSelect,
  onStatusChange,

  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedFilterMode,
  onFilterModeChange,
}: SectionsGridViewProps) => {
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => onGroupSelect('')}
        className="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
        type="button"
      >
        <ArrowLeft size={20} />
        <span>العودة إلى الحلقات</span>
      </button>

      {/* Header with Section Name */}
      <Card className="mb-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 shadow-sm">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Section Info */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm shrink-0">
                <Users className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedGroup}</h2>
                <p className="text-xs text-gray-500">حلقة الدراسة</p>
              </div>
              {sections.length > 0 && (
                <div className="mr-4">
                  <PeriodFilterToggle
                    selectedMode={selectedFilterMode}
                    onModeChange={onFilterModeChange}
                  />
                </div>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <DateRangePicker
                startDate={startDate || null}
                endDate={endDate || null}
                onChange={(start, end) => {
                  if (onStartDateChange) onStartDateChange(start);
                  if (onEndDateChange) onEndDateChange(end);
                }}
                className="w-full sm:w-auto"
              />
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="بحث..."
                className="w-full sm:w-56"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons Row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter */}
        {sections.length > 0 && (
          <div className="overflow-x-auto">
            <SectionStatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={onStatusChange}
              counts={statusCounts}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onAddSection && (
            <Button
              onClick={onAddSection}
              variant="primary"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow transition-all font-medium h-9 px-4 text-sm"
              type="button"
            >
              <Plus size={16} className="ml-1.5" />
              إضافة مقطع
            </Button>
          )}
          
          <Button
            onClick={() => setShowCompletedModal(true)}
            variant="secondary"
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium h-9 px-3 text-sm"
            type="button"
          >
            <BookOpen size={16} className="ml-1.5" />
            السور المكتملة
          </Button>

          <AiRepairButton 
            selectedGroup={selectedGroup} 
            onSuccess={() => {
              if (onRefreshData) onRefreshData();
              else if (onGroupSelect) onGroupSelect(selectedGroup);
            }}
            className="h-9"
          />

          {onBulkDelete && (
            <Button
              onClick={onBulkDelete}
              variant="secondary"
              className="border-red-200 bg-white text-red-600 hover:bg-red-50 font-medium h-9 px-3 text-sm disabled:opacity-50"
              type="button"
              disabled={sections.length === 0}
            >
              <Trash2 size={16} className="ml-1.5" />
              حذف المقاطع
            </Button>
          )}
        </div>
      </div>

      {/* Sections Cards */}
      {sections.length === 0 && !loadingMarks ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            لا توجد مقاطع في هذه الحلقة
          </p>
        </Card>
      ) : filteredSectionsByStatus.length === 0 && !loadingMarks ? (
        <Card className="p-12 text-center">
          <Filter className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            لا توجد مقاطع بالحالة المحددة
          </p>
          <button
            onClick={() => onStatusChange(null)}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            type="button"
          >
            إظهار جميع المقاطع
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSectionsByStatus.map((section) => (
            <SectionItem
              key={section._id}
              section={section}
              onSectionSelect={onSectionSelect}
              onEditSection={onEditSection}
              onDeleteSection={onDeleteSection}
            />
          ))}
        </div>
      )}

      {/* مودال السور المكتملة */}
      {showCompletedModal && (
        <CompletedSurahsModal
          isOpen={showCompletedModal}
          onClose={() => setShowCompletedModal(false)}
          selectedGroup={selectedGroup}
        />
      )}
    </div>
  );
};
