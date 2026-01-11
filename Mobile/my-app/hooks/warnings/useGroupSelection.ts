import { useState, useCallback } from "react";
import { getGroupStudentsWithWarnings } from "@/Api/warningApi";
import { GroupWithWarnings } from "@/types/warning.types";
import { Alert } from "react-native";
import api from "@/Api/api";

export const useGroupSelection = () => {
  const [selectedGroup, setSelectedGroup] = useState<GroupWithWarnings | null>(
    null
  );
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchGroupData = useCallback(
    async (groupId: string, groupName: string) => {
      try {
        setLoadingStudents(true);
        const studentsData = await getGroupStudentsWithWarnings(groupId);

        // تحويل بيانات الطلاب من صيغة Backend إلى صيغة Frontend
        const transformedStudents = (studentsData.students || []).map(
          (student: any) => {
            // حساب عدد كل نوع من الإنذارات
            const warningsByType = {
              warning: 0,
              first: 0,
              second: 0,
              third: 0,
            };

            // عد الإنذارات حسب النوع
            if (student.allWarnings && Array.isArray(student.allWarnings)) {
              student.allWarnings.forEach((warning: any) => {
                if (warning.type in warningsByType) {
                  warningsByType[warning.type as keyof typeof warningsByType]++;
                }
              });
            }

            return {
              ...student,
              warnings: {
                warning: warningsByType.warning,
                first: warningsByType.first,
                second: warningsByType.second,
                third: warningsByType.third,
                total: student.warningsCount || 0,
                details: student.allWarnings || [],
              },
            };
          }
        );

        // حساب الإحصائيات
        let totalWarnings = 0;
        let totalWarning = 0;
        let totalFirst = 0;
        let totalSecond = 0;
        let totalThird = 0;
        let studentsWithWarnings = 0;

        transformedStudents.forEach((student: any) => {
          if (student.warnings.total > 0) {
            studentsWithWarnings++;
          }
          totalWarnings += student.warnings.total;
          totalWarning += student.warnings.warning;
          totalFirst += student.warnings.first;
          totalSecond += student.warnings.second;
          totalThird += student.warnings.third;
        });

        setSelectedGroup({
          _id: groupId,
          name: groupName,
          students: transformedStudents,
          expelledStudents: studentsData.suspendedStudents || [],
          statistics: {
            totalWarnings,
            warning: totalWarning,
            first: totalFirst,
            second: totalSecond,
            third: totalThird,
            studentsWithWarnings,
            expelledCount: (studentsData.suspendedStudents || []).length,
          },
        });
      } catch (error: any) {
        Alert.alert(
          "خطأ",
          error?.response?.data?.message || "فشل تحميل بيانات الحلقة"
        );
        setSelectedGroup(null);
      } finally {
        setLoadingStudents(false);
      }
    },
    []
  );

  const handleGroupSelect = useCallback(
    (groupId: string, groupName: string) => {
      fetchGroupData(groupId, groupName);
    },
    [fetchGroupData]
  );

  const refreshCurrentGroup = useCallback(() => {
    if (selectedGroup) {
      fetchGroupData(selectedGroup._id, selectedGroup.name);
    }
  }, [selectedGroup, fetchGroupData]);

  const handleBack = useCallback(() => {
    setSelectedGroup(null);
  }, []);

  return {
    selectedGroup,
    loadingStudents,
    handleGroupSelect,
    refreshCurrentGroup,
    handleBack,
  };
};
