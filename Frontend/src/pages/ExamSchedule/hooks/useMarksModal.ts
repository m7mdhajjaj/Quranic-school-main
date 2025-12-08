import { useEffect, useRef, useState } from 'react';
import { getAllStudents } from "@/Api/studentApi";
import { getExamMarks, type Exam, type ExamMark, type StudentDoc } from "@/Api/ExamShedule";

export function useMarksModal() {
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [marks, setMarks] = useState<Record<string, { mark: string; detail: string }>>({});

  const abortRef = useRef<AbortController | null>(null);

  const fillMarksFromApi = (rows: ExamMark[]) => {
    const obj: Record<string, { mark: string; detail: string }> = {};
    rows.forEach((r) => {
      const student = r.student as StudentDoc;
      const sid = String(student?._id ?? r.student);
      obj[sid] = { mark: String(r.mark ?? ''), detail: String(r.detail ?? '') };
    });
    setMarks(obj);
  };

  useEffect(() => {
    if (!showMarkModal || !selectedExam) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        setLoadingStudents(true);
        const examId = String(selectedExam._id ?? selectedExam.id);

        // 1) الطلاب
        const studentResponse = await getAllStudents();
        let sData = studentResponse.success ? studentResponse.data || [] : [];

        // فلترة الطلاب حسب حلقة الامتحان المحدد
        if (selectedExam.group) {
          sData = sData.filter((student: { group?: string }) => student.group === selectedExam.group);
        }

        if (!ac.signal.aborted) setStudents(Array.isArray(sData) ? sData : []);

        // 2) العلامات الحالية
        try {
          const mData: ExamMark[] = await getExamMarks(examId);
          if (!ac.signal.aborted && Array.isArray(mData)) fillMarksFromApi(mData);
        } catch {
          // لا يوجد علامات بعد
        }
      } catch (error) {
        console.error('Error fetching students or marks:', error);
        if (!ac.signal.aborted) setStudents([]);
      } finally {
        if (!ac.signal.aborted) setLoadingStudents(false);
      }
    })();

    return () => ac.abort();
  }, [showMarkModal, selectedExam]);

  const closeAndReset = () => {
    setShowMarkModal(false);
    setMarks({});
    setSelectedExam(null);
  };

  return {
    showMarkModal,
    setShowMarkModal,
    selectedExam,
    setSelectedExam,
    students,
    loadingStudents,
    marks,
    setMarks,
    closeAndReset,
  } as const;
}
