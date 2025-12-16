import { memo } from "react";
import type { StudentViewProps } from "../types/types";
import { SectionsTable } from "../components/SectionsTable";
import { AveragesBar } from "../components/AveragesBar";
import { Card } from "@/components/UI";

/**
 * Header component for Student View
 */
const StudentHeader = ({ sectionsCount }: { sectionsCount: number }) => (
  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-6 px-6 shadow-xl">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
          <span className="text-white text-2xl">📋</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">علاماتي</h2>
          <p className="text-white/90 text-sm mt-1">مراجعة أدائك في المقاطع المختلفة</p>
        </div>
      </div>
      <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg border border-white/30">
        <span className="font-bold text-lg">{sectionsCount}</span>
        <span className="text-sm mr-2">مقطع</span>
      </div>
    </div>
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
      <Card className="overflow-hidden p-0 w-full">
        <StudentHeader sectionsCount={sections.length} />

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

        <div className="p-0">
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
