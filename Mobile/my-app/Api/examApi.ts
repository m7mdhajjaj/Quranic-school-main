import api from "./api";
import {
  Exam,
  Mark,
  ExamFormData,
  MarksFormData,
  ExamWithMarks,
  StudentExamResult,
  TeacherGroup,
  TeacherGroupsResponse,
} from "@/types/exam.types";

// ======= Student APIs =======
export const getStudentExams = async (): Promise<StudentExamResult[]> => {
  const response = await api.get("/exam-schedule/my-exams");
  // الـ Backend يُرجع المصفوفة مباشرة أو داخل data
  const rawExams = response.data.data || response.data || [];

  // تحويل البيانات للصيغة المتوقعة من StudentView
  // الباك إند يُرجع: [{ _id, name, date, marks: [...], ... }]
  // الموبايل يتوقع: [{ exam: {...}, mark: {...}, status: '...' }]
  return rawExams.map((examData: any) => {
    const isPast = new Date(examData.date) < new Date();
    // البحث عن علامة الطالب الحالي (ستكون undefined إذا لم توجد)
    const studentMark = examData.marks?.find((m: any) => m.student) || null;

    // تحديد الحالة
    let status: "graded" | "pending" | "not-graded" = "not-graded";
    if (studentMark) {
      status = "graded";
    } else if (!isPast) {
      status = "pending";
    }

    return {
      exam: {
        _id: examData._id,
        name: examData.name,
        date: examData.date,
        time: examData.time || "09:00",
        subject: examData.subject || "",
        examType: examData.type || examData.examType || "شفهي",
        duration: examData.duration ?? 60,
        totalMarks: examData.totalMarks ?? 20,
        passingMarks: examData.passingMarks ?? 10,
        group: examData.group,
        marks: examData.marks || [],
        createdBy: examData.createdBy,
        createdAt: examData.createdAt,
        updatedAt: examData.updatedAt,
      },
      mark: studentMark
        ? {
            _id: studentMark._id,
            student: studentMark.student?._id || studentMark.student,
            mark: studentMark.mark,
            date: studentMark.date || studentMark.createdAt,
          }
        : undefined,
      status,
    };
  });
};

// ======= Teacher APIs =======
export const getTeacherExams = async (): Promise<ExamWithMarks[]> => {
  const response = await api.get("/exam-schedule/my-exams");
  // الـ Backend يُرجع المصفوفة مباشرة أو داخل data
  return response.data.data || response.data;
};

export const createExam = async (examData: ExamFormData): Promise<Exam> => {
  // تحويل البيانات لصيغة الباك إند
  const payload = {
    name: examData.name,
    date: examData.date,
    time: examData.time,
    subject: examData.subject,
    type: examData.examType, // تحويل examType إلى type
    duration: examData.duration,
    totalMarks: examData.totalMarks,
    passingMarks: examData.passingMarks,
    group: examData.groups[0], // إرسال الحلقة الأولى (الباك إند يتوقع group واحدة)
  };
  console.log("📤 Creating exam with payload:", payload);
  const response = await api.post("/exam-schedule/", payload);
  return response.data.data || response.data;
};

export const updateExam = async (
  examId: string,
  examData: Partial<ExamFormData>
): Promise<Exam> => {
  // تحويل البيانات لصيغة الباك إند
  const payload: any = { ...examData };
  if (examData.examType) {
    payload.type = examData.examType;
    delete payload.examType;
  }
  if (examData.groups && examData.groups.length > 0) {
    payload.group = examData.groups[0];
    delete payload.groups;
  }
  const response = await api.put(`/exam-schedule/${examId}`, payload);
  return response.data.data || response.data;
};

export const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/exam-schedule/${examId}`);
};

export const getExamMarks = async (examId: string): Promise<Mark[]> => {
  const response = await api.get(`/exam-schedule/marks/${examId}`);
  return response.data.data || response.data;
};

export const addOrUpdateMark = async (
  examId: string,
  studentId: string,
  mark: number
): Promise<Mark> => {
  const response = await api.post(
    `/exam-schedule/marks/${examId}/${studentId}`,
    { mark }
  );
  return response.data.data || response.data;
};

export const deleteMark = async (
  examId: string,
  studentId: string
): Promise<void> => {
  await api.delete(`/exam-schedule/marks/${examId}/${studentId}`);
};

// ======= Admin APIs =======
export const getAdminExams = async (): Promise<ExamWithMarks[]> => {
  const response = await api.get("/exam-schedule/my-exams");
  return response.data.data || response.data;
};

// ======= Marks Management APIs =======

/**
 * Get teacher's groups with students for marks management
 * @route GET /api/exam-schedule/marks/teacher-groups
 */
export const getTeacherGroupsForMarks =
  async (): Promise<TeacherGroupsResponse> => {
    const response = await api.get("/exam-schedule/marks/teacher-groups");
    return response.data;
  };

/**
 * Get all exams (with optional group filter)
 * @route GET /api/exam-schedule
 */
export const getAllExams = async (params?: {
  group?: string;
}): Promise<Exam[]> => {
  const response = await api.get("/exam-schedule", { params });
  return response.data.data || response.data;
};

/**
 * Add mark for a student
 * @route POST /api/exam-schedule/marks
 */
export const addMark = async (data: {
  examId: string;
  studentId: string;
  mark: number;
}): Promise<Mark> => {
  const response = await api.post("/exam-schedule/marks", data);
  return response.data.mark || response.data;
};

/**
 * Update existing mark
 * @route PUT /api/exam-schedule/marks/:markId
 */
export const updateMark = async (
  markId: string,
  mark: number
): Promise<Mark> => {
  const response = await api.put(`/exam-schedule/marks/${markId}`, { mark });
  return response.data;
};

/**
 * Delete single mark
 * @route DELETE /api/exam-schedule/marks/:markId
 */
export const deleteMarkById = async (markId: string): Promise<void> => {
  await api.delete(`/exam-schedule/marks/${markId}`);
};

/**
 * Bulk delete marks
 * @route POST /api/exam-schedule/marks/bulk-delete
 */
export const bulkDeleteMarks = async (data: {
  examId: string;
  studentIds: string[];
}): Promise<void> => {
  await api.post("/exam-schedule/marks/bulk-delete", data);
};
