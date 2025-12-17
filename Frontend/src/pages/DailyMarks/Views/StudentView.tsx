import { memo } from 'react';
import type { StudentViewProps } from '../types/types';
import { SectionsTable } from '../components/SectionsTable';
import { AveragesBar } from '../components/AveragesBar';
import { Card } from '@/components/UI';

/**
 * Header component for Student View
 */
const StudentHeader = ({ sectionsCount }: { sectionsCount: number }) => (
  <div className="relative px-6 py-5">
    {/* subtle highlight on top of the card header gradient */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
    <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

    <div className="relative flex items-center justify-between gap-4">
      {/* Right side: title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 bg-white/15 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/20">
          <span className="text-white text-2xl">📋</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold text-white truncate">
            علاماتي
          </h2>
          <p className="text-white/90 text-sm mt-1 truncate">
            مراجعة أدائك في المقاطع المختلفة
          </p>
        </div>
      </div>

      {/* Left side: count badge */}
      <div className="shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl shadow-lg border border-white/20">
        <span className="font-black text-lg tabular-nums">{sectionsCount}</span>
        <span className="text-sm opacity-95">مقطع</span>
      </div>
    </div>

    {/* bottom divider */}
    <div className="mt-5 h-px w-full bg-white/15" />
  </div>
);

/**
 * Student view component - single table layout with averages
 */
const StudentViewComponent = ({
  sections,
  marks,
  loadingMarks,
  averages,
  selectedMonth,
  selectedYear,
  studentId,
  onMonthChange,
  onYearChange,
}: StudentViewProps) => {
  return (
    <div className="grid grid-cols-1 gap-5 w-full">
      {/* Student Marks */}
      <Card className="relative overflow-hidden p-0 w-full border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 shadow-xl">
        {/* unified header gradient (same as StudentHeader theme) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700" />
        <StudentHeader sectionsCount={sections.length} />

        <div className="p-0 bg-gradient-to-br from-white/90 via-emerald-50/40 to-teal-50/30">
          {/* Averages Section for Student View - Above Table */}
          {sections.length > 0 && (
            <div className="px-6 pt-6 pb-6">
              <AveragesBar
                reviewAverage={averages.reviewAverage}
                memorizationAverage={averages.memorizationAverage}
                overallAverage={averages.overallAverage}
                totalMarks={averages.totalMarks}
              />
            </div>
          )}

          <SectionsTable
            sections={sections}
            marks={marks}
            loadingMarks={loadingMarks}
            isTeacher={false}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={onMonthChange}
            onYearChange={onYearChange}
            selectedGroup={''}
            studentId={studentId}
          />
        </div>
      </Card>
    </div>
  );
};

export const StudentView = memo(StudentViewComponent);
