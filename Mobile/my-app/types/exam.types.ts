export interface Exam {
  _id: string;
  name: string;
  date: string;
  examType: "تحريري" | "شفهي";
  subject: string;
  totalMarks: number;
  groups: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  marksEntered?: boolean;
}

export interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  username?: string;
  group?: {
    _id: string;
    name: string;
  };
}

export interface Mark {
  _id: string;
  exam: string | Exam;
  student: string | Student;
  mark: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamWithMarks extends Exam {
  averageMark?: number;
  totalStudents?: number;
}

export interface StudentExamResult {
  exam: Exam;
  mark?: Mark;
  status: "graded" | "pending" | "not-graded";
}

export interface ExamFilters {
  query: string;
  dateFilter: string;
  typeFilter: string;
  marksFilter: string;
}

export interface MarksFormData {
  studentId: string;
  mark: number;
}

export interface ExamFormData {
  name: string;
  date: string;
  examType: "تحريري" | "شفهي";
  subject: string;
  totalMarks: number;
  groups: string[];
}
