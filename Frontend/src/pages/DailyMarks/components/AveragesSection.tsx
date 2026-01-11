import { AveragesBar } from "./AveragesBar";
import { AveragesBarSkeleton } from "@/components/skeletons";
import type { AverageResults } from "../types/types";

interface AveragesSectionProps {
  selectedStudentId: string | null;
  sectionsCount: number;
  averages: AverageResults;
  loading?: boolean;
}

/**
 * Averages Section Component - Displays monthly averages above the main content
 */
export const AveragesSection = ({
  selectedStudentId,
  sectionsCount,
  averages,
  loading,
}: AveragesSectionProps) => {
  if (loading) {
    return (
      <div className="mb-8">
        <AveragesBarSkeleton />
      </div>
    );
  }

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
