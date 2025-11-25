import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean;
}

/**
 * Hook للتعامل مع التغييرات غير المحفوظة
 * يحذر المستخدم عند محاولة الخروج من الصفحة أو تحديثها
 */
export const useUnsavedChanges = ({ hasUnsavedChanges }: UseUnsavedChangesProps) => {
  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "لديك تغييرات غير محفوظة. هل أنت متأكد من الخروج?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle navigation blocker
  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "⚠️ لديك تغييرات غير محفوظة!\n\nهل أنت متأكد من مغادرة الصفحة؟\nسيتم فقدان جميع التغييرات غير المحفوظة."
      );
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  return { blocker };
};
