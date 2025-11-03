// hooks/useTeacherGroups.ts
import { useState, useEffect } from "react";
import type { LoggedInUser } from "../types/absence.types";
import {
  getTeacherPossibleNames,
  isTeacherMatch,
} from "../utils/teacherHelpers";

export const useTeacherGroups = (currentUser: LoggedInUser | null) => {
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeacherGroups = async () => {
      if (!currentUser || currentUser.role !== "teacher") {
        setTeacherGroups([]);
        return;
      }

      try {
        console.log("🔍 جلب حلقات المعلم من Groups API...");

        const { getAllGroups } = await import("../../../Api/groupApi");
        const groupsRes = await getAllGroups();

        if (!groupsRes.success || !Array.isArray(groupsRes.data)) {
          console.error("❌ فشل في جلب الحلقات");
          setTeacherGroups([]);
          return;
        }

        const possibleNames = getTeacherPossibleNames(currentUser);
        console.log("📋 أسماء المعلم المحتملة:", possibleNames);
        console.log("📊 إجمالي الحلقات في النظام:", groupsRes.data.length);

        const teacherGroupsData = groupsRes.data.filter((group: any) => {
          if (!group.teacher) return false;
          const isMatch = isTeacherMatch(group.teacher, possibleNames);
          if (isMatch) {
            console.log(
              `✅ حلقة مطابقة: ${group.name} - معلمها: ${group.teacher}`
            );
          }
          return isMatch;
        });

        const groupNames = teacherGroupsData
          .map((g: any) => g.name)
          .sort((a: string, b: string) => a.localeCompare(b, "ar"));
        console.log(`📋 حلقات المعلم النهائية:`, groupNames);
        setTeacherGroups(groupNames);
      } catch (error) {
        console.error("خطأ في جلب حلقات المعلم:", error);
        setTeacherGroups([]);
      }
    };

    fetchTeacherGroups();
  }, [currentUser]);

  return teacherGroups;
};
