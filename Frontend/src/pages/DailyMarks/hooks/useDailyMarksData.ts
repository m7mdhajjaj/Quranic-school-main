import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { LoggedInUser, Student, Section, Mark, UseDailyMarksDataResult } from "../types/dailyMarks";
import { getStudentsByTeacher } from "../../../Api/studentApi";
import { getTeacherById } from "../../../Api/teacherApi";
import { getAllSections } from "../../../Api/sectionApi";
import { getStudentMarks } from "../../../Api/dailyMarksApi";

/**
 * Custom hook for loading and managing daily marks data
 * Handles fetching user, students, sections, and marks based on role
 */
export const useDailyMarksData = (selectedStudentId: string | null, selectedGroup: string): UseDailyMarksDataResult => {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);

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

        // Fetch sections based on user role
        const sectionsData = await getAllSections();

        // If user is a student, filter sections by their group
        if (user.role === "student") {
          const userGroup = user.group;
          const filteredSections = Array.isArray(sectionsData)
            ? sectionsData.filter((s: Section) => s.group === userGroup)
            : [];
          setSections(filteredSections);
          console.log(
            "Loaded sections for student's group:",
            userGroup,
            filteredSections
          );
        } else {
          // For teachers/admins, sections will be filtered later by selected group
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
        }

        // If user is a teacher, fetch students by teacher name and teacher's groups
        if (user.role === "teacher" || user.role === "admin") {
          const teacherName = `${user.firstName} ${user.lastName}`;

          // Fetch teacher's full details to get groups
          const teacherResponse = await getTeacherById(user._id);
          if (teacherResponse.success && teacherResponse.data?.groups) {
            const groups = teacherResponse.data.groups.map((g: { name: string }) => g.name);
            setTeacherGroups(groups);
            console.log("Teacher groups:", groups);
          }

          // Fetch students
          const studentsResponse = await getStudentsByTeacher(teacherName);
          const students =
            studentsResponse.success && Array.isArray(studentsResponse.data)
              ? studentsResponse.data
              : [];
          setStudents(students);
          console.log("Loaded students:", students);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Fetch sections for selected group (only for teachers/admins)
  useEffect(() => {
    const fetchSectionsForGroup = async () => {
      if (!selectedGroup || !currentUser) return;

      // Only fetch sections for teachers/admins, students already have their sections filtered
      if (currentUser.role !== "teacher" && currentUser.role !== "admin")
        return;

      try {
        const sectionsData = await getAllSections();

        // Filter sections by group - only show sections for the selected group
        const filteredSections = Array.isArray(sectionsData)
          ? sectionsData.filter((s: Section) => s.group === selectedGroup)
          : [];

        setSections(filteredSections);
        console.log(
          "Loaded sections for group:",
          selectedGroup,
          filteredSections
        );
      } catch (err) {
        console.error("Error fetching sections for group:", err);
      }
    };

    fetchSectionsForGroup();
  }, [selectedGroup, currentUser]);

  // Function to refetch marks - memoized to prevent infinite loops
  const refetchMarks = useCallback(async (studentId?: string) => {
    if (!currentUser) return;

    setLoadingMarks(true);
    try {
      if (currentUser.role === "student") {
        // For students, fetch only their marks
        const response = await getStudentMarks(currentUser._id);
        setMarks(response.success && response.data ? response.data : []);
      } else if (studentId) {
        // For teachers with selected student
        const response = await getStudentMarks(studentId);
        setMarks(response.success && response.data ? response.data : []);
      } else {
        // For teachers initially, don't fetch any marks until a student is selected
        setMarks([]);
      }
    } catch (err) {
      console.error("Error fetching marks:", err);
      setMarks([]); // Clear marks on error
    } finally {
      setLoadingMarks(false);
    }
  }, [currentUser]); // Only recreate when currentUser changes

  // Fetch marks based on user role
  useEffect(() => {
    refetchMarks(selectedStudentId || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedStudentId]);

  return {
    currentUser,
    students,
    sections,
    marks,
    teacherGroups,
    loading,
    loadingMarks,
    setMarks,
    setSections,
    refetchMarks,
  };
};
