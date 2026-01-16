// ============================================================================
// Secretary Types - أنواع بيانات السكرتير
// ============================================================================

// Access Level Type - مستويات الصلاحيات
export type AccessLevel = "none" | "view" | "manage";

// Secretary Permissions Interface - صلاحيات السكرتير
export interface SecretaryPermissions {
  // صلاحية الحلقات: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  groupsAccess?: AccessLevel;
  // صلاحية المعلمين: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  teachersAccess?: AccessLevel;
  // صلاحية الطلاب: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  studentsAccess?: AccessLevel;
}

// Secretary Interface - واجهة السكرتير
export interface Secretary {
  _id: string;
  secretaryId: number;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  password?: string;
  birthDate: string | Date;
  age?: number;
  gender: "male" | "female" | "ذكر" | "أنثى";
  residence: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  hasAvatar?: boolean;
  lastSeen?: Date | string;
  permissions: SecretaryPermissions;
  fullName?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Secretary Form Data - بيانات نموذج السكرتير
export interface SecretaryFormData {
  secretaryId?: number;
  password?: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  age?: number;
  gender: "ذكر" | "أنثى" | null;
  residence: string;
  permissions?: SecretaryPermissions;
}

// Secretary Stats - إحصائيات السكرتير
export interface SecretaryStats {
  total: number;
  male: number;
  female: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
}

// Secretary Filters - فلاتر البحث
export interface SecretaryFilters {
  search?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Default permissions - الصلاحيات الافتراضية
export const defaultPermissions: SecretaryPermissions = {
  groupsAccess: "none",
  teachersAccess: "none",
  studentsAccess: "none",
};

// Initial form data - البيانات الأولية للنموذج
export const initialSecretaryFormData: SecretaryFormData = {
  firstName: "",
  lastName: "",
  fatherName: "",
  grandFatherName: "",
  motherName: "",
  idNumber: "",
  email: "",
  phoneNumber: "",
  birthDate: "",
  gender: null,
  residence: "",
  password: "",
  permissions: defaultPermissions,
};
