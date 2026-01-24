import { useState, useMemo, useCallback } from "react";
import type { Section, Mark, Student } from "../../../types/types";
import { getSectionMarks } from "@/Api/DailyMark/dailyMarksApi";
import { getStudentsByGroup } from "@/Api/studentApi";

/**
 * Custom hook مدمج لإدارة بيانات TeacherView
 * يجمع: section selection, student filtering, data fetching
 * @param selectedGroup - اسم الحلقة المحددة
 * @param studentsFromParent - قائمة الطلاب من الـ parent (اختياري - لمساعد المدرس)
 */
export const useTeacherViewData = (selectedGroup: string, studentsFromParent?: Student[]) => {
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
   * ✅ محسّن: جلب متوازي للطلاب والعلامات
   */
  const handleSectionSelect = async (section: Section) => {
    setSelectedSection(section);
    setLoadingSectionData(true);
    
    try {
      // ✅ جلب الطلاب والعلامات بشكل متوازي لتحسين الأداء
      const studentsPromise = (studentsFromParent && studentsFromParent.length > 0)
        ? Promise.resolve({ success: true, data: studentsFromParent.filter(s => s.group === selectedGroup) })
        : getStudentsByGroup(selectedGroup);
      
      const marksPromise = getSectionMarks(section._id);
      
      const [studentsResult, marksResponse] = await Promise.all([studentsPromise, marksPromise]);
      
      if (studentsResult.success && studentsResult.data) {
        setSectionStudents(studentsResult.data);
      }
      
      if (marksResponse.success && marksResponse.data) {
        setSectionMarks(marksResponse.data);
      }
    } catch {
      // Silent error handling
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
   * CRITICAL: Uses String() comparison to handle both string IDs and populated objects
   */
  const tableData = useMemo(() => {
    // Helper to safely extract student ID
    const getStudentId = (studentId: string | { _id: string } | null | undefined): string | null => {
      if (!studentId) return null;
      return typeof studentId === "string" ? studentId : studentId._id;
    };

    return filteredStudents.map((student) => {
      const mark = sectionMarks.find((m) => {
        if (!m || !m.studentId) return false;
        
        const markStudentId = getStudentId(m.studentId);
        const targetStudentId = student._id;
        
        // Use String() comparison for safety and log mismatches
        return String(markStudentId) === String(targetStudentId);
      });

      return {
        student,
        mark,
        _id: student._id, // للاستخدام في key
      };
    });
  }, [filteredStudents, sectionMarks]);

  /**
   * تحديث علامة في الحالة المحلية
   */
  const updateMarkInState = useCallback((updatedMark: Mark) => {
    setSectionMarks((prev) => {
      const exists = prev.some((m) => m._id === updatedMark._id);
      if (exists) {
        return prev.map((m) => (m._id === updatedMark._id ? updatedMark : m));
      }
      return [...prev, updatedMark];
    });
  }, []);

  return {
    // Section Selection
    selectedSection,
    sectionStudents,
    sectionMarks,
    loadingSectionData,
    handleSectionSelect,
    refetchSectionData,
    clearSectionSelection,
    updateMarkInState, // Export this
    
    // Student Filtering
    studentSearchQuery,
    setStudentSearchQuery,
    filteredStudents,
    tableData,
  };
};
