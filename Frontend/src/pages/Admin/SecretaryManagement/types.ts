// Access Level Type
export type AccessLevel = 'none' | 'view' | 'manage';

// Secretary Permissions Interface
export interface SecretaryPermissions {
  // صلاحية الحلقات: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  groupsAccess?: AccessLevel;
  // صلاحية المعلمين: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  teachersAccess?: AccessLevel;
  // صلاحية الطلاب: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  studentsAccess?: AccessLevel;
  // صلاحية الجدول: none = بدون وصول, view = عرض فقط (لا يوجد manage)
  timetableAccess?: 'none' | 'view';
}

// Secretary Interface - متطابق مع الـ Backend Schema
export interface Secretary {
  _id: string;
  secretaryId: number;
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
  // الصلاحيات والحالة
  lastSeen?: Date;
  permissions: SecretaryPermissions;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SortField = "secretaryId" | "firstName" | "age" | "email";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";
export type GenderFilter = "all" | "ذكر" | "أنثى";

export interface SecretaryFiltersParams {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// إحصائيات السكرتيرين - تأتي من الباك إند مباشرة
export interface SecretaryStats {
  total: number;
  male: number;
  female: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
}
