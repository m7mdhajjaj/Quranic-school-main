// ============================================================================
// Student Types - أنواع بيانات الطلاب
// ============================================================================

export interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  idNumber: string;
  email?: string;
  phoneNumber: string;
  birthDate: string | Date;
  age?: number;
  gender: string;
  residence: string;
  teacher: string;
  teacherFullName?: string;
  group: string;
  avatar?: {
    url?: string;
    publicId?: string;
    data?: Buffer;
    contentType?: string;
  };
  isActive: boolean;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  idNumber: string;
  email?: string;
  phoneNumber: string;
  birthDate: string;
  gender: "ذكر" | "أنثى" | null;
  residence: string;
  teacher: string;
  group: string;
  password?: string;
}

export interface StudentsStats {
  total: number;
  active: number;
  inactive: number;
  male: number;
  female: number;
  avgAge: number | string;
}

export interface StudentsQueryParams {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  group?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
