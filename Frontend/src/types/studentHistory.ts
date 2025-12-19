// ============================================================================
// Student History Types - أنواع سجل تاريخ الطالب
// ============================================================================

export type StudentEventType =
  | "WARNING"
  | "WARNING_ESCALATION"
  | "WARNING_REMOVAL"
  | "SUSPENSION"
  | "EXPULSION"
  | "RESTORATION";

export type WarningLevel = "warning" | "first" | "second" | "third";

export interface ActionBy {
  userId: string;
  userModel: "Admin" | "Teacher";
  userName: string;
}

export interface StudentHistoryEvent {
  _id: string;
  studentId: string;
  eventType: StudentEventType;
  warningLevel?: WarningLevel;
  reason: string;
  
  // من قام بالإجراء
  actionBy: ActionBy;
  
  // ربط بالإنذار الأصلي
  warningId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface StudentHistoryStats {
  totalEvents: number;
  warnings: number;
  expulsions: number;
  restorations: number;
}

export interface StudentHistoryResponse {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    group?: string;
  };
  history: StudentHistoryEvent[];
  stats: StudentHistoryStats;
  count: number;
}

// Helper functions

/**
 * الحصول على اسم نوع الحدث بالعربية
 */
export const getEventTypeLabel = (type: StudentEventType): string => {
  const labels: Record<StudentEventType, string> = {
    WARNING: "إنذار",
    WARNING_ESCALATION: "تصعيد إنذار",
    WARNING_REMOVAL: "حذف إنذار",
    SUSPENSION: "تعليق",
    EXPULSION: "فصل",
    RESTORATION: "إعادة",
  };
  return labels[type] || type;
};

/**
 * الحصول على لون الحدث
 */
export const getEventTypeColor = (type: StudentEventType): string => {
  const colors: Record<StudentEventType, string> = {
    WARNING: "#3B82F6", // أزرق
    WARNING_ESCALATION: "#F59E0B", // برتقالي
    WARNING_REMOVAL: "#10B981", // أخضر
    SUSPENSION: "#F97316", // برتقالي غامق
    EXPULSION: "#EF4444", // أحمر
    RESTORATION: "#8B5CF6", // بنفسجي
  };
  return colors[type] || "#6B7280";
};

/**
 * الحصول على أيقونة الحدث
 */
export const getEventTypeIcon = (type: StudentEventType): string => {
  const icons: Record<StudentEventType, string> = {
    WARNING: "⚠️",
    WARNING_ESCALATION: "🔺",
    WARNING_REMOVAL: "✅",
    SUSPENSION: "⏸️",
    EXPULSION: "🚫",
    RESTORATION: "✅",
  };
  return icons[type] || "📝";
};

/**
 * الحصول على اسم مستوى الإنذار بالعربية
 */
export const getWarningLevelLabel = (level?: WarningLevel): string => {
  if (!level) return "";
  
  const labels: Record<WarningLevel, string> = {
    warning: "تنبيه",
    first: "إنذار أول",
    second: "إنذار ثاني",
    third: "إنذار ثالث",
  };
  return labels[level] || level;
};
