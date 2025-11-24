import { AveragesBar } from "./AveragesBar";
import type { AverageResults } from "../types/dailyMarks";

interface AveragesSectionProps {
  selectedStudentId: string | null;
  sectionsCount: number;
  averages: AverageResults;
}

/**
 * Averages Section Component - Displays monthly averages above the main content
 */
export const AveragesSection = ({
  selectedStudentId,
  sectionsCount,
  averages,
}: AveragesSectionProps) => {
  if (!selectedStudentId || sectionsCount === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <AveragesBar
        reviewAverage={averages.reviewAverage}
        memorizationAverage={averages.memorizationAverage}
        overallAverage={averages.overallAverage}
        totalMarks={averages.totalMarks}
      />
    </div>
  );
};
