// Utility code for extracting validation messages from Yup and Segment objects
import { sectionValidationSchema } from '@/Validation/dailyMarksValidation';
import type { QuranSegmentUI } from '../types/types';
import * as yup from 'yup';

/**
 * Validates the consistency between memorization and review segments.
 * Uses the shared Yup schema but returns a clean array of error messages.
 */
export const validateSectionConsistency = (
  memorizationMeta: QuranSegmentUI[] = [],
  reviewMeta: QuranSegmentUI[] = []
): string[] => {
  const errors: string[] = [];

  // 1. Run Yup Schema Validation for Consistency
  try {
    sectionValidationSchema.validateSync(
      {
        date: '2023-01-01', // Dummy date to clear the date check
        memorizationMeta,
        reviewMeta,
      },
      { abortEarly: false }
    );
  } catch (err: any) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((validationError: any) => {
        // We filter for reviewMeta errors or general consistency checks
        if (
          validationError.path === 'reviewMeta' ||
          validationError.type === 'consistency-check'
        ) {
           // Avoid duplicates if possible
           if (!errors.includes(validationError.message)) {
               errors.push(validationError.message);
           }
        }
      });
    }
  }

  // 2. Aggregate internal segment-specific errors
  // Check against Max Memorized logic if applicable (though this is usually handled per segment)
  const collectSegmentErrors = (segments: QuranSegmentUI[], label: string) => {
    segments.forEach((seg, idx) => {
        if (seg.error && !errors.includes(seg.error)) {
            // Only add if it's not a generic "invalid"
            errors.push(`${label} (${idx + 1}): ${seg.error}`);
        }
    });
  };

  collectSegmentErrors(reviewMeta, 'المراجعة');
  collectSegmentErrors(memorizationMeta, 'الحفظ');

  return errors;
};
