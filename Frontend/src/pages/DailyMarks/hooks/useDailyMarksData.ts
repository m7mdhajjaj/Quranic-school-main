import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { LoggedInUser, Student } from "../types/types";
import { getStudentsByTeacher } from "@/Api/studentApi";
import { getActiveGroups } from "@/Api/DailyMark/dailyMarksApi";

interface UseDailyMarksDataReturn {
  currentUser: LoggedInUser | null;
  students: Student[];
  teacherGroups: string[];
  loading: boolean;
}

/**
 * Custom hook for loading basic daily marks data
 * 
 * @description
 * - Fetches user data from localStorage
 * - Loads students and teacher groups
 * - Handles authentication and redirects
 * - Note: Sections and marks are fetched via useFilteredMarksData hook
 * 
 * @returns {UseDailyMarksDataReturn} User data, students, groups, and loading state
 */
export const useDailyMarksData = (): UseDailyMarksDataReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch current user and initial data on component mount (only once)
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user from localStorage
        const userJson = localStorage.getItem("user");

        if (!userJson) {
          // Only redirect if we haven't redirected before and we're actually on this page (not navigating back)
          if (isMounted && !hasRedirected.current && location.pathname.includes("/daily-marks")) {
            hasRedirected.current = true;
            // Use replace: false to allow browser back button to work correctly
            navigate("/login", { replace: false });
          }
          return;
        }

        let user;
        try {
          user = JSON.parse(userJson);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          if (isMounted && !hasRedirected.current && location.pathname.includes("/daily-marks")) {
            hasRedirected.current = true;
            // Use replace: false to allow browser back button to work correctly
            navigate("/login", { replace: false });
          }
          return;
        }

        if (!isMounted) return;

        setCurrentUser(user);

        // If user is a teacher, fetch students by teacher name and teacher's groups
        if (user.role === "teacher" || user.role === "admin") {
          const teacherName = `${user.firstName} ${user.lastName}`;

          // 🆕 استخدام API الحلقات النشطة فقط من daily-marks endpoint
          const groupsResponse = await getActiveGroups(user._id, "basic");

          if (!isMounted) return;

          if (groupsResponse.success && groupsResponse.data) {
            const groups = groupsResponse.data.map((g: any) => g.name);
            setTeacherGroups(groups);
          } else {
            console.error("❌ [DailyMarks] Failed to load groups:", groupsResponse.message || groupsResponse.error);
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
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        // Don't redirect on error, just log it
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]); // Add dependencies per React Hook warning

  return {
    currentUser,
    students,
    teacherGroups,
    loading,
  };
};
