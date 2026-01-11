// ============================================================================
// useGroupsActions - Hook لإدارة العمليات على الحلقات
// ============================================================================

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { deleteGroup } from "@/Api/groupApi";
import type { Group } from "@/types/group.types";

export const useGroupsActions = (
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  fetchGroups: () => Promise<void>
) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  // Handle delete
  const handleDelete = useCallback(
    async (groupId: string) => {
      Alert.alert("تأكيد حذف الحلقة", "هل أنت متأكد من حذف هذه الحلقة؟", [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteGroup(groupId);

              if (result.success) {
                setGroups((prevGroups) =>
                  prevGroups.filter((g) => g._id !== groupId)
                );
                Alert.alert("نجاح", "تم حذف الحلقة بنجاح");
              } else {
                Alert.alert(
                  "خطأ",
                  result.message || "حدث خطأ أثناء حذف الحلقة"
                );
              }
            } catch (error: any) {
              console.error("❌ فشل في حذف الحلقة:", error);
              Alert.alert("خطأ", error?.message || "حدث خطأ أثناء حذف الحلقة");
            }
          },
        },
      ]);
    },
    [setGroups]
  );

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
      await fetchGroups();
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error("خطأ في حفظ الحلقة:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ بيانات الحلقة");
    }
  }, [fetchGroups]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedGroups.size === 0) return;

    Alert.alert(
      `حذف ${selectedGroups.size} حلقة`,
      "هل أنت متأكد من حذف الحلقات المحددة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف الكل",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(
                Array.from(selectedGroups).map((id) => deleteGroup(id))
              );

              setGroups((prev) =>
                prev.filter((g) => !selectedGroups.has(g._id || ""))
              );
              setSelectedGroups(new Set());

              Alert.alert("نجاح", `تم حذف ${selectedGroups.size} حلقة بنجاح`);
            } catch (error) {
              console.error("❌ فشل في حذف الحلقات:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف الحلقات");
            }
          },
        },
      ]
    );
  }, [selectedGroups, setGroups]);

  // Toggle group selection
  const toggleGroupSelection = useCallback(
    (groupId: string) => {
      const newSelected = new Set(selectedGroups);
      if (newSelected.has(groupId)) {
        newSelected.delete(groupId);
      } else {
        newSelected.add(groupId);
      }
      setSelectedGroups(newSelected);
    },
    [selectedGroups]
  );

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
  };
};
