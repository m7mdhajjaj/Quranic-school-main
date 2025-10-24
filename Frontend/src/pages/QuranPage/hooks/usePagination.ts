import { useState, useMemo } from "react";
import type { Ayah } from "../types/quran.types";

/**
 * ✅ Hook لإدارة الترقيم (Pagination)
 */
export const usePagination = (ayahs: Ayah[], ayahsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ayahs.length / ayahsPerPage);

  const currentAyahs = useMemo(() => {
    const start = (currentPage - 1) * ayahsPerPage;
    return ayahs.slice(start, start + ayahsPerPage);
  }, [ayahs, currentPage, ayahsPerPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    currentAyahs,
    goToNextPage,
    goToPreviousPage,
    resetPage,
  };
};
