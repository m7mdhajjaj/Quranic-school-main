import { useState, useEffect, useCallback } from 'react';
import { setMarksForSection } from '@/Api/DailyMark/dailyMarksApi';
import { getStudentsByGroup } from '@/Api/studentApi';
import { showSuccessToast } from '@/utils/toastUtils';
import { showErrorMessage } from '@/utils/sweetalertUtils';
import type { Section, Student, Mark } from '../../types/types';

interface StudentMark {
  studentId: string;
  student: Student;
  reviewMark: number | null;
  memorizationMark: number | null;
  existingMark?: Mark | null;
}

export const useBulkMarksModal = (
  isOpen: boolean,
  section: Section | null,
  group: string
) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentsByGroup(group);
      if (response.success && response.data) {
        setStudents(response.data.filter((s) => s.isActive));
      } else {
        setError(response.message || 'فشل في جلب الطلاب');
      }
    } catch {
      setError('حدث خطأ أثناء جلب الطلاب');
    } finally {
      setLoading(false);
    }
  }, [group]);

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen && group && group !== 'all') {
      fetchStudents();
    }
  }, [isOpen, group, fetchStudents]);

  // Initialize student marks when students are loaded
  useEffect(() => {
    if (students.length > 0 && section) {
      const initialMarks: StudentMark[] = students.map((student) => ({
        studentId: student._id,
        student,
        reviewMark: null,
        memorizationMark: null,
        existingMark: null,
      }));
      setStudentMarks(initialMarks);
    }
  }, [students, section]);

  const updateStudentMark = useCallback(
    (
      studentId: string,
      field: 'reviewMark' | 'memorizationMark',
      value: number | null
    ) => {
      setStudentMarks((prev) =>
        prev.map((sm) => (sm.studentId === studentId ? { ...sm, [field]: value } : sm))
      );
    },
    []
  );

  const validateMarks = useCallback(() => {
    // Check if at least one mark is filled
    const hasMarks = studentMarks.some(
      (sm) => sm.reviewMark !== null || sm.memorizationMark !== null
    );

    if (!hasMarks) {
      showErrorMessage('خطأ', 'يجب إدخال علامة واحدة على الأقل');
      return false;
    }

    // Validate marks range (6-10)
    const invalidMarks = studentMarks.filter(
      (sm) =>
        (sm.reviewMark !== null && (sm.reviewMark < 6 || sm.reviewMark > 10)) ||
        (sm.memorizationMark !== null &&
          (sm.memorizationMark < 6 || sm.memorizationMark > 10))
    );

    if (invalidMarks.length > 0) {
      showErrorMessage('خطأ', 'العلامات يجب أن تكون بين 6 و 10');
      return false;
    }

    return true;
  }, [studentMarks]);

  const handleSubmit = useCallback(
    async (onSuccess?: () => void) => {
      if (!section) {
        showErrorMessage('خطأ', 'المقطع غير محدد');
        return false;
      }

      if (!validateMarks()) {
        return false;
      }

      // ✅ تحديد ما إذا كان المقطع يحتوي على حفظ أو مراجعة
      const hasMemorization = !!(
        section.memorizationSection?.trim() || 
        (section.memorizationMeta && section.memorizationMeta.length > 0)
      );
      const hasReview = !!(
        section.reviewSection?.trim() || 
        (section.reviewMeta && section.reviewMeta.length > 0)
      );

      setSubmitting(true);
      try {
        const marksData = studentMarks
          .filter((sm) => {
            // ✅ فلترة بناءً على ما هو موجود في المقطع
            if (hasReview && hasMemorization) {
              return sm.reviewMark !== null || sm.memorizationMark !== null;
            } else if (hasReview) {
              return sm.reviewMark !== null;
            } else if (hasMemorization) {
              return sm.memorizationMark !== null;
            }
            return false;
          })
          .map((sm) => {
            // ✅ إرسال فقط العلامات المتعلقة بالنوع الموجود
            const mark: { studentId: string; reviewMark?: number | null; memorizationMark?: number | null } = {
              studentId: sm.studentId,
            };
            
            if (hasReview) {
              mark.reviewMark = sm.reviewMark ?? null;
            }
            if (hasMemorization) {
              mark.memorizationMark = sm.memorizationMark ?? null;
            }
            
            return mark;
          });

        const response = await setMarksForSection(section._id, marksData);

        if (response.success) {
          showSuccessToast(`تم حفظ ${marksData.length} علامة بنجاح`);
          onSuccess?.();
          return true;
        } else {
          showErrorMessage('خطأ', response.message || 'فشل في حفظ العلامات');
          return false;
        }
      } catch {
        showErrorMessage('خطأ', 'حدث خطأ أثناء حفظ العلامات');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [section, studentMarks, validateMarks]
  );

  const marksCount = studentMarks.filter(
    (sm) => sm.reviewMark !== null || sm.memorizationMark !== null
  ).length;

  return {
    students,
    studentMarks,
    loading,
    submitting,
    error,
    marksCount,
    fetchStudents,
    updateStudentMark,
    handleSubmit,
  };
};
