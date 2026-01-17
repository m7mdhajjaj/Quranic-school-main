import { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { TeacherViewProps } from '../../types/types';
import type { MarkStatus } from '../../components/SectionStatusBadge';
import { useSearchParams } from 'react-router-dom';

// Import custom hooks
import {
  useTeacherViewData,
  useBulkMarkDelete,
} from './hooks';

// Import components
import {
  SectionDetailsView,
  SectionsGridView,
  StudentsMarksTable,
} from './components';

/**
 * Teacher view component - Shows groups cards first, then sections table when group is selected
 */
const TeacherViewComponent = ({
  students, // ✅ Add students from props
  selectedGroup,
  teacherGroups,
  sections,
  marks: _marks,
  loadingMarks,
  onGroupSelect,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onBulkDelete,
  onAddMark,
  onUpdateMark,
  onDeleteMark,
  onMarkChange,
  onRefreshData, // ✅ Destructure
  selectedMonth,
  selectedYear,
  selectedDay,
  onMonthChange,
  onYearChange,
  onDayChange,
  searchQuery,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedFilterMode,
  onFilterModeChange,
}: TeacherViewProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for filter visibility
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State for status filter
  const [selectedStatus, setSelectedStatus] = useState<MarkStatus | null>(null);

  // Reset filter visibility when group changes
  useEffect(() => {
    setIsFilterOpen(false);
    setSelectedStatus(null);
  }, [selectedGroup]);

  // Filter sections by status
  const filteredSectionsByStatus = useMemo(() => {
    if (!selectedStatus) return sections;
    return sections.filter((section) => section.marksStatus === selectedStatus);
  }, [sections, selectedStatus]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      all: sections.length,
      completed: sections.filter((s) => s.marksStatus === 'completed').length,
      in_progress: sections.filter((s) => s.marksStatus === 'in_progress')
        .length,
      not_started: sections.filter(
        (s) => s.marksStatus === 'not_started' || !s.marksStatus
      ).length,
    };
  }, [sections]);

  // Groups stats are now calculated in DailyMarksPage

  // Use merged custom hook for section selection, data fetching, and student filtering
  // ✅ Pass students from parent to avoid API calls for teacherAssistant
  const {
    selectedSection,
    loadingSectionData,
    handleSectionSelect,
    refetchSectionData,
    clearSectionSelection,
    studentSearchQuery,
    setStudentSearchQuery,
    tableData,
  } = useTeacherViewData(selectedGroup, students);

  const sectionIdParam = searchParams.get('sectionId');

  const setSectionIdInUrl = useMemo(() => (sectionId: string | null, replace = false) => {
    setSearchParams(prev => {
       const next = new URLSearchParams(prev);
       if (sectionId) next.set('sectionId', sectionId);
       else next.delete('sectionId');
       return next;
    }, { replace });
  }, [setSearchParams]);

  // Sync section selection with URL (back/forward)
  useEffect(() => {
    if (!selectedGroup || selectedGroup === 'all') {
      // clear section when no group selected
      if (sectionIdParam) setSectionIdInUrl(null, true);
      if (selectedSection) clearSectionSelection();
      return;
    }

    // If URL has sectionId but local doesn't, auto-select
    if (sectionIdParam && !selectedSection) {
      const found = sections.find((s) => s._id === sectionIdParam);
      if (found) {
        handleSectionSelect(found);
      }
      return;
    }

    // If URL removed sectionId, clear local selection (browser back)
    if (!sectionIdParam && selectedSection) {
      clearSectionSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, sectionIdParam, sections]);

  // Use custom hook for bulk mark delete
  const {
    selectedMarkIds,
    isDeleting,
    toggleMarkSelection,
    toggleSelectAll,
    clearSelection,
    areAllSelected,
    handleBulkDelete,
  } = useBulkMarkDelete();

  // Track if a mark operation is in progress to avoid circular updates
  const isUpdatingRef = useRef(false);

  // Refetch section marks when main marks change
  useEffect(() => {
    if (!selectedSection || isUpdatingRef.current) return;

    // Refetch whenever marks change (add, update, delete)
    // The parent component updates the marks reference on any change
    refetchSectionData();
  }, [_marks, selectedSection, refetchSectionData]);

  // Combined callback for mark changes
  const handleMarkChange = async (): Promise<void> => {
    isUpdatingRef.current = true;
    try {
      await refetchSectionData();
      if (onMarkChange) {
        await onMarkChange();
      }
    } finally {
      // Reset flag after a short delay to allow state to settle
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  };

  // Handle bulk delete with parent callback
  const handleBulkDeleteMarks = async () => {
    if (!onDeleteMark) return;
    const deleteMarkAsync = async (markId: string) => {
      await Promise.resolve(onDeleteMark(markId));
    };
    await handleBulkDelete(deleteMarkAsync, handleMarkChange);
  };

  // Get all mark IDs for select all
  const allMarkIds = useMemo(() => {
    return tableData.filter((row) => row.mark?._id).map((row) => row.mark!._id);
  }, [tableData]);

  const handleSectionSelectWrapper = useCallback((section: any) => {
    setSectionIdInUrl(section._id, false);
    handleSectionSelect(section);
  }, [setSectionIdInUrl, handleSectionSelect]);


  // GroupsGridView is now shown in DailyMarksPage, so we don't render it here
  // If no group selected, return null (groups will be shown in parent)
  if (!selectedGroup || selectedGroup === 'all') {
    return null;
  }

  // If section selected, show students table
  if (selectedSection) {
    return (
      <SectionDetailsView
        section={selectedSection}
        selectedGroup={selectedGroup}
        studentSearchQuery={studentSearchQuery}
        onStudentSearchChange={setStudentSearchQuery}
        onBack={() => setSectionIdInUrl(null, false)}
      >
        <StudentsMarksTable
          tableData={tableData}
          section={selectedSection}
          selectedMarkIds={selectedMarkIds}
          isDeleting={isDeleting}
          loading={loadingSectionData}
          onAddMark={onAddMark}
          onUpdateMark={onUpdateMark}
          onDeleteMark={async (markId) => {
            if (onDeleteMark) {
              await onDeleteMark(markId);
              await refetchSectionData();
            }
          }}
          onToggleMarkSelection={toggleMarkSelection}
          onToggleSelectAll={() => toggleSelectAll(allMarkIds)}
          onBulkDelete={handleBulkDeleteMarks}
          onClearSelection={clearSelection}
          areAllSelected={areAllSelected(allMarkIds)}
        />
      </SectionDetailsView>
    );
  }

  // If group selected, show sections cards with filter
  return (
    <SectionsGridView
      selectedGroup={selectedGroup}
      sections={sections}
      loadingMarks={loadingMarks}
      isFilterOpen={isFilterOpen}
      selectedStatus={selectedStatus}
      statusCounts={statusCounts}
      filteredSectionsByStatus={filteredSectionsByStatus}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
      selectedDay={selectedDay ?? null}
      searchQuery={searchQuery || ''}
      onGroupSelect={onGroupSelect || (() => {})}
      onAddSection={onAddSection}
      onBulkDelete={onBulkDelete}
      onEditSection={onEditSection}
      onDeleteSection={onDeleteSection}
      onRefreshData={onRefreshData}
      onSectionSelect={handleSectionSelectWrapper}
      onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
      onStatusChange={setSelectedStatus}
      onMonthChange={(month) => month !== null && onMonthChange(month)}
      onYearChange={(year) => year !== null && onYearChange(year)}
      onDayChange={onDayChange || (() => {})}
      onSearchChange={onSearchChange || (() => {})}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={onStartDateChange}
      onEndDateChange={onEndDateChange}
      selectedFilterMode={selectedFilterMode}
      onFilterModeChange={onFilterModeChange}
    />
  );
};

export const TeacherView = TeacherViewComponent;
