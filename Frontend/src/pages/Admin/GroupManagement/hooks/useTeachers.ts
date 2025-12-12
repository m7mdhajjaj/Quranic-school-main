import { useState, useCallback, useRef, useMemo } from "react";
import { getAllTeachers } from "@/Api/teacherApi";
import type { Group } from "../types";

export const useTeachers = (groups: Group[]) => {
  const [allTeachers, setAllTeachers] = useState<string[]>([]);
  const teachersFetched = useRef(false);

  // Fetch all teachers for filter dropdown
  const fetchTeachers = useCallback(async () => {
    if (teachersFetched.current) return;

    try {
      const result = await getAllTeachers();

      if (result.success && result.data && Array.isArray(result.data)) {
        if (result.data.length === 0) {
          teachersFetched.current = true;
          return;
        }

        const teacherNames = result.data
          .map((teacher: any) => {
            if (teacher.name) return teacher.name;
            if (teacher.firstName && teacher.lastName) {
              return `${teacher.firstName} ${teacher.lastName}`;
            }
            if (teacher.firstName) return teacher.firstName;
            return null;
          })
          .filter(Boolean)
          .sort();

        setAllTeachers(teacherNames);
        teachersFetched.current = true;
      } else {
        teachersFetched.current = true;
      }
    } catch (error) {
      teachersFetched.current = true;
    }
  }, []);

  // Fallback: Use teachers from groups if API returns empty
  const fallbackToGroupTeachers = useCallback(() => {
    if (
      teachersFetched.current &&
      allTeachers.length === 0 &&
      groups.length > 0
    ) {
      const teachersFromGroups = [
        ...new Set(groups.map((g) => g.teacher).filter(Boolean)),
      ].sort();
      if (teachersFromGroups.length > 0) {
        setAllTeachers(teachersFromGroups);
      }
    }
  }, [allTeachers.length, groups]);

  return useMemo(() => ({
    allTeachers,
    fetchTeachers,
    fallbackToGroupTeachers,
  }), [allTeachers, fetchTeachers, fallbackToGroupTeachers]);
};
