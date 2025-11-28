/**
 * Empty State Component
 * Shows when no students have averages for the selected period
 * Uses shared EmptyState component
 */

import { EmptyState as SharedEmptyState } from "@/components/UI/EmptyState";
import { getMonthName } from "../utils/rankingHelpers";

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
        title="لا توجد علامات للترتيب"
        description={`لم يتم تسجيل أي علامات للطلاب في شهر ${getMonthName(
          selectedMonth
        )} ${selectedYear}. يرجى اختيار شهر آخر أو إضافة علامات للطلاب.`}
      />
    </div>
  );
};
