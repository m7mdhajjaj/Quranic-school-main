// ============================================================================
// useSessionForm - هوك لإدارة حالة فورم الجلسة
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import type { Session, SessionFormData, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, generateHours, getCurrentUser } from "../utils/timetableHelpers";

interface UseSessionFormProps {
  editingSession: Session | null;
  role: UserRole;
  teacherGroups?: string[];
}

export const useSessionForm = ({ editingSession, role, teacherGroups = [] }: UseSessionFormProps) => {
  const hours = useMemo(() => generateHours(), []);
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [formData, setFormData] = useState<SessionFormData>(() => ({
    day: WEEK_DAYS[0],
    startHour: hours[0],
    endHour: hours[1],
    note: "",
    sessionType: undefined,
    teacherId: "",
  }));

  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // دالة لتحديث وقت النهاية تلقائياً عند تغيير وقت البداية
  const handleStartHourChange = (newStartHour: string) => {
    const startIndex = hours.indexOf(newStartHour);
    // إذا كان هناك وقت تالي في القائمة، اختره تلقائياً
    const nextHour = startIndex >= 0 && startIndex < hours.length - 1 
      ? hours[startIndex + 1] 
      : hours[startIndex];
    
    setFormData({ 
      ...formData, 
      startHour: newStartHour,
      endHour: nextHour 
    });
  };

  // تحديث النموذج عند التعديل
  useEffect(() => {
    if (editingSession) {
      const teacherIdValue = typeof editingSession.teacherId === 'string' 
        ? editingSession.teacherId 
        : editingSession.teacherId?._id || "";
      
      setFormData({
        day: editingSession.day,
        startHour: editingSession.startHour,
        endHour: editingSession.endHour,
        note: editingSession.note,
        sessionType: editingSession.sessionType,
        teacherId: teacherIdValue,
      });
      if (role === "teacher") {
        setSelectedGroup(editingSession.note);
      }
    } else {
      // تعيين المعلم الحالي تلقائياً إذا كان معلم
      const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
      
      setFormData({
        day: WEEK_DAYS[0],
        startHour: hours[0],
        endHour: hours[1],
        note: "",
        sessionType: undefined,
        teacherId: defaultTeacherId,
      });
      if (role === "teacher" && teacherGroups.length > 0) {
        setSelectedGroup(teacherGroups[0]);
      }
    }
  }, [editingSession, role, teacherGroups, hours, currentUser]);

  return {
    formData,
    setFormData,
    selectedGroup,
    setSelectedGroup,
    hours,
    handleStartHourChange,
  };
};
