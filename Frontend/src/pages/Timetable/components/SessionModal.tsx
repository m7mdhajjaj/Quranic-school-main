// ============================================================================
// SessionModal - نافذة إضافة/تعديل موعد الحلقة
// ============================================================================

import React, { useState } from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import { Select } from "@/components/UI/Select";
import { Input } from "@/components/UI/Input";
import type {
  Session,
  SessionFormData,
  UserRole,
} from "../types/timetable.types";
import { WEEK_DAYS } from "../utils/timetableHelpers";
import { Calendar, Clock, Users, UserCircle } from "lucide-react";
import { useSessionForm, useTeachers, useSessionValidation } from "../hooks";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: SessionFormData, sessionId?: string) => Promise<boolean>;
  editingSession: Session | null;
  role: UserRole;
  teacherGroups?: string[];
  sessions: Session[];
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSession,
  role,
  teacherGroups = [],
}) => {
  // ✅ استخدام الـ hooks المنفصلة لتنظيم أفضل
  const { formData, setFormData, selectedGroup, setSelectedGroup, hours, handleStartHourChange } = useSessionForm({
    editingSession,
    role,
    teacherGroups,
  });

  const { teachers, loadingTeachers } = useTeachers({
    isOpen,
    enabled: role === "admin",
  });

  const { validateSession } = useSessionValidation();
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    const isValid = await validateSession(formData);
    if (!isValid) return;

    // إعداد البيانات للإرسال
    const sessionNote = role === "teacher" ? selectedGroup : formData.note;
    const dataToSend: SessionFormData = {
      ...formData,
      note: sessionNote,
    };

    // ✅ Backend سيفحص التعارض ويرجع error 409 إذا كان في تعارض
    // useTimetableActions سيتعامل مع الـ conflict error

    setLoading(true);
    const success = await onSubmit(dataToSend, editingSession?._id);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSession ? "تعديل موعد حلقة" : "إضافة موعد حلقة"}
      size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* اختيار اليوم */}
        <Select
          label="اليوم"
          icon={<Calendar className="w-5 h-5" />}
          value={formData.day}
          onChange={(e) => setFormData({ ...formData, day: e.target.value })}
          options={WEEK_DAYS.map((d) => ({ value: d, label: d }))}
          required
        />

        {/* اختيار الأوقات */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="ساعة الابتداء"
            icon={<Clock className="w-5 h-5" />}
            value={formData.startHour}
            onChange={(e) => handleStartHourChange(e.target.value)}
            options={hours.map((h) => ({ value: h, label: h }))}
            required
          />
          <Select
            label="ساعة الانتهاء"
            icon={<Clock className="w-5 h-5" />}
            value={formData.endHour}
            onChange={(e) =>
              setFormData({ ...formData, endHour: e.target.value })
            }
            options={hours.map((h) => ({ value: h, label: h }))}
            required
          />
        </div>

        {/* اختيار الحلقة للمعلم */}
        {role === "teacher" && teacherGroups.length > 0 && (
          <Select
            label="اختر الحلقة"
            icon={<Users className="w-5 h-5" />}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            options={teacherGroups.map((g) => ({ value: g, label: g }))}
            required
          />
        )}

        {/* اسم الحلقة للإداري */}
        {role === "admin" && (
          <Input
            label="اسم الحلقة"
            type="text"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="مثلاً حلقة تثبيت لنجاح..."
            required
          />
        )}

        {/* اختيار المعلم - للإداري فقط */}
        {role === "admin" && (
          <Select
            label="المعلم المسؤول"
            icon={<UserCircle className="w-5 h-5" />}
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            options={[
              { value: "", label: loadingTeachers ? "جاري التحميل..." : "اختر المعلم" },
              ...teachers.map((teacher) => ({
                value: teacher._id,
                label: `${teacher.firstName} ${teacher.lastName}`,
              })),
            ]}
            required
            disabled={loadingTeachers}
          />
        )}

        {/* نوع الحصة (إجباري) */}
        {(role === "teacher" || role === "admin") && (
          <Select
            label="نوع الحصة"
            value={formData.sessionType || ""}
            onChange={(e) => 
              setFormData({ 
                ...formData, 
                sessionType: e.target.value as "hifz" | "murajaah" | "both"
              })
            }
            options={[
              { value: "", label: "اختر نوع الحصة" },
              { value: "hifz", label: "📖 حفظ" },
              { value: "murajaah", label: "🔄 مراجعة" },
              { value: "both", label: "📚 حفظ ومراجعة" },
            ]}
            required
          />
        )}

        {/* أزرار العمل */}
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
            disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {editingSession ? "حفظ التعديل" : "إضافة الموعد"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
