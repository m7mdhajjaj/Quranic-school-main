// utils/editLimits.ts
// يستخدم Backend للحصول على معلومات حدود التعديل

import { getEditLimits as getEditLimitsAPI } from "@/Api/profileApi";

/**
 * التحقق من إمكانية تعديل تاريخ الميلاد
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export const canEditFieldLocal = async (): Promise<{
  allowed: boolean;
  remaining: number;
}> => {
  try {
    const result = await getEditLimitsAPI("birthDate");
    return {
      allowed: result.editLimit.allowed,
      remaining: result.editLimit.remaining,
    };
  } catch (error) {
    console.error("Error getting edit limits:", error);
    // في حالة الخطأ، نسمح بالتعديل (fail-open) لكن Backend سيتحقق في النهاية
    return {
      allowed: true,
      remaining: 2,
    };
  }
};
