import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/Context/AuthContext";
import { getStudentExams, getTeacherExams, getAdminExams } from "@/Api/examApi";
import {
  Exam,
  ExamWithMarks,
  StudentExamResult,
  ExamFilters,
} from "@/types/exam.types";
import { Alert } from "react-native";

export const useExamData = (filters: ExamFilters) => {
  const { user } = useAuth();
  const role = user?.role || "student";

  const [exams, setExams] = useState<
    ExamWithMarks[] | StudentExamResult[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      let data;

      if (role === "student") {
        data = await getStudentExams();
      } else if (role === "teacher") {
        data = await getTeacherExams();
      } else if (role === "admin") {
        data = await getAdminExams();
      }

      setExams(data || []);
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error?.response?.data?.message || "حدث خطأ في التحميل"
      );
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // تطبيق الفلاتر
  const filteredExams = exams
    ? exams.filter((item: any) => {
        const exam = "exam" in item ? item.exam : item;

        // فلتر البحث
        if (
          filters.query &&
          !exam.name.toLowerCase().includes(filters.query.toLowerCase()) &&
          !exam.subject.toLowerCase().includes(filters.query.toLowerCase())
        ) {
          return false;
        }

        // فلتر التاريخ
        if (filters.dateFilter === "upcoming") {
          const examDate = new Date(exam.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (examDate < today) return false;
        } else if (filters.dateFilter === "past") {
          const examDate = new Date(exam.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (examDate >= today) return false;
        }

        // فلتر النوع
        if (filters.typeFilter && exam.examType !== filters.typeFilter) {
          return false;
        }

        // فلتر العلامات (للمعلمين فقط)
        if (role === "teacher" && filters.marksFilter) {
          if (filters.marksFilter === "entered" && !exam.marksEntered)
            return false;
          if (filters.marksFilter === "not-entered" && exam.marksEntered)
            return false;
        }

        return true;
      })
    : [];

  return {
    exams: filteredExams,
    loading,
    refetch: fetchExams,
  };
};
