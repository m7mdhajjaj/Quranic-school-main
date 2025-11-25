/**
 * Determines if Basmala should be shown for a surah
 * @param surahNumber - The surah number
 * @param currentPage - The current page number
 * @returns true if Basmala should be displayed
 */
export const shouldShowBasmala = (surahNumber: number, currentPage: number): boolean => {
  // Don't show Basmala for Al-Fatiha (1) and At-Tawbah (9)
  // Only show on the first page
  return surahNumber !== 1 && surahNumber !== 9 && currentPage === 1;
};
