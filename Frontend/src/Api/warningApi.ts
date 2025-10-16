import api from "./api";

// جلب إحصائيات المعلم
export const getTeacherStatistics = async () => {
  const response = await api.get("/warnings/statistics/teacher");
  return response.data;
};

// جلب إنذارات طالب
export const getStudentWarnings = async (studentId: string) => {
  const response = await api.get(`/warnings/student/${studentId}`);
  return response.data;
};

// إنشاء إنذار جديد
export const createWarning = async (warningData: {
  studentId: string;
  groupId?: string;
  groupName?: string;
  type: string;
  reason: string;
}) => {
  const response = await api.post("/warnings", warningData);
  return response.data;
};

// حذف إنذار
export const deleteWarning = async (warningId: string) => {
  const response = await api.delete(`/warnings/${warningId}`);
  return response.data;
};
