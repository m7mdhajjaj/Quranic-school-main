import { memo } from 'react';
import type { StudentViewProps } from '../types/types';
import { SectionsTable } from '../components/SectionsTable';
import { AveragesBar } from '../components/AveragesBar';
import { Card } from '@/components/UI';
import { AveragesBarSkeleton } from '../../../components/skeletons/DailyMarksSkeletons';

/**
 * Header component for Student View
 */
const StudentHeader = ({ sectionsCount, totalMarks }: { sectionsCount: number; totalMarks: number }) => (
  <div className="relative px-6 py-5 text-white">
    {/* glow accents */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
    <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

    <div className="relative flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 bg-white/15 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/20">
          <span className="text-white text-2xl">📋</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold truncate">علاماتي</h2>
          <p className="text-white/90 text-sm mt-1 truncate">مراجعة أدائك في المقاطع المختلفة</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl shadow-lg border border-white/20">
          <span className="font-black text-lg tabular-nums">{sectionsCount}</span>
          <span className="text-sm opacity-95">مقطع</span>
        </div>
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl shadow-lg border border-white/20">
          <span className="font-black text-lg tabular-nums">{totalMarks}</span>
          <span className="text-sm opacity-95">إجمالي العلامات</span>
        </div>
      </div>
    </div>

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-cyan-50/40 py-8 px-4 md:px-8">
      <div className="w-full space-y-6">
        <Card className="relative overflow-hidden p-0 w-full border border-emerald-100 bg-white shadow-2xl shadow-emerald-100/60">
          {/* header band */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700" />
          <StudentHeader sectionsCount={sections.length} totalMarks={averages.totalMarks} />

          <div className="p-0 bg-gradient-to-br from-white via-emerald-50/35 to-teal-50/20">
            {/* Averages Section */}
            {loadingMarks ? (
              <div className="px-6 pt-6 pb-4">
                <AveragesBarSkeleton />
              </div>
            ) : sections.length > 0 && (
              <div className="px-6 pt-6 pb-4">
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
    </div>
  );
};

export const StudentView = memo(StudentViewComponent);
