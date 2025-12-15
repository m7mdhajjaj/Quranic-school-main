import { useState, useMemo, useCallback } from "react";
import type { Section, Mark, Student } from "../../../types/types";
import { getSectionMarks } from "@/Api/dailyMarksApi";
import { getStudentsByGroup } from "@/Api/studentApi";

/**
 * Custom hook مدمج لإدارة بيانات TeacherView
 * يجمع: section selection, student filtering, data fetching
 */
export const useTeacherViewData = (selectedGroup: string) => {
  // ============ Section Selection State ============
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [sectionStudents, setSectionStudents] = useState<Student[]>([]);
  const [sectionMarks, setSectionMarks] = useState<Mark[]>([]);
  const [loadingSectionData, setLoadingSectionData] = useState(false);

  // ============ Student Search State ============
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");

  // ============ Section Selection Logic ============
  
  /**
   * جلب بيانات المقطع (الطلاب والعلامات)
   */
  const handleSectionSelect = async (section: Section) => {
    setSelectedSection(section);
    setLoadingSectionData(true);
    
    try {
      // Fetch students in the group
      const studentsResponse = await getStudentsByGroup(selectedGroup);
      if (studentsResponse.success && studentsResponse.data) {
        setSectionStudents(studentsResponse.data);
      }

      // Fetch marks for this section
      const marksResponse = await getSectionMarks(section._id);
      if (marksResponse.success && marksResponse.data) {
        setSectionMarks(marksResponse.data);
      }
    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setLoadingSectionData(false);
    }
  };

  /**
   * إعادة جلب علامات المقطع الحالي
   */
  const refetchSectionData = useCallback(async () => {
    if (!selectedSection) return;
    
    try {
      const marksResponse = await getSectionMarks(selectedSection._id);
      if (marksResponse.success && marksResponse.data) {
        setSectionMarks(marksResponse.data);
      }
    } catch (error) {
      console.error('Error refetching section marks:', error);
    }
  }, [selectedSection]);

  /**
   * إلغاء اختيار المقطع والعودة لقائمة المقاطع
   */
  const clearSectionSelection = () => {
    setSelectedSection(null);
    setSectionStudents([]);
    setSectionMarks([]);
    setStudentSearchQuery(""); // مسح البحث عند الرجوع
  };

  // ============ Student Filtering Logic ============
  
  /**
   * فلترة الطلاب بناءً على البحث
   */
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) {
      return sectionStudents;
    }

    const query = studentSearchQuery.trim().toLowerCase();
    return sectionStudents.filter((student) => {
      const firstName = (student.firstName || "").toLowerCase();
      const fatherName = (student.fatherName || "").toLowerCase();
      const lastName = (student.lastName || "").toLowerCase();
      const fullName = `${firstName} ${fatherName} ${lastName}`.trim();
      
      return fullName.includes(query) || 
             firstName.includes(query) || 
             fatherName.includes(query) || 
             lastName.includes(query);
    });
  }, [sectionStudents, studentSearchQuery]);

  /**
   * تحضير بيانات الجدول (طلاب + علامات)
   */
  const tableData = useMemo(() => {
    return filteredStudents.map((student) => {
      const mark = sectionMarks.find((m) => {
        if (!m || !m.studentId) return false;
        const studentId = typeof m.studentId === "string" ? m.studentId : m.studentId._id;
        return studentId === student._id;
      });

      return {
        student,
        mark,
        _id: student._id, // للاستخدام في key
      };
    });
  }, [filteredStudents, sectionMarks]);

  return {
    // Section Selection
    selectedSection,
    sectionStudents,
    sectionMarks,
    loadingSectionData,
    handleSectionSelect,
    refetchSectionData,
    clearSectionSelection,
    
    // Student Filtering
    studentSearchQuery,
    setStudentSearchQuery,
    filteredStudents,
    tableData,
  };
};
