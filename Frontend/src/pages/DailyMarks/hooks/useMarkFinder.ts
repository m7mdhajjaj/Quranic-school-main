import { useMemo } from 'react';
import type { Mark, Section } from '../types/types';

interface UseMarkFinderProps {
  sections: Section[];
  marks: Mark[];
  studentId?: string | null; // Filter marks by studentId to prevent cross-student display
}

type SectionWithMark = Section & { mark?: Mark };

/**
 * Find mark for a specific section and student
 * 
 * @param {Mark[]} marks - Array of marks
 * @param {string} sectionId - Section ID to find mark for
 * @param {string | null} studentId - Optional student ID to filter marks
 * @returns {Mark | undefined} Mark object or undefined
 */
const findMarkForSection = (
  marks: Mark[], 
  sectionId: string, 
  studentId?: string | null
): Mark | undefined => {
  return marks.find((m) => {
    if (!m || !m.sectionId) return false;
    
    // Check sectionId match
    const sectionMatch = typeof m.sectionId === "string" 
      ? m.sectionId === sectionId 
      : m.sectionId._id === sectionId;
    
    if (!sectionMatch) return false;
    
    // If studentId is provided, also check studentId match
    // This prevents marks from appearing for wrong students
    if (studentId && m.studentId) {
      const markStudentId = typeof m.studentId === "string" 
        ? m.studentId 
        : m.studentId._id;
      
      if (String(markStudentId) !== String(studentId)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Custom hook for finding marks for sections
 * 
 * @description
 * - Attaches corresponding marks to sections
 * - Memoizes the mark finding logic for performance
 * - Handles both populated and unpopulated sectionId references
 * - Filters by studentId to prevent cross-student mark display
 * 
 * @param {Section[]} sections - List of sections
 * @param {Mark[]} marks - List of marks
 * @param {string | null} studentId - Optional student ID to filter marks
 * 
 * @returns {SectionWithMark[]} Sections with attached marks
 */
export const useMarkFinder = ({ 
  sections, 
  marks, 
  studentId 
}: UseMarkFinderProps): SectionWithMark[] => {
  return useMemo(() => {
    return sections.map((section) => ({
      ...section,
      mark: findMarkForSection(marks, section._id, studentId),
    }));
  }, [sections, marks, studentId]);
};
