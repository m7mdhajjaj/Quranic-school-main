// ============================================================================
// Validation Index - Central Export Hub
// ============================================================================
// هذا الملف يوفر وصول سهل لجميع schemas و validation functions
// يُنصح باستيراد الملفات مباشرة لتجنب التعارضات:
// import { studentValidationSchema } from '@/Validation/studentValidation';

// Re-export main validation schemas and functions
export {
  adminValidationSchema,
  validateAdminWithYup,
  sanitizeAdminData,
} from "./AdminValdation";
export {
  changePasswordSchema,
  calculatePasswordStrength,
  validatePasswordAsync,
  validatePassword,
  validateChangePassword,
} from "./ChangePassValdation";
export {
  sectionValidationSchema,
  markValidationSchema,
  markSliderValidationSchema,
  validateSection,
  validateMark,
  validateMarksSliders,
  isValidDate,
  isValidMark,
  validateActiveGroupsQuery,
  isValidActiveGroupsType,
} from "./dailyMarksValidation";
export {
  validateForgotPasswordData,
  validateResetPasswordData,
  validateField as validateForgotPasswordField,
} from "./forgotPasswordValidation";
export {
  groupValidationSchema,
  validateGroupWithYup,
  validateGroupFieldWithYup,
  validateGroupComprehensive,
  groupBusinessRules,
  normalizeGroupName,
  normalizeDescription,
  normalizeSchedule,
} from "./groupValidation";
export {
  validateImage,
  validateFileType,
  validateFileSize,
  validateImageDimensions,
  getImageInfo,
  isValidImageUri,
} from "./imageValidation";
export { newsValidationSchema, validateNewsForm } from "./NewsValidation";
export {
  validateProfileData,
  isProfileDataValid,
  getFieldError as getProfileFieldError,
  hasFieldError,
} from "./profileValidation";
export {
  validateReportFilters,
  isReportFiltersValid,
  validateMonth,
  validateYear,
  validateStudentId,
  validateDateRange,
} from "./reportValidation";
export {
  studentValidationSchema,
  validateStudentWithYup,
  validateFieldWithYup as validateStudentField,
} from "./studentValidation";
export {
  teacherValidationSchema,
  validateTeacherWithYup,
  validateTeacherFieldWithYup,
  formatBirthDateForBackend,
  parseBirthDateFromBackend,
  commonTeacherValidationErrors,
} from "./teacherValidation";
export {
  timetableValidationSchema,
  validateTimetableData,
} from "./timetableValidation";
export {
  validateCreateWarning,
  validateDeleteWarning,
  validateDeleteWarningByType,
} from "./warningValidation";

// Exam Schedule
export {
  examScheduleSchema,
  validateExamData,
} from "./ExamSchedule/examValidation";
export {
  createMarkSchema,
  markSchema,
  validateMarkValue,
  validateStudentMark,
  validateAllMarks,
  calculatePercentage,
  determineGrade,
  isPassing,
} from "./ExamSchedule/markValidation";

// Types
export type { GroupFormData, GroupValidationResult } from "./groupValidation";
export type { StudentFormData } from "./studentValidation";
export type { TeacherFormData } from "./teacherValidation";
export type { AdminFormData, Admin } from "./AdminValdation";
export type { ChangePasswordFormData } from "./ChangePassValdation";
export type { SectionFormData, MarkFormData } from "./dailyMarksValidation";
export type {
  ForgotPasswordData,
  ResetPasswordData,
  ValidationResult as ForgotPasswordValidationResult,
} from "./forgotPasswordValidation";
export type {
  ImageAsset,
  ImageValidationResult,
  ImageValidationOptions,
} from "./imageValidation";
export type { ProfileData, FieldErrors } from "./profileValidation";
export type { ReportFilters, ReportValidationErrors } from "./reportValidation";
export type {
  ValidationResult as WarningValidationResult,
  CreateWarningData,
  WarningType,
} from "./warningValidation";

// ============================================================================
// ملاحظة: للحصول على أفضل تجربة و IntelliSense كامل، استورد مباشرة:
// import { studentValidationSchema, validateStudentWithYup } from '@/Validation/studentValidation';
// ============================================================================
