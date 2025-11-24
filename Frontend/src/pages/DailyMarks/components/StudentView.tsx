import { memo } from "react";
import type { StudentViewProps } from "../types/dailyMarks";
import { SectionsTable } from "./SectionsTable";
import { AveragesBar } from "./AveragesBar";
import { Card } from "@/components/UI";

/**
 * Student view component - single table layout with averages
 */
const StudentViewComponent = ({
  sections,
  marks,
  loadingMarks,
  averages,
}: StudentViewProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-in">
      {/* Student Marks */}
      <Card className="overflow-hidden p-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 py-6 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-5"></div>
          <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full translate-x-16 translate-y-16"></div>
          
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">📋 علاماتي</h2>
                <p className="text-emerald-50 text-sm mt-1">مراجعة أدائك في المقاطع المختلفة</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              <span className="font-bold">{sections.length}</span>
              <span className="text-sm mr-2">مقطع</span>
            </div>
          </div>
        </div>

        <div className="p-0">
          <SectionsTable
            sections={sections}
            marks={marks}
            loadingMarks={loadingMarks}
            isTeacher={false}
          />
        </div>

        {/* Averages Section for Student View */}
        {sections.length > 0 && (
          <AveragesBar
            reviewAverage={averages.reviewAverage}
            memorizationAverage={averages.memorizationAverage}
            overallAverage={averages.overallAverage}
            totalMarks={averages.totalMarks}
          />
        )}
      </Card>
    </div>
  );
};

export const StudentView = memo(StudentViewComponent);
