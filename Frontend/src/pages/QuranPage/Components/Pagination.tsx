import { memo } from "react";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import type { PaginationProps } from "../types/pagination";

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
