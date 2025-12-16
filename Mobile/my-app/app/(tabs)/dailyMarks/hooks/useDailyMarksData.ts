import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudentsByTeacher, Student } from "@/Api/studentApi";
import { getActiveGroups } from "@/Api/dailyMarksApi";

interface UseDailyMarksDataReturn {
  students: Student[];
  teacherGroups: string[];
  loading: boolean;
}

/**
 * Custom hook for loading basic daily marks data
 *
 * @description
 * - Loads students and teacher groups for teachers
 * - Handles data fetching for initial page load
 *
 * @returns User data, students, groups, and loading state
 */
export const useDailyMarksData = (): UseDailyMarksDataReturn => {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // If user is a teacher, fetch students and groups
        if (currentUser.role === "teacher" || currentUser.role === "admin") {
          const teacherName = `${currentUser.firstName} ${currentUser.lastName}`;

          // Fetch active groups
          console.log(
            "🔄 [DailyMarks] Fetching active groups for teacher:",
            currentUser._id
          );
          const groupsResponse = await getActiveGroups(
            currentUser._id,
            "basic"
          );
          console.log("📥 [DailyMarks] Groups response:", groupsResponse);

          if (!isMounted) return;

          if (groupsResponse.success && groupsResponse.data) {
            const groups = groupsResponse.data.map((g: any) => g.name);
            setTeacherGroups(groups);
            console.log("✅ [DailyMarks] Active groups loaded:", groups);
          } else {
            console.error(
              "❌ [DailyMarks] Failed to load groups:",
              groupsResponse.message || groupsResponse.error
            );
            setTeacherGroups([]);
          }

          // Fetch students
          const studentsResponse = await getStudentsByTeacher(teacherName);

          if (!isMounted) return;

          const students =
            studentsResponse.success && Array.isArray(studentsResponse.data)
              ? studentsResponse.data
              : [];
          setStudents(students);
          console.log("👥 Loaded students:", students);
        }
      } catch (err) {
        console.error("Error fetching daily marks data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return {
    students,
    teacherGroups,
    loading,
  };
};
