// ============================================================================
// SessionModal - نافذة إضافة/تعديل موعد الحلقة
// ============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../components/UI/Modal";
import { Button } from "../../../components/UI/Button";
import { Select } from "../../../components/UI/Select";
import { Input } from "../../../components/UI/Input";
import type {
  Session,
  SessionFormData,
  UserRole,
} from "../types/timetable.types";
import { WEEK_DAYS, generateHours } from "../utils/timetableHelpers";
import { Calendar, Clock, Users } from "lucide-react";
import Swal from "sweetalert2";

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
  sessions,
}) => {
  const hours = useMemo(() => generateHours(), []);

  const [formData, setFormData] = useState<SessionFormData>({
    day: WEEK_DAYS[0],
    startHour: hours[0],
    endHour: hours[1],
    note: "",
  });

  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // تحديث النموذج عند التعديل
  useEffect(() => {
    if (editingSession) {
      setFormData({
        day: editingSession.day,
        startHour: editingSession.startHour,
        endHour: editingSession.endHour,
        note: editingSession.note,
      });
      if (role === "teacher") {
        setSelectedGroup(editingSession.note);
      }
    } else {
      setFormData({
        day: WEEK_DAYS[0],
        startHour: hours[0],
        endHour: hours[1],
        note: "",
      });
      if (role === "teacher" && teacherGroups.length > 0) {
        setSelectedGroup(teacherGroups[0]);
      }
    }
  }, [editingSession, role, teacherGroups, hours]);

  const hourIndex = (h: string) => hours.indexOf(h);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const si = hourIndex(formData.startHour);
    const ei = hourIndex(formData.endHour);

    // التحقق من الأوقات
    if (si === -1 || ei === -1 || ei <= si) {
      await Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "يجب أن تكون ساعة الانتهاء بعد ساعة الابتداء.",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    // إعداد البيانات للإرسال
    const sessionNote = role === "teacher" ? selectedGroup : formData.note;
    const dataToSend: SessionFormData = {
      ...formData,
      note: sessionNote,
    };

    // فحص التعارض
    const hasConflict = sessions.some((session) => {
      // تجاهل الموعد الحالي عند التعديل
      if (editingSession && session._id === editingSession._id) {
        return false;
      }

      // تحقق فقط من مواعيد نفس اليوم
      if (session.day !== formData.day) {
        return false;
      }

      // للمعلم: تحقق من كل مواعيده (كل الحلقات)
      // للإداري: تحقق فقط إذا كان نفس اسم الحلقة
      if (role === "admin" && session.note !== sessionNote) {
        return false;
      }

      const existingSi = hourIndex(session.startHour);
      const existingEi = hourIndex(session.endHour);

      // تحقق من التعارض
      const overlaps = si < existingEi && ei > existingSi;
      return overlaps;
    });

    if (hasConflict) {
      const conflictTitle =
        role === "teacher" ? "تعارض في مواعيد الحلقات!" : "تعارض في الموعد!";

      const conflictMsg =
        role === "teacher"
          ? `يوجد موعد آخر لإحدى حلقاتك في نفس الوقت يوم ${formData.day} من ${formData.startHour} إلى ${formData.endHour}.<br><br>يرجى اختيار وقت آخر.`
          : `يوجد موعد آخر لنفس الحلقة <strong>(${sessionNote})</strong> في نفس الوقت يوم ${formData.day}.<br><br>يرجى اختيار وقت آخر.`;

      await Swal.fire({
        icon: "error",
        title: conflictTitle,
        html: conflictMsg,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#10b981",
        iconColor: "#ef4444",
      });
      return;
    }

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
            onChange={(e) =>
              setFormData({ ...formData, startHour: e.target.value })
            }
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
