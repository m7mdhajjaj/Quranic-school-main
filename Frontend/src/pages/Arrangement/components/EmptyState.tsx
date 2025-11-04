/**
 * Empty State Component
 * Shows when no students have averages for the selected period
 * Uses shared EmptyState component
 */

import { EmptyState as SharedEmptyState } from "@/components/UI/EmptyState";
import { getMonthName } from "../utils/arrangementHelpers";

interface EmptyStateProps {
  selectedMonth: number;
  selectedYear: number;
}

export const EmptyState = ({
  selectedMonth,
  selectedYear,
}: EmptyStateProps) => {
  return (
    <div data-aos="fade-up">
      <SharedEmptyState
        illustration="no-data"
        title="لا يوجد طلاب بمعدلات"
        description={`لم يتم تسجيل معدلات للطلاب في ${getMonthName(
          selectedMonth
        )} ${selectedYear}`}
      />
    </div>
  );
};
