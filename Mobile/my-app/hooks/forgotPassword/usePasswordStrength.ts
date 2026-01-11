import { useMemo } from "react";
import type { PasswordStrengthResult } from "../../types/forgotPassword.types";

/**
 * Hook لحساب قوة كلمة المرور
 */
export const usePasswordStrength = (
  password: string
): PasswordStrengthResult => {
  return useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "غير محدد",
        color: "#9CA3AF",
      };
    }

    let score = 0;
    const length = password.length;

    // طول كلمة المرور
    if (length >= 4) score += 1;
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;

    // احتواء على أرقام
    if (/\d/.test(password)) score += 1;

    // احتواء على حروف صغيرة
    if (/[a-z]/.test(password)) score += 1;

    // احتواء على حروف كبيرة
    if (/[A-Z]/.test(password)) score += 1;

    // احتواء على أحرف عربية
    if (/[\u0600-\u06FF]/.test(password)) score += 1;

    // احتواء على رموز خاصة
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // تحديد القوة بناءً على النقاط
    if (score <= 2) {
      return {
        score: 1,
        label: "ضعيفة",
        color: "#EF4444",
      };
    } else if (score <= 4) {
      return {
        score: 2,
        label: "متوسطة",
        color: "#F59E0B",
      };
    } else if (score <= 6) {
      return {
        score: 3,
        label: "جيدة",
        color: "#10B981",
      };
    } else {
      return {
        score: 4,
        label: "قوية جداً",
        color: "#059669",
      };
    }
  }, [password]);
};
