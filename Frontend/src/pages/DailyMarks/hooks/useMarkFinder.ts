import { useMemo } from 'react';
import type { Mark, Section } from '../types/types';

interface UseMarkFinderProps {
  sections: Section[];
  marks: Mark[];
}

type SectionWithMark = Section & { mark?: Mark };

/**
 * Find mark for a specific section
 * 
 * @param {Mark[]} marks - Array of marks
 * @param {string} sectionId - Section ID to find mark for
 * @returns {Mark | undefined} Mark object or undefined
 */
const findMarkForSection = (marks: Mark[], sectionId: string): Mark | undefined => {
  return marks.find((m) => {
    if (!m || !m.sectionId) return false;
    if (typeof m.sectionId === "string") {
      return m.sectionId === sectionId;
    } else {
      return m.sectionId._id === sectionId;
    }
  });
};

/**
 * Custom hook for finding marks for sections
 * 
 * @description
 * - Attaches corresponding marks to sections
 * - Memoizes the mark finding logic for performance
 * - Handles both populated and unpopulated sectionId references
 * 
 * @param {Section[]} sections - List of sections
 * @param {Mark[]} marks - List of marks
 * 
 * @returns {SectionWithMark[]} Sections with attached marks
 */
export const useMarkFinder = ({ sections, marks }: UseMarkFinderProps): SectionWithMark[] => {
  return useMemo(() => {
    return sections.map((section) => ({
      ...section,
      mark: findMarkForSection(marks, section._id),
    }));
  }, [sections, marks]);
};
