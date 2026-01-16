import { useState, useCallback, useMemo } from "react";
import { deleteGroup, type Group } from "@/Api/groupApi";
import {
  showCenteredSwal,
  showErrorMessage,
} from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";

export const useGroupsActions = (
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  fetchGroups: () => Promise<void>
) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  // Handle delete
  const handleDelete = useCallback(async (groupId: string) => {
    const result = await showCenteredSwal({
      title: "تأكيد حذف الحلقة",
      text: "هل أنت متأكد من حذف هذه الحلقة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "rtl-popup",
        title: "rtl-title",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteGroup(groupId);

        setGroups((prevGroups) => prevGroups.filter((g) => g._id !== groupId));

        showSuccessToast("تم حذف الحلقة بنجاح");
      } catch (deleteError: unknown) {
        console.error("❌ فشل في حذف الحلقة:", deleteError);

        // التعامل مع خطأ وجود طلاب مرتبطين
        const error = deleteError as {
          response?: {
            status: number;
            data: { details: { studentsCount: number }; message: string };
          };
        };
        if (error.response?.status === 400 && error.response?.data?.details) {
          const { studentsCount } = error.response.data.details;

          await showCenteredSwal({
            title: "⚠️ لا يمكن حذف الحلقة ⚠️",
            html: `
              <div class="text-center py-4">
                <div class="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <p class="text-lg font-semibold text-gray-800 mb-2">الحلقة تحتوي على:</p>
                <p class="text-2xl font-bold text-orange-600 mb-2">👥 ${studentsCount} طالب</p>
                <p class="text-sm text-gray-600 mb-2">يجب نقل الطلاب إلى حلقة أخرى أولاً</p>
                <p class="text-xs text-yellow-600">أو إلغاء تسجيلهم من الحلقة</p>
              </div>
            `,
            icon: "warning",
            timer: 7000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: "فهمت",
            customClass: {
              popup: "rtl-popup swal2-rtl-popup swal2-center-popup",
              title: "rtl-title",
              htmlContainer: "rtl-content",
            },
          });
        } else {
          // خطأ عام
          await showErrorMessage(
            "خطأ!",
            error.response?.data?.message || "حدث خطأ أثناء حذف الحلقة"
          );
        }
      }
    }
  }, [setGroups]);

  // Handle edit
  const handleEdit = useCallback((group: Group) => {
    setSelectedGroup(group);
    setIsEditMode(true);
    setIsFormVisible(true);
  }, []);

  // Handle add/edit success
  const handleAddSuccess = useCallback(async () => {
    try {
      console.log("تمت العملية بنجاح");
      fetchGroups();
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedGroup(null);
      // Toast notification is already shown in useGroupForm, no need for SweetAlert here
    } catch (error) {
      console.error("خطأ في حفظ الحلقة:", error);

      await showErrorMessage("خطأ!", "حدث خطأ أثناء حفظ بيانات الحلقة");
    }
  }, [fetchGroups]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedGroups.size === 0) return;

    const result = await showCenteredSwal({
      title: `حذف ${selectedGroups.size} حلقة`,
      text: "هل أنت متأكد من حذف الحلقات المحددة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف الكل",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          Array.from(selectedGroups).map((id) => deleteGroup(id))
        );

        setGroups((prev) =>
          prev.filter((g) => !selectedGroups.has(g._id || ""))
        );
        setSelectedGroups(new Set());

        showSuccessToast(`تم حذف ${selectedGroups.size} حلقة بنجاح`);
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف الحلقات:", bulkDeleteError);
        await showErrorMessage("خطأ!", "حدث خطأ أثناء حذف الحلقات");
      }
    }
  }, [selectedGroups, setGroups]);

  // Toggle group selection
  const toggleGroupSelection = useCallback((groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  }, [selectedGroups]);

  // Select all groups (current page)
  const selectAllGroups = useCallback((currentGroups: Group[]) => {
    setSelectedGroups((prevSelected) => {
      if (prevSelected.size === currentGroups.length) {
        return new Set();
      } else {
        return new Set(currentGroups.map((g) => g._id || ""));
      }
    });
  }, []);

  // Export to CSV from Backend
  const handleExport = useCallback(async (filters?: any) => {
    try {
      console.log("📥 تصدير الحلقات إلى CSV...");
      
      const { exportGroupsToCSV } = await import("@/Api/groupApi");
      const blob = await exportGroupsToCSV(filters);

      if (!blob) {
        await showErrorMessage("خطأ!", "فشل تصدير البيانات");
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `groups_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      showSuccessToast("✅ تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("❌ خطأ في تصدير البيانات:", error);
      await showErrorMessage("خطأ!", "حدث خطأ أثناء تصدير البيانات");
    }
  }, []);

  return useMemo(() => ({
    isFormVisible,
    setIsFormVisible,
    isEditMode,
    setIsEditMode,
    selectedGroup,
    setSelectedGroup,
    selectedGroups,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleBulkDelete,
    toggleGroupSelection,
    selectAllGroups,
    handleExport,
  }), [
    isFormVisible,
    isEditMode,
    selectedGroup,
    selectedGroups,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleBulkDelete,
    toggleGroupSelection,
    selectAllGroups,
    handleExport,
  ]);
};
