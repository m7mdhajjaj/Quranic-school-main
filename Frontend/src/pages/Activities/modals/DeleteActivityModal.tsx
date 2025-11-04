import Swal from 'sweetalert2';
import { deleteActivity as deleteActivityApi } from "@/Api/activityApi";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/utils/toastUtils";

interface DeleteActivityModalProps {
  activityId: string;
  onSuccess: () => void;
}

export const showDeleteActivityModal = async ({
  activityId,
  onSuccess,
}: DeleteActivityModalProps): Promise<void> => {
  const result = await Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'هل تريد حذف هذا النشاط؟',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'نعم، احذف',
    cancelButtonText: 'إلغاء',
    backdrop: true,
    customClass: {
      popup: 'rounded-2xl',
      confirmButton: 'rounded-lg px-6 py-3 font-bold',
      cancelButton: 'rounded-lg px-6 py-3 font-bold',
    },
  });

  if (result.isConfirmed) {
    try {
      await deleteActivityApi(activityId);
      showSuccessToast('تم حذف النشاط بنجاح ✓');
      onSuccess();
    } catch (error) {
      console.error('Error deleting activity:', error);
      showErrorToast('حدث خطأ أثناء حذف النشاط');
    }
  }
};
