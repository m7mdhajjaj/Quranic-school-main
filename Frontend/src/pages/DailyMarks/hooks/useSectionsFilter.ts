import { useState } from "react";
import type { Section, Mark, AverageResults } from "../types/types";

/**
 * Custom hook for filtering sections by month/year and calculating averages
 */
export const useSectionsFilter = (sections: Section[], searchQuery: string = "") => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  ); // Current year

  // Filter sections by selected month, year, and search query
  const getFilteredSections = () => {
    return sections.filter((section) => {
      const sectionDate = new Date(section.date);
      const sectionMonth = sectionDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      const sectionYear = sectionDate.getFullYear();
      
      const matchesDate = sectionMonth === selectedMonth && sectionYear === selectedYear;
      
      if (!searchQuery.trim()) {
        return matchesDate;
      }
      
      // Search in review and memorization sections
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        section.reviewSection?.toLowerCase().includes(query) ||
        section.memorizationSection?.toLowerCase().includes(query);
      
      return matchesDate && matchesSearch;
    });
  };

  // Calculate averages for the selected month and year
  const calculateAverages = (
    marks: Mark[],
    studentId: string | null
  ): AverageResults => {
    const filteredSections = getFilteredSections();

    if (filteredSections.length === 0 || !studentId) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    const relevantMarks = marks.filter((mark) => {
      // Check if mark and its required properties exist
      if (!mark || !mark.sectionId || !mark.studentId) {
        return false;
      }

      const markSectionId =
        typeof mark.sectionId === "string"
          ? mark.sectionId
          : mark.sectionId._id;

      const markStudentId =
        typeof mark.studentId === "string"
          ? mark.studentId
          : mark.studentId._id;

      return (
        markStudentId === studentId &&
        filteredSections.some((section) => section._id === markSectionId)
      );
    });

    if (relevantMarks.length === 0) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    const reviewMarks = relevantMarks
      .filter((mark) => mark.reviewMark !== null)
      .map((mark) => mark.reviewMark || 0);
    const memorizationMarks = relevantMarks
      .filter((mark) => mark.memorizationMark !== null)
      .map((mark) => mark.memorizationMark || 0);

    const reviewAverage =
      reviewMarks.length > 0
        ? reviewMarks.reduce((sum, mark) => sum + mark, 0) / reviewMarks.length
        : 0;
    const memorizationAverage =
      memorizationMarks.length > 0
        ? memorizationMarks.reduce((sum, mark) => sum + mark, 0) /
          memorizationMarks.length
        : 0;

    // Overall average out of 100: (review + memorization) * 5
    // Each is out of 10, so total is 20, multiply by 5 to get percentage
    const overallAverage = (reviewAverage + memorizationAverage) * 5;

    return {
      reviewAverage: Number(reviewAverage.toFixed(2)),
      memorizationAverage: Number(memorizationAverage.toFixed(2)),
      overallAverage: Number(overallAverage.toFixed(2)),
      totalMarks: relevantMarks.length,
    };
  };

  return {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    getFilteredSections,
    calculateAverages,
  };
};
