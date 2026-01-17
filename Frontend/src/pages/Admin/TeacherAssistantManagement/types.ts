// Types for Teacher Assistant Management

export interface TeacherAssistant {
  _id: string;
  assistantId: number;
  // الأسماء
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  // الهوية والتواصل
  idNumber: string;
  email: string;
  phoneNumber: string;
  password?: string;
  // البيانات الشخصية
  birthDate: string;
  age?: number;
  gender: "male" | "female" | "ذكر" | "أنثى";
  residence: string;
  // الصورة الشخصية
  avatar?: {
    url?: string;
    publicId?: string;
  };
  hasAvatar?: boolean;
  // العلاقات
  assignedTeacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    teacherId: number;
  } | null;
  allowedGroups?: Array<{
    _id: string;
    name: string;
  }>;
  // الحالة
  lastSeen?: Date;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SortField = "assistantId" | "firstName" | "age" | "email";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";
export type GenderFilter = "all" | "ذكر" | "أنثى";

export interface TeacherAssistantFiltersParams {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface TeacherAssistantStats {
  total: number;
  male: number;
  female: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
}
