import { useCallback } from "react";
import { saveReadingSettings } from "../../../Api/quranAudioApi";
import { useDebouncedSave } from "./useDebouncedSave";

/**
 * ✅ Hook لمزامنة إعدادات القراءة مع الـ API
 * يحفظ حجم الخط والإعدادات الأخرى تلقائياً مع debounce لتحسين الأداء
 */
export const useReadingSettingsSync = (
  fontSize: number,
  enabled: boolean = true
) => {
  // Memoize save function
  const saveFn = useCallback(async (size: number) => {
    if (!enabled) return;

    try {
      await saveReadingSettings({
        fontSize: size,
        theme: "light",
        ayahsPerPage: 10,
      });
    } catch (error) {
      console.log("Could not save reading settings:", error);
    }
  }, [enabled]);

  // Use debounced save - only saves 500ms after user stops changing
  useDebouncedSave(fontSize, saveFn, 500);
};
