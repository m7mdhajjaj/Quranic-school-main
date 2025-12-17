// hooks/usePointsGameActions.ts
import { useCallback, useState } from "react";
import Swal from "sweetalert2";
import { saveDailyPoints } from "@/Api/pointsGameApi";
import type { DailyPointsData } from "../types/pointsGame.types";

export const usePointsGameActions = (
  loadBadgesData: () => Promise<void>,
  loadStatsData: () => Promise<void>
) => {
  const [saving, setSaving] = useState(false);

  const saveDailyData = useCallback(async (
    dailyData: DailyPointsData,
    totalPoints: number
  ) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      html: `
        <div style="text-align: center; direction: rtl;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">💾</div>
          <p style="font-size: 1.2rem; color: #4b5563;">
            سيتم حفظ نقاطك اليومية
          </p>
          <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                      padding: 1rem; 
                      border-radius: 1rem; 
                      color: white;
                      margin-top: 1rem;">
            <p style="margin: 0; font-weight: bold; font-size: 1.5rem;">${totalPoints} نقطة</p>
            <p style="margin: 0.5rem 0 0 0;">إجمالي نقاط اليوم</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، احفظ! 📝",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      const response = await saveDailyPoints(dailyData);

      if (response) {
        await loadBadgesData();
        await loadStatsData();

        await Swal.fire({
          icon: "success",
          title: "🎉 ممتاز!",
          html: `
            <div style="text-align: center; direction: rtl;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
              <h3 style="font-size: 1.5rem; color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">
                تم حفظ نقاطك بنجاح!
              </h3>
              <p style="font-size: 1.2rem; color: #4b5563; margin-bottom: 1rem;">
                حصلت على <strong style="color: #10b981;">${totalPoints}</strong> نقطة اليوم
              </p>
              <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                          padding: 1rem; 
                          border-radius: 1rem; 
                          color: white;
                          margin-top: 1rem;">
                <p style="margin: 0; font-weight: bold;">استمر في التميز! 💪</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">كل نقطة تقربك من القمة 🏆</p>
              </div>
            </div>
          `,
          confirmButtonText: "حسناً 👍",
          confirmButtonColor: "#10b981",
          timer: 5000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "عذراً! 😞",
        html: `
          <div style="text-align: center; direction: rtl;">
            <p style="font-size: 1.2rem; color: #ef4444;">
              حدث خطأ في حفظ النقاط
            </p>
            <p style="color: #6b7280;">
              الرجاء المحاولة مرة أخرى
            </p>
          </div>
        `,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  }, [loadBadgesData, loadStatsData]);

  return { saving, saveDailyData };
};
