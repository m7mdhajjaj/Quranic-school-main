// ============================================================================
// useTestData Hook - إدارة بيانات الاختبار
// ============================================================================

import { useState, useEffect } from "react";
import {
  getAllSurahs,
  getMultipleSurahsWithAyahs,
  generateTestQuestions,
  type Surah,
  type Question,
} from "../../../Api/testApi";

export const useTestData = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [surahsLoading, setSurahsLoading] = useState(true);

  // Load Surahs عند التحميل
  useEffect(() => {
    const fetchSurahs = async () => {
      setSurahsLoading(true);
      try {
        const surahsData = await getAllSurahs();
        setSurahs(surahsData);
      } catch (error) {
        console.error("خطأ في جلب السور:", error);
      } finally {
        setSurahsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // اختيار سورة
  const handleSurahSelection = (surahNumber: number) => {
    setSelectedSurahs((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((s) => s !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  // مسح كل السور المختارة
  const clearSelectedSurahs = () => {
    setSelectedSurahs([]);
  };

  // بدء الاختبار وتوليد الأسئلة
  const startTest = async (): Promise<{
    success: boolean;
    questions: Question[];
  }> => {
    if (selectedSurahs.length === 0) {
      console.warn("لا توجد سور مختارة");
      return { success: false, questions: [] };
    }

    setLoading(true);

    try {
      console.log("جاري جلب الآيات للسور:", selectedSurahs);

      // جلب الآيات
      const allAyahs = await getMultipleSurahsWithAyahs(selectedSurahs);

      if (!allAyahs || allAyahs.length === 0) {
        console.error("لم يتم العثور على آيات");
        return { success: false, questions: [] };
      }

      console.log(`تم جلب ${allAyahs.length} آية`);

      const shuffledAyahs = allAyahs.sort(() => Math.random() - 0.5);
      const numberOfQuestions = Math.min(10, shuffledAyahs.length);

      console.log("جاري توليد الأسئلة...");

      // توليد الأسئلة
      const generatedQuestions = await generateTestQuestions(
        shuffledAyahs,
        numberOfQuestions
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        console.error("فشل في توليد الأسئلة");
        return { success: false, questions: [] };
      }

      setQuestions(generatedQuestions);

      console.log(
        `✅ تم توليد ${generatedQuestions.length} أسئلة من ${selectedSurahs.length} سور`
      );

      return { success: true, questions: generatedQuestions };
    } catch (error) {
      console.error("❌ خطأ في إعداد الاختبار:", error);
      if (error instanceof Error) {
        console.error("تفاصيل الخطأ:", error.message);
      }
      return { success: false, questions: [] };
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين كل شيء
  const resetData = () => {
    setQuestions([]);
    setSelectedSurahs([]);
  };

  return {
    surahs,
    questions,
    selectedSurahs,
    loading,
    surahsLoading,
    handleSurahSelection,
    clearSelectedSurahs,
    startTest,
    resetData,
  };
};
