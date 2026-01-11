import api from "./api";
import {
  Exam,
  Mark,
  ExamFormData,
  MarksFormData,
  ExamWithMarks,
  StudentExamResult,
} from "@/types/exam.types";

// ======= Student APIs =======
export const getStudentExams = async (): Promise<StudentExamResult[]> => {
  const response = await api.get("/exam-schedule/my-exams");
  return response.data.data;
};

// ======= Teacher APIs =======
export const getTeacherExams = async (): Promise<ExamWithMarks[]> => {
  const response = await api.get("/exam-schedule/");
  return response.data.data;
};

export const createExam = async (examData: ExamFormData): Promise<Exam> => {
  const response = await api.post("/exam-schedule/", examData);
  return response.data.data;
};

export const updateExam = async (
  examId: string,
  examData: Partial<ExamFormData>
): Promise<Exam> => {
  const response = await api.put(`/exam-schedule/${examId}`, examData);
  return response.data.data;
};

export const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/exam-schedule/${examId}`);
};

export const getExamMarks = async (examId: string): Promise<Mark[]> => {
  const response = await api.get(`/exam-schedule/${examId}/marks`);
  return response.data.data;
};

export const addOrUpdateMark = async (
  examId: string,
  studentId: string,
  mark: number
): Promise<Mark> => {
  const response = await api.post(
    `/exam-schedule/${examId}/marks/${studentId}`,
    { mark }
  );
  return response.data.data;
};

export const deleteMark = async (
  examId: string,
  studentId: string
): Promise<void> => {
  await api.delete(`/exam-schedule/${examId}/marks/${studentId}`);
};

// ======= Admin APIs =======
export const getAdminExams = async (): Promise<ExamWithMarks[]> => {
  const response = await api.get("/exam-schedule/");
  return response.data.data;
};
