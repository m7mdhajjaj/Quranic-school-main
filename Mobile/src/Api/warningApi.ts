import api from "./api";

// ============================================================================
// Warning API - طبقة وسيطة بين Frontend و Backend
// ============================================================================

/**
 * جلب إحصائيات المعلم
 * @route GET /api/warnings/statistics/teacher
 */
export const getTeacherStatistics = async () => {
  const response = await api.get("/warnings/statistics/teacher");
  return response.data;
};

/**
 * جلب إنذارات طالب معين
 * @route GET /api/warnings/student/:studentId
 */
export const getStudentWarnings = async (studentId: string) => {
  const response = await api.get(`/warnings/student/${studentId}`);
  return response.data;
};

/**
 * جلب طلاب الحلقة مع تفاصيل إنذاراتهم
 * @route GET /api/warnings/group/:groupId/students-with-warnings
 */
export const getGroupStudentsWithWarnings = async (groupId: string) => {
  const response = await api.get(
    `/warnings/group/${groupId}/students-with-warnings`
  );
  return response.data;
};

/**
 * إنشاء إنذار جديد
 * @route POST /api/warnings
 */
export const createWarning = async (warningData: {
  studentId: string;
  teacherId: string;
  groupName: string;
  type: string;
  reason: string;
}) => {
  const response = await api.post("/warnings", warningData);
  return response.data;
};

/**
 * حذف إنذار بالـ ID
 * @route DELETE /api/warnings/:warningId
 */
export const deleteWarningById = async (warningId: string) => {
  const response = await api.delete(`/warnings/${warningId}`);
  return response.data;
};

/**
 * حذف إنذار بالنوع (محسّن - بدون GET أولاً)
 * @route DELETE /api/warnings/student/:studentId/type/:warningType
 */
export const deleteWarningByType = async (
  studentId: string,
  warningType: string
) => {
  const response = await api.delete(
    `/warnings/student/${studentId}/type/${warningType}`
  );
  return response.data;
};

/**
 * جلب قائمة الطلاب المفصولين (مؤقت أو دائم)
 * @route GET /api/warnings/suspended-students
 */
export const getSuspendedStudents = async (params?: {
  groupId?: string;
  type?: "temporary" | "permanent" | "all";
}) => {
  const response = await api.get("/warnings/suspended-students", { params });
  return response.data;
};

/**
 * جلب حالة الفصل لطالب معين
 * @route GET /api/warnings/student-suspension/:studentId
 */
export const getStudentSuspensionStatus = async (studentId: string) => {
  const response = await api.get(`/warnings/student-suspension/${studentId}`);
  return response.data;
};

/**
 * جلب قائمة الطلاب المفصولين من حلقات المعلم (للمعلم فقط)
 * @route GET /api/warnings/teacher/suspended-students
 */
export const getTeacherSuspendedStudents = async (teacherId: string) => {
  const response = await api.get("/warnings/teacher/suspended-students", {
    params: { teacherId },
  });
  return response.data;
};
