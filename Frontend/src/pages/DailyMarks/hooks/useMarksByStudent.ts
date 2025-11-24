import type { Mark, Section } from "../types/types";

/**
 * Custom hook for filtering marks by student and sections
 * Returns marks for a specific student within the given sections
 */
export const useMarksByStudent = (
  marks: Mark[],
  sections: Section[],
  studentId: string | null
) => {
  if (!studentId) {
    return [];
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
      sections.some((section) => section._id === markSectionId)
    );
  });

  return relevantMarks;
};
