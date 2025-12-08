// ============================================================================
// useExamActions.ts - Exam CRUD Operations Hook
// ============================================================================

import { useState } from 'react';
import {
  createExam,
  updateExam,
  deleteExam,
  type Exam,
} from "@/Api/ExamShedule";
import { showSuccessMessage, showErrorMessage } from "@/components/utils/sweetalertUtils";
import Swal from 'sweetalert2';

// Helper function: Check if time is within allowed range (12:00 - 21:00)
const isTimeWithinAllowedRange = (time: string): boolean => {
  if (!time) return false;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;
  const totalMinutes = hours * 60 + minutes;
  const MIN = 12 * 60; // 12:00
  const MAX = 21 * 60; // 21:00
  return totalMinutes >= MIN && totalMinutes <= MAX;
};

interface UseExamActionsProps {
  onExamsChange: () => void;
}

export const useExamActions = ({ onExamsChange }: UseExamActionsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new exam
  const handleAddExam = async (
    examData: any,
    selectedGroup: string,
    role: string
  ) => {
    const { name, date, time, subject, type, duration, totalMarks, passingMarks } = examData;

    if (!name?.trim() || !date || !time) {
      showErrorMessage('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!isTimeWithinAllowedRange(time)) {
      showErrorMessage('خطأ', 'الوقت المسموح من 12:00 ظهراً إلى 9:00 مساءً');
      return false;
    }

    if (role === 'teacher' && (!selectedGroup || selectedGroup.trim() === '')) {
      showErrorMessage('خطأ', 'يرجى اختيار الحلقة');
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name,
        date,
        time,
        subject,
        type,
        duration,
        totalMarks,
        passingMarks,
        ...(role === 'teacher' && selectedGroup && selectedGroup.trim() ? { group: selectedGroup } : {}),
      };

      await createExam(payload);
      showSuccessMessage('نجاح', 'تم إضافة الامتحان بنجاح');
      onExamsChange();
      return true;
    } catch (error: unknown) {
      console.error('Error adding exam:', error);
      
      // استخراج رسالة الخطأ من Backend
      let errorMessage = 'حدث خطأ أثناء إضافة الامتحان';
      let errorDetails: string[] = [];
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string; errors?: string[]; error?: string } } }).response;
        if (response?.data) {
          errorMessage = response.data.message || response.data.error || errorMessage;
          errorDetails = response.data.errors || [];
        }
      }
      
      // عرض الرسالة مع التفاصيل
      if (errorDetails.length > 0) {
        const detailsHtml = errorDetails.map(err => `<li class="text-right">${err}</li>`).join('');
        showErrorMessage('خطأ', `<div class="text-right"><p class="mb-2">${errorMessage}</p><ul class="list-disc list-inside">${detailsHtml}</ul></div>`);
      } else {
        showErrorMessage('خطأ', errorMessage);
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit existing exam
  const handleEditExam = async (exam: any) => {
    if (!exam) return false;

    const { name, date, time, subject, type, duration, totalMarks, passingMarks } = exam;

    if (!name?.trim() || !date || !time) {
      showErrorMessage('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!isTimeWithinAllowedRange(time)) {
      showErrorMessage('وقت غير صحيح', 'الوقت المسموح من 12:00 ظهراً إلى 9:00 مساءً');
      return false;
    }

    setIsSubmitting(true);
    try {
      const examId = String(exam._id ?? exam.id ?? '');
      if (!examId) {
        showErrorMessage('خطأ', 'معرف الامتحان غير صالح');
        return false;
      }

      const payload: any = { 
        name, 
        date, 
        time, 
        subject,
        type,
        duration,
        totalMarks,
        passingMarks,
        group: exam.group 
      };
      await updateExam(examId, payload);
      
      showSuccessMessage('نجاح', 'تم تعديل الامتحان بنجاح');
      onExamsChange();
      return true;
    } catch (error: unknown) {
      console.error('Error editing exam:', error);
      
      // استخراج رسالة الخطأ من Backend
      let errorMessage = 'حدث خطأ أثناء تعديل الامتحان';
      let errorDetails: string[] = [];
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string; errors?: string[]; error?: string } } }).response;
        if (response?.data) {
          errorMessage = response.data.message || response.data.error || errorMessage;
          errorDetails = response.data.errors || [];
        }
      }
      
      // عرض الرسالة مع التفاصيل
      if (errorDetails.length > 0) {
        const detailsHtml = errorDetails.map(err => `<li class="text-right">${err}</li>`).join('');
        showErrorMessage('خطأ في التعديل', `<div class="text-right"><p class="mb-2">${errorMessage}</p><ul class="list-disc list-inside">${detailsHtml}</ul></div>`);
      } else {
        showErrorMessage('خطأ في التعديل', errorMessage);
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete exam
  const handleDeleteExam = async (examIdRaw: string | number) => {
    const examId = String(examIdRaw);
    if (!examId) {
      showErrorMessage('خطأ', 'معرف الامتحان غير صالح');
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
      showSuccessMessage('نجاح', 'تم حذف الامتحان بنجاح');
      onExamsChange();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting exam:', error);
      let errorMessage = 'حدث خطأ أثناء حذف الامتحان';
      let errorDetails: string[] = [];
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string; errors?: string[]; error?: string } } }).response;
        if (response?.data) {
          errorMessage = response.data.message || response.data.error || errorMessage;
          errorDetails = response.data.errors || [];
        }
      }
      
      if (errorDetails.length > 0) {
        const detailsHtml = errorDetails.map(err => `<li class="text-right">${err}</li>`).join('');
        showErrorMessage('خطأ في الحذف', `<div class="text-right"><p class="mb-2">${errorMessage}</p><ul class="list-disc list-inside">${detailsHtml}</ul></div>`);
      } else {
        showErrorMessage('خطأ في الحذف', errorMessage);
      }
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
