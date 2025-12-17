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
  // Handle browser refresh/close (Native Browser Dialog)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "لديك تغييرات غير محفوظة. هل أنت متأكد من الخروج؟";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle in-app navigation (React Router Blocker)
  useBlocker(
    ({ currentLocation, nextLocation }) => {
      const isLeaving = currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search;
      
      if (hasUnsavedChanges && isLeaving) {
        // Show confirm dialog
        // If user confirms (returns true), we return false (don't block)
        // If user cancels (returns false), we return true (block)
        return !window.confirm(
          "⚠️ لديك تغييرات غير محفوظة!\n\nهل أنت متأكد من مغادرة الصفحة؟\nسيتم فقدان جميع التغييرات غير المحفوظة."
        );
      }
      return false;
    }
  );
};
