// ============================================================================
// useExamActions.ts - Exam CRUD Operations Hook
// ============================================================================

import { useState } from 'react';
import {
  createExam,
  updateExam,
  deleteExam,
  type Exam,
} from '../../../Api/examApi';
import { showSuccessToast, showErrorToast } from '../../../components/utils/toastUtils';
import { showSuccessMessage, showErrorMessage } from '../../../components/utils/sweetalertUtils';
import { isTimeWithinAllowedRange } from '../utils';
import Swal from 'sweetalert2';

interface UseExamActionsProps {
  onExamsChange: () => void;
}

export const useExamActions = ({ onExamsChange }: UseExamActionsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new exam
  const handleAddExam = async (
    examData: { name: string; date: string; time: string },
    selectedGroup: string,
    role: string
  ) => {
    const { name, date, time } = examData;

    if (!name.trim() || !date || !time) {
      showErrorMessage('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!isTimeWithinAllowedRange(time)) {
      showErrorMessage('خطأ', 'الوقت المسموح من 09:00 صباحاً إلى 07:00 مساءً');
      return false;
    }

    if (role === 'teacher' && (!selectedGroup || selectedGroup.trim() === '')) {
      showErrorMessage('خطأ', 'يرجى اختيار الحلقة');
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<Exam, '_id'> = {
        name,
        date,
        time,
        ...(role === 'teacher' && selectedGroup && selectedGroup.trim() ? { group: selectedGroup } : {}),
      };

      await createExam(payload);
      showSuccessMessage('نجاح', 'تم إضافة الامتحان بنجاح');
      onExamsChange();
      return true;
    } catch (error: unknown) {
      console.error('Error adding exam:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'حدث خطأ أثناء إضافة الامتحان'
        : 'حدث خطأ أثناء إضافة الامتحان';
      showErrorMessage('خطأ', errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit existing exam
  const handleEditExam = async (exam: Exam | null) => {
    if (!exam) return false;

    const { name, date, time } = exam;

    if (!name?.trim() || !date || !time) {
      showErrorToast('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!isTimeWithinAllowedRange(time)) {
      showErrorToast('⏰ الوقت المسموح من 09:00 صباحاً إلى 07:00 مساءً');
      return false;
    }

    setIsSubmitting(true);
    try {
      const examId = String(exam._id ?? exam.id ?? '');
      if (!examId) {
        showErrorToast('⚠️ معرف الامتحان غير صالح');
        return false;
      }

      const payload = { name, date, time, group: exam.group };
      await updateExam(examId, payload);
      
      showSuccessToast('✅ تم تعديل الامتحان بنجاح');
      onExamsChange();
      return true;
    } catch (error: unknown) {
      console.error('Error editing exam:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'حدث خطأ أثناء تعديل الامتحان'
        : 'حدث خطأ أثناء تعديل الامتحان';
      showErrorToast(`❌ ${errorMessage}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete exam
  const handleDeleteExam = async (examIdRaw: string | number) => {
    const examId = String(examIdRaw);
    if (!examId) {
      showErrorToast('⚠️ معرف الامتحان غير صالح');
      return false;
    }

    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف الامتحان وجميع العلامات المرتبطة به!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d33',
      position: 'center',
      backdrop: true,
    });

    if (!result.isConfirmed) return false;

    setIsSubmitting(true);
    try {
      await deleteExam(examId);
      showSuccessToast('🗑️ تم حذف الامتحان بنجاح');
      onExamsChange();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting exam:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'حدث خطأ أثناء حذف الامتحان'
        : 'حدث خطأ أثناء حذف الامتحان';
      showErrorToast(`❌ ${errorMessage}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleAddExam,
    handleEditExam,
    handleDeleteExam,
    isSubmitting,
  };
};
