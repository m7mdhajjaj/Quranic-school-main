import { memo } from "react";
import ResponsivePagination from "../../components/shared/Navigation/ResponsivePagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalAyahs: number;
  ayahsPerPage: number;
  onNext: () => void;
  onPrevious: () => void;
  onPageChange: (page: number) => void;
}

const Pagination = memo(({
  currentPage,
  totalPages,
  totalAyahs,
  ayahsPerPage,
  onPageChange,
}: PaginationProps) => {
  return (
    <ResponsivePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalAyahs}
      itemsPerPage={ayahsPerPage}
      onPageChange={onPageChange}
      itemName="آية"
      showQuickJump={true}
    />
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
