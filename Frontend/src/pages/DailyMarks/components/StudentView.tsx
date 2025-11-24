import { memo } from "react";
import type { StudentViewProps } from "../types/types";
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
    <div className="grid grid-cols-1 gap-6">
      {/* Student Marks */}
      <Card className="overflow-hidden p-0">
        {/* Simplified Header */}
        <div className="bg-emerald-600 py-5 px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-700 p-3 rounded-lg">
                <span className="text-white text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">علاماتي</h2>
                <p className="text-emerald-100 text-sm mt-0.5">مراجعة أدائك في المقاطع المختلفة</p>
              </div>
            </div>
            <div className="bg-emerald-700 text-white px-3 py-1.5 rounded-md">
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
