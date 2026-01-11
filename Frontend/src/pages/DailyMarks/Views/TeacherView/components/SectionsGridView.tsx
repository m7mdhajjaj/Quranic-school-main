import { Card, Button } from '@/components/UI';
import { Users, BookOpen, ArrowLeft, Plus, Trash2, Filter } from 'lucide-react';
import { SearchInput } from '@/components/Filters';
import { DateRangePicker } from '@/components/UI/DateRangePicker';
import SectionStatusFilter from '../../../components/SectionStatusFilter';
import type { MarkStatus } from '../../../components/SectionStatusBadge';
import type { Section } from '../../../types/types';
import { SectionItem } from './SectionItem';
import { AiRepairButton } from '../../../components/AiRepairButton';

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
}

/**
 * عرض Grid للمقاطع مع الفلاتر
 */
export const SectionsGridView = ({
  selectedGroup,
  sections,
  selectedStatus,
  statusCounts,
  filteredSectionsByStatus,

  searchQuery,
  onGroupSelect,
  onAddSection,
  onBulkDelete,
  onEditSection,
  onDeleteSection,
  onSectionSelect,
  onStatusChange,

  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: SectionsGridViewProps) => {

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

      {/* Header with Section Name and Action Buttons */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 shadow-lg sticky top-4 z-[100]">
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Section Name */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedGroup}
                </h2>
                <p className="text-sm text-gray-600 mt-1">حلقة الدراسة</p>
              </div>
            </div>

            {/* Date Range & Search */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              {/* Date Range Picker */}
              <div className="w-full md:w-auto">
                <DateRangePicker
                  startDate={startDate || null}
                  endDate={endDate || null}
                  onChange={(start, end) => {
                    if (onStartDateChange) onStartDateChange(start);
                    if (onEndDateChange) onEndDateChange(end);
                  }}
                  className="w-full md:w-auto"
                />
              </div>

              {/* Search Input */}
              <div className="w-full md:w-64">
                <SearchInput
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="بحث..."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Filter & Action Buttons */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters (Right side in RTL) */}
        <div>
          {sections.length > 0 && (
            <SectionStatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={onStatusChange}
              counts={statusCounts}
            />
          )}
        </div>

        {/* Action Buttons (Left side in RTL) */}
        <div className="flex flex-wrap items-center gap-3" dir="rtl">
          {/* إضافة مقطع */}
          {onAddSection && (
            <Button
              onClick={onAddSection}
              variant="primary"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all font-semibold w-[140px] h-[40px] flex items-center justify-between px-3"
              type="button"
              dir="rtl"
            >
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-xs opacity-90">إضافة</span>
                <span className="text-sm font-bold">مقطع جديد</span>
              </div>
              <Plus size={20} className="bg-white/20 rounded-full p-0.5" />
            </Button>
          )}

          {/* إصلاح التسلسل */}
          <AiRepairButton 
            selectedGroup={selectedGroup} 
            onSuccess={() => {
              if (onGroupSelect) onGroupSelect(selectedGroup);
            }}
          />

          {/* حذف مقاطع */}
          {onBulkDelete && (
            <Button
              onClick={onBulkDelete}
              variant="secondary"
              className="border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-[140px] h-[40px] flex items-center justify-between px-3"
              type="button"
              disabled={sections.length === 0}
              dir="rtl"
            >
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-xs opacity-80">حذف</span>
                <span className="text-sm font-bold">المقاطع</span>
              </div>
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Sections Cards */}
      {        
       sections.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            لا توجد مقاطع في هذه الحلقة
          </p>
        </Card>
      ) : filteredSectionsByStatus.length === 0 ? (
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
    </div>
  );
};
