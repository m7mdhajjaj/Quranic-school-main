// ============================================================================
// Teacher Types - أنواع بيانات المعلمين
// ============================================================================

export interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber?: string;
  email: string;
  phoneNumber: string;
  birthDate?: string | Date;
  age?: number;
  gender?: string;
  residence?: string;
  groups?: {
    id: string;
    name: string;
    number?: number;
  }[];
  avatar?: {
    url?: string;
    publicId?: string;
    data?: Buffer;
    contentType?: string;
  };
  role: string;
  isActive: boolean;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: "ذكر" | "أنثى" | null;
  residence: string;
  password?: string;
}

export interface TeachersStats {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;
  teachersWithGroups: number;
  teachersWithoutGroups: number;
  averageAge?: number;
}

export interface TeachersQueryParams {
  search?: string;
  gender?: string;
  isActive?: boolean;
  hasGroups?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  showing: number;
}
// heellkdasldkasdasd