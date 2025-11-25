import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { LoggedInUser, Student } from "../types/types";
import { getStudentsByTeacher } from "@/Api/studentApi";
import { getGroupsByTeacherIdWithFilters } from "@/Api/groupApi";

/**
 * Custom hook for loading basic daily marks data
 * Handles fetching user, students, and teacher groups
 * Note: Sections and marks are now fetched via useFilteredMarksData hook
 */
export const useDailyMarksData = () => {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch current user and initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user from localStorage
        const userJson = localStorage.getItem("user");

        if (!userJson) {
          // If no user is logged in, redirect to login page
          navigate("/login");
          return;
        }

        const user = JSON.parse(userJson);
        setCurrentUser(user);

        // If user is a teacher, fetch students by teacher name and teacher's groups
        if (user.role === "teacher" || user.role === "admin") {
          const teacherName = `${user.firstName} ${user.lastName}`;

          // Fetch ALL groups for this teacher (with or without students)
          const groupsResponse = await getGroupsByTeacherIdWithFilters(
            user._id,
            'all', // جلب كل الحلقات سواء فيها طلاب أو فارغة
            false  // لا نحتاج معلومات الطلاب هنا
          );

          if (groupsResponse.success && groupsResponse.data?.groups) {
            const groups = groupsResponse.data.groups.map((g) => g.name);
            setTeacherGroups(groups);
            console.log("📚 Teacher groups (all):", groups);
            console.log("📊 Groups summary:", groupsResponse.data.summary);
          }

          // Fetch students
          const studentsResponse = await getStudentsByTeacher(teacherName);
          const students =
            studentsResponse.success && Array.isArray(studentsResponse.data)
              ? studentsResponse.data
              : [];
          setStudents(students);
          console.log("👥 Loaded students:", students);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return {
    currentUser,
    students,
    teacherGroups,
    loading,
  };
};
