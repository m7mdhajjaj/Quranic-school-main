import { bulkSaveMarks, deleteStudentMark, updateStudentMark } from '../../../Api/examApi';
import { showSuccessToast, showErrorToast } from '../../../components/utils/toastUtils';
import Swal from 'sweetalert2';

export function useMarkActions(options: { refreshAverageForExam: (examId: string) => Promise<void>; setMarks: React.Dispatch<React.SetStateAction<Record<string, { mark: string; detail: string }>>>; }) {
  const { refreshAverageForExam, setMarks } = options;

  const handleAddMark = async (e: React.FormEvent, params: { selectedExamId: string; students: Array<{ _id: string }>; marks: Record<string, { mark: string; detail: string }> }) => {
    e.preventDefault();
    const { selectedExamId, students, marks } = params;
    const marksArr = students.map((s) => ({
      student: s._id,
      mark: marks[s._id]?.mark ? Number(marks[s._id].mark) : null,
      detail: marks[s._id]?.detail || '',
    }));
    try {
      await bulkSaveMarks(selectedExamId, { marks: marksArr });
      showSuccessToast('✅ تم حفظ جميع العلامات بنجاح');
      await refreshAverageForExam(selectedExamId);
    } catch (error) {
      console.error('Error saving marks:', error);
      showErrorToast('❌ حدث خطأ أثناء حفظ العلامات');
    }
  };

  const handleSaveSingleMark = async (params: { examId: string; studentId: string; fullName?: string; mark: string | undefined }) => {
    const { examId, studentId, fullName, mark } = params;
    try {
      await updateStudentMark(examId, studentId, {
        mark: mark ? Number(mark) : null,
        detail: '',
      });
      await refreshAverageForExam(examId);
      showSuccessToast(fullName ? `✅ تم حفظ علامة ${fullName}` : '✅ تم حفظ العلامة بنجاح', {
        position: 'top-left',
      });
    } catch (error) {
      console.error('Error updating student mark:', error);
      showErrorToast('❌ حدث خطأ أثناء حفظ العلامة');
    }
  };

  const handleDeleteMark = async (examId: string, studentId: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'تأكيد الحذف',
      text: 'هل أنت متأكد من حذف العلامة؟',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      position: 'center',
      backdrop: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStudentMark(examId, studentId);
      setMarks((prev) => ({ ...prev, [studentId]: { mark: '', detail: '' } }));
      await refreshAverageForExam(examId);
      showSuccessToast('🗑️ تم حذف العلامة بنجاح', {
        position: 'top-left',
      });
    } catch (error) {
      console.error('Error deleting mark:', error);
      showErrorToast('❌ حدث خطأ أثناء حذف العلامة');
    }
  };

  return { handleAddMark, handleSaveSingleMark, handleDeleteMark } as const;
}
