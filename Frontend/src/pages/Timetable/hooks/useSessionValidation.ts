// ============================================================================
// useSessionValidation - هوك للتحقق من صحة بيانات الجلسة
// ============================================================================

import { useMemo } from "react";
import { generateHours } from "../utils/timetableHelpers";
import Swal from "sweetalert2";
import type { SessionFormData } from "../types/timetable.types";

export const useSessionValidation = () => {
  const hours = useMemo(() => generateHours(), []);

  const validateSession = async (formData: SessionFormData): Promise<boolean> => {
    const si = hours.indexOf(formData.startHour);
    const ei = hours.indexOf(formData.endHour);

    // التحقق من أن الأوقات موجودة في القائمة (12 PM - 9 PM)
    if (si === -1 || ei === -1) {
      await Swal.fire({
        icon: "error",
        title: "خطأ في الوقت",
        text: "الوقت المحدد غير صحيح. أوقات العمل من 12:00 PM إلى 9:00 PM فقط.",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#10b981",
      });
      return false;
    }

    // التحقق من أن وقت الانتهاء بعد وقت البداية
    if (ei <= si) {
      await Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "يجب أن تكون ساعة الانتهاء بعد ساعة الابتداء.",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#10b981",
      });
      return false;
    }

    return true;
  };

  return { validateSession };
};
