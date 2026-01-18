import { useState, useEffect } from "react";
import {
  getAllSurahs,
  getReadingSettings,
} from "@/Api/quranAudioApi";
import type { Surah, ReadingSettings } from "../types/quran.types";

/**
 * ✅ Hook لتهيئة بيانات القرآن (السور + الإعدادات)
 * يتم استدعاؤه مرة واحدة عند تحميل الصفحة
 */
export const useQuranInit = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: 18,
    theme: "light",
    ayahsPerPage: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Load surahs first (critical)
        const surahsData = await getAllSurahs();
        setSurahs(surahsData);
        
        // Load settings separately (non-critical, with fallback)
        try {
          const settingsData = await getReadingSettings();
          setSettings(settingsData);
        } catch (settingsErr) {
          console.log("Using default settings:", settingsErr);
          // Keep default settings if backend fails
        }
      } catch (err) {
        setError("خطأ في تحميل قائمة السور");
        console.error("Error initializing Quran data:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return { surahs, settings, loading, error };
};
