import { useState, useCallback } from "react";
import { deleteGroup, type Group } from "@/Api/groupApi";
import {
  showCenteredSwal,
  showSuccessMessage,
  showErrorMessage,
} from "@/components/utils/sweetalertUtils";

export const useGroupsActions = (
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  fetchGroups: () => Promise<void>
) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  // Handle delete
  const handleDelete = async (groupId: string) => {
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

        await showSuccessMessage("تم الحذف!", "تم حذف الحلقة بنجاح");
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
  };

  // Handle edit
  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  // Handle add/edit success
  const handleAddSuccess = async () => {
    try {
      console.log("تمت العملية بنجاح");
      fetchGroups();
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedGroup(null);

      // SweetAlert for success
      await showSuccessMessage(
        isEditMode ? "تم التحديث!" : "تم الإضافة!",
        isEditMode
          ? "تم تحديث بيانات الحلقة بنجاح"
          : "تم إضافة الحلقة الجديدة بنجاح"
      );
    } catch (error) {
      console.error("خطأ في حفظ الحلقة:", error);

      await showErrorMessage("خطأ!", "حدث خطأ أثناء حفظ بيانات الحلقة");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
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

        await showSuccessMessage(
          "تم الحذف!",
          "تم حذف الحلقات بنجاح",
          `${selectedGroups.size} حلقة`
        );
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف الحلقات:", bulkDeleteError);
        await showErrorMessage("خطأ!", "حدث خطأ أثناء حذف الحلقات");
      }
    }
  };

  // Toggle group selection
  const toggleGroupSelection = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

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

  // Export to CSV
  const handleExport = (filteredGroups: Group[]) => {
    const headers = [
      "اسم الحلقة",
      "المعلم",
      "السعة",
      "الطلاب المشتركين",
      "المواعيد",
      "الوصف",
    ];
    const rows = filteredGroups.map((g) => [
      g.name,
      g.teacher,
      g.capacity,
      g.currentStudents || 0,
      g.schedule || "",
      g.description || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `groups_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return {
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
  };
};
