export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalAyahs: number;
  ayahsPerPage: number;
  onNext: () => void;
  onPrevious: () => void;
  onPageChange: (page: number) => void;
}
