/**
 * نظام اختبارات القرآن الكريم المحسّن
 * - استخدام API للقرآن الكريم
 * - أسئلة متنوعة: كلمات مخفية، بداية الآيات، ختام الآيات
 * - خيارات ذكية ومتقدمة للإجابات الخاطئة
 * - واجهة مستخدم تفاعلية ومتجاوبة
 */

import { useState, useEffect } from "react";
import { TestSkeleton } from "../components/Loading/LoadingSkeleton";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface Question {
  id: number;
  type: "hidden-word" | "next-ayah-start" | "ayah-ending";
  question: string;
  options: string[];
  correctAnswer: number;
  ayahNumber: number;
  ayah: string; // إضافة نص الآية للمراجعة
  context?: string; // سياق إضافي للسؤال
}

const Test = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]); // تغيير لدعم الاختيار المتعدد
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(20); // مؤقت 20 ثانية لكل سؤال
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [questionReady, setQuestionReady] = useState(false); // حالة جاهزية السؤال
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]); // إجابات المستخدم
  const [questionsGenerated, setQuestionsGenerated] = useState(false); // حالة اكتمال تحضير الأسئلة
  const [hasAnswered, setHasAnswered] = useState(false); // هل أجاب المستخدم على السؤال

  // حالة تحميل السور
  const [surahsLoading, setSurahsLoading] = useState(true);

  // جلب قائمة السور
  useEffect(() => {
    const fetchSurahs = async () => {
      setSurahsLoading(true);
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        console.error("خطأ في جلب السور:", error);
      } finally {
        setSurahsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // مؤقت السؤال - 20 ثانية لكل سؤال
  useEffect(() => {
    if (isTimerActive && testStarted && !showResult && questionTimer > 0) {
      const timer = setTimeout(() => {
        setQuestionTimer(questionTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (questionTimer === 0 && testStarted && !showResult) {
      // انتهى الوقت - الانتقال للسؤال التالي
      handleTimeUp();
    }
  }, [questionTimer, isTimerActive, testStarted, showResult]);

  // تأثير بصري وصوتي عند اقتراب انتهاء الوقت
  useEffect(() => {
    if (questionTimer === 5 && testStarted && !showResult) {
      // يمكن إضافة صوت تنبيه هنا إذا أردت
      // new Audio('/notification-sound.mp3').play().catch(() => {});

      // تأثير اهتزاز للهاتف المحمول
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [questionTimer, testStarted, showResult]);

  // بدء مؤقت السؤال الجديد عند تغيير السؤال
  useEffect(() => {
    if (testStarted && !showResult) {
      setQuestionTimer(20);
      setIsTimerActive(false); // إيقاف المؤقت أولاً
      setSelectedAnswer(null);
      setQuestionReady(false); // السؤال ليس جاهزاً بعد
      setHasAnswered(false); // إعادة تعيين حالة الإجابة

      // محاكاة تحضير السؤال (يمكن أن يكون هذا وقت تحميل حقيقي)
      const prepareQuestion = setTimeout(() => {
        setQuestionReady(true);
        // إظهار زر "بدء الاختبار" فقط في السؤال الأول
        if (currentQuestionIndex === 0) {
          setQuestionsGenerated(true); // الأسئلة جاهزة للبدء
        } else {
          // في الأسئلة التالية، ابدأ المؤقت مباشرة
          setIsTimerActive(true);
        }
      }, 500); // نصف ثانية لتحضير السؤال

      return () => clearTimeout(prepareQuestion);
    }
  }, [currentQuestionIndex, testStarted, showResult]);

  // جلب آيات السور المحددة
  const fetchSurahsAyahs = async (surahNumbers: number[]) => {
    setLoading(true);
    try {
      const allAyahs: (Ayah & { surahNumber: number })[] = [];

      // جلب آيات من كل السور المختارة مع حفظ رقم السورة
      for (const surahNumber of surahNumbers) {
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}`
        );
        const data = await response.json();
        const ayahsWithSurah = data.data.ayahs.map((ayah: Ayah) => ({
          ...ayah,
          surahNumber: surahNumber,
        }));
        allAyahs.push(...ayahsWithSurah);
      }

      // خلط الآيات من السور المختلفة
      const shuffledAyahs = allAyahs.sort(() => Math.random() - 0.5);
      await generateQuestions(shuffledAyahs);
    } catch (error) {
      console.error("خطأ في جلب الآيات:", error);
    }
    setLoading(false);
  };

  // توليد الأسئلة مع ضمان عدم تكرار الآيات
  const generateQuestions = async (
    ayahsData: (Ayah & { surahNumber: number })[]
  ) => {
    const generatedQuestions: Question[] = [];
    const numberOfQuestions = Math.min(10, ayahsData.length); // حد أقصى 10 أسئلة
    const usedAyahs = new Set<number>(); // لتتبع الآيات المستخدمة

    // إنشاء نسخة مخلوطة من الآيات لضمان التنوع
    const shuffledAyahs = [...ayahsData].sort(() => Math.random() - 0.5);

    let ayahIndex = 0;
    let attempts = 0;
    const maxAttempts = numberOfQuestions * 3; // حد أقصى للمحاولات لتجنب اللف اللانهائي

    for (
      let i = 0;
      i < numberOfQuestions &&
      ayahIndex < shuffledAyahs.length &&
      attempts < maxAttempts;
      i++
    ) {
      attempts++;
      // البحث عن آية لم تُستخدم بعد
      let ayah = shuffledAyahs[ayahIndex];
      while (
        usedAyahs.has(ayah.number) &&
        ayahIndex < shuffledAyahs.length - 1
      ) {
        ayahIndex++;
        ayah = shuffledAyahs[ayahIndex];
      }

      // إذا كانت هذه الآية مستخدمة أيضاً، نتخطى هذه الدورة
      if (usedAyahs.has(ayah.number)) {
        continue;
      }

      // تسجيل الآية كمستخدمة
      usedAyahs.add(ayah.number);

      // نوع السؤال عشوائي
      const questionTypes: Question["type"][] = [
        "hidden-word",
        "next-ayah-start",
        "ayah-ending",
      ];
      const randomType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question: Question;

      try {
        switch (randomType) {
          case "hidden-word":
            question = await generateHiddenWordQuestion(ayah, i + 1);
            break;
          case "next-ayah-start":
            question = await generateNextAyahStartQuestion(
              ayah,
              ayahsData,
              i + 1
            );
            break;
          case "ayah-ending":
            question = await generateAyahEndingQuestion(ayah, ayahsData, i + 1);
            break;
          default:
            question = await generateHiddenWordQuestion(ayah, i + 1);
        }

        // التحقق الشامل من جودة السؤال
        const isValidQuestion =
          question &&
          question.options &&
          question.options.length === 4 &&
          question.correctAnswer >= 0 &&
          question.correctAnswer < question.options.length &&
          question.options[question.correctAnswer] && // التأكد من وجود الإجابة الصحيحة
          question.options.every(
            (option) => option && option.trim().length > 0
          ) && // كل الخيارات صالحة
          new Set(question.options.map(normalizeText)).size === 4; // كل الخيارات مختلفة

        if (isValidQuestion) {
          generatedQuestions.push(question);
        } else {
          // إذا لم يكن السؤال جيد، نقلل من العداد لنحاول مرة أخرى
          console.log(
            `سؤال غير صالح تم تجاهله: ${question?.question || "سؤال غير محدد"}`
          );
          i--;
        }
      } catch (error) {
        // في حالة حدوث خطأ، نتجاهل هذا السؤال ونحاول مرة أخرى
        console.log(`خطأ في توليد السؤال: ${error}`);
        i--;
      }

      ayahIndex++;
    }

    // التأكد من توليد عدد مناسب من الأسئلة
    if (generatedQuestions.length < 3) {
      alert(
        "عذراً، لم نتمكن من توليد عدد كافٍ من الأسئلة الصالحة. يرجى المحاولة مع سور أخرى أو أكثر."
      );
      setLoading(false);
      return;
    }

    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(null)); // تهيئة مصفوفة الإجابات
  };

  // توليد سؤال الكلمة المخفية - محسن لضمان وجود الإجابة الصحيحة
  const generateHiddenWordQuestion = async (
    ayah: Ayah & { surahNumber: number },
    questionId: number
  ): Promise<Question> => {
    // التأكد من وجود الآية ونصها
    if (!ayah || !ayah.text || ayah.text.trim().length === 0) {
      throw new Error("الآية غير صالحة لإنشاء السؤال");
    }

    const words = ayah.text.split(" ").filter((word) => word.trim().length > 2);

    // التأكد من وجود كلمات كافية
    if (words.length === 0) {
      throw new Error("لا توجد كلمات صالحة في الآية");
    }

    const randomWordIndex = Math.floor(Math.random() * words.length);
    const hiddenWord = words[randomWordIndex];

    // التأكد من أن الكلمة المخفية صالحة
    if (!hiddenWord || hiddenWord.trim().length === 0) {
      throw new Error("الكلمة المختارة غير صالحة");
    }

    const questionText = ayah.text.replace(hiddenWord, "____");

    // توليد خيارات خاطئة
    const wrongOptions = await generateWrongWordOptions(hiddenWord, ayah.text);

    // التأكد من وجود خيارات خاطئة كافية
    const validWrongOptions = wrongOptions
      .filter((option) => !isDuplicate(option, hiddenWord))
      .slice(0, 3);

    // التأكد من وجود خيارات كافية للسؤال (على الأقل خيارين خاطئين)
    if (validWrongOptions.length < 2) {
      // إضافة خيارات احتياطية
      const backupOptions = [
        "الرَّحْمَنِ",
        "الرَّحِيمِ",
        "الْعَلِيمِ",
        "الْحَكِيمِ",
        "الْعَزِيزِ",
        "الْغَفُورِ",
        "يُؤْمِنُونَ",
        "يَعْمَلُونَ",
        "الْمُؤْمِنِينَ",
        "الْكَافِرِينَ",
      ].filter((option) => !isDuplicate(option, hiddenWord));

      validWrongOptions.push(
        ...backupOptions.slice(0, 3 - validWrongOptions.length)
      );
    }

    // إنشاء قائمة الخيارات النهائية
    const allOptions = [hiddenWord, ...validWrongOptions.slice(0, 3)];

    // خلط الخيارات مع الاحتفاظ بمؤشر الإجابة الصحيحة
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const finalCorrectIndex = shuffledOptions.indexOf(hiddenWord);

    // التأكد من أن الإجابة الصحيحة موجودة في الخيارات
    if (finalCorrectIndex === -1) {
      throw new Error("الإجابة الصحيحة غير موجودة في الخيارات");
    }

    return {
      id: questionId,
      type: "hidden-word",
      question: `ما الكلمة المفقودة في الآية رقم ${ayah.numberInSurah} من ${
        surahs.find((s) => s.number === ayah.surahNumber)?.name || "السورة"
      }؟`,
      options: shuffledOptions,
      correctAnswer: finalCorrectIndex,
      ayahNumber: ayah.numberInSurah,
      ayah: ayah.text,
      context: `الآية: "${questionText}"`,
    };
  };

  // توليد سؤال بداية الآية التالية - محسن لضمان وجود الإجابة الصحيحة
  const generateNextAyahStartQuestion = async (
    ayah: Ayah & { surahNumber: number },
    ayahsData: (Ayah & { surahNumber: number })[],
    questionId: number
  ): Promise<Question> => {
    // البحث عن الآيات من نفس السورة فقط وترتيبها حسب numberInSurah
    const sameSurahAyahs = ayahsData
      .filter((a) => a.surahNumber === ayah.surahNumber)
      .sort((a, b) => a.numberInSurah - b.numberInSurah);

    const currentIndex = sameSurahAyahs.findIndex(
      (a) => a.numberInSurah === ayah.numberInSurah
    );

    // التحقق من وجود آية تالية
    if (currentIndex === -1 || currentIndex >= sameSurahAyahs.length - 1) {
      // إذا كانت الآية الأخيرة في السورة أو لم نجدها، نعيد سؤال كلمة مخفية
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    const nextAyah = sameSurahAyahs[currentIndex + 1];

    // التأكد من وجود الآية التالية وأن لديها نص
    if (!nextAyah || !nextAyah.text || nextAyah.text.trim().length === 0) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    const nextAyahWords = nextAyah.text
      .split(" ")
      .filter((word) => word.trim().length > 0);

    // التأكد من وجود كلمات كافية في الآية التالية
    if (nextAyahWords.length < 3) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    const firstThreeWords = nextAyahWords.slice(0, 3).join(" ");

    // توليد خيارات خاطئة من آيات أخرى
    const wrongOptions = await generateWrongAyahStartOptions(
      firstThreeWords,
      ayahsData
    );

    // التأكد من وجود خيارات خاطئة كافية
    const validWrongOptions = wrongOptions
      .filter((option) => !isDuplicate(option, firstThreeWords))
      .slice(0, 3);

    // التأكد من وجود خيارات كافية للسؤال
    if (validWrongOptions.length < 2) {
      // إذا لم نحصل على خيارات كافية، نعيد سؤال كلمة مخفية
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    // إنشاء قائمة الخيارات النهائية
    const allOptions = [firstThreeWords, ...validWrongOptions];

    // خلط الخيارات مع الاحتفاظ بمؤشر الإجابة الصحيحة
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const finalCorrectIndex = shuffledOptions.indexOf(firstThreeWords);

    // التأكد من أن الإجابة الصحيحة موجودة في الخيارات
    if (finalCorrectIndex === -1) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    return {
      id: questionId,
      type: "next-ayah-start",
      question: `ما بداية الآية التالية بعد الآية رقم ${
        ayah.numberInSurah
      } من ${
        surahs.find((s) => s.number === ayah.surahNumber)?.name || "السورة"
      }؟`,
      options: shuffledOptions,
      correctAnswer: finalCorrectIndex,
      ayahNumber: ayah.numberInSurah,
      ayah: ayah.text,
      context: `الآية الحالية: "${ayah.text}"`,
    };
  };

  // توليد سؤال ختام الآية - محسن لضمان وجود الإجابة الصحيحة
  const generateAyahEndingQuestion = async (
    ayah: Ayah & { surahNumber: number },
    ayahsData: (Ayah & { surahNumber: number })[],
    questionId: number
  ): Promise<Question> => {
    // التأكد من وجود الآية ونصها
    if (!ayah || !ayah.text || ayah.text.trim().length === 0) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    const words = ayah.text.split(" ").filter((word) => word.trim().length > 0);

    // التأكد من وجود كلمات كافية في الآية
    if (words.length < 6) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    const lastThreeWords = words.slice(-3).join(" ");

    // التأكد من أن النهاية ليست فارغة
    if (!lastThreeWords || lastThreeWords.trim().length === 0) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    // عرض جزء من الآية (أول 5-8 كلمات) + علامة "____"
    const firstPart = words.slice(0, Math.min(8, words.length - 3)).join(" ");
    const questionText = firstPart + " ____";

    // توليد خيارات خاطئة
    const wrongOptions = await generateWrongEndingOptions(
      lastThreeWords,
      ayahsData
    );

    // التأكد من وجود خيارات خاطئة كافية
    const validWrongOptions = wrongOptions
      .filter((option) => !isDuplicate(option, lastThreeWords))
      .slice(0, 3);

    // التأكد من وجود خيارات كافية للسؤال
    if (validWrongOptions.length < 2) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    // إنشاء قائمة الخيارات النهائية
    const allOptions = [lastThreeWords, ...validWrongOptions];

    // خلط الخيارات مع الاحتفاظ بمؤشر الإجابة الصحيحة
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const finalCorrectIndex = shuffledOptions.indexOf(lastThreeWords);

    // التأكد من أن الإجابة الصحيحة موجودة في الخيارات
    if (finalCorrectIndex === -1) {
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    return {
      id: questionId,
      type: "ayah-ending",
      question: `ما ختام الآية رقم ${ayah.numberInSurah} من ${
        surahs.find((s) => s.number === ayah.surahNumber)?.name || "السورة"
      }؟`,
      options: shuffledOptions,
      correctAnswer: finalCorrectIndex,
      ayahNumber: ayah.numberInSurah,
      ayah: ayah.text,
      context: `الآية: "${questionText}"`,
    };
  };

  // دالة لإزالة التشكيل وتطبيع النص للمقارنة
  const normalizeText = (text: string): string => {
    return text
      .replace(/[\u064B-\u0652]/g, "") // إزالة التشكيل
      .replace(/\s+/g, " ") // توحيد المسافات
      .trim()
      .toLowerCase(); // تحويل لأحرف صغيرة للمقارنة
  };

  // دالة للتحقق من التكرار الذكي
  const isDuplicate = (option1: string, option2: string): boolean => {
    return normalizeText(option1) === normalizeText(option2);
  };

  // توليد خيارات خاطئة للكلمات - محسّنة لمنع التكرار
  const generateWrongWordOptions = async (
    correctWord: string,
    _ayahText: string // إضافة underscore لتجنب التحذير
  ): Promise<string[]> => {
    // كلمات قرآنية شائعة مصنفة حسب النوع لتكون مشابهة للكلمة الصحيحة
    const commonWords = {
      divine: [
        "الرَّحْمَٰنِ",
        "الرَّحِيمِ",
        "الْعَلِيمِ",
        "الْحَكِيمِ",
        "الْعَزِيزِ",
        "الْغَفُورِ",
        "التَّوَّابِ",
        "الْحَلِيمِ",
        "الْعَظِيمِ",
        "الْكَرِيمِ",
      ],
      people: [
        "الْمُؤْمِنِينَ",
        "الْكَافِرِينَ",
        "الْمُتَّقِينَ",
        "الْمُشْرِكِينَ",
        "الضَّالِّينَ",
        "الْمُفْلِحِينَ",
        "الظَّالِمِينَ",
        "الْمُجْرِمِينَ",
        "الصَّالِحِينَ",
        "الْفَاسِقِينَ",
      ],
      actions: [
        "يُؤْمِنُونَ",
        "يَعْمَلُونَ",
        "يَتَّقُونَ",
        "يُقِيمُونَ",
        "يُنفِقُونَ",
        "يَعْبُدُونَ",
        "يَشْكُرُونَ",
        "يَتَوَكَّلُونَ",
        "يَتَفَكَّرُونَ",
        "يَذْكُرُونَ",
      ],
      places: [
        "الْجَنَّةِ",
        "النَّارِ",
        "السَّمَاءِ",
        "الْأَرْضِ",
        "الْآخِرَةِ",
        "الدُّنْيَا",
        "الْمَسْجِدِ",
        "الْبَيْتِ",
        "الْجَحِيمِ",
        "الْفِرْدَوْسِ",
      ],
      concepts: [
        "الْهُدَى",
        "الضَّلَالِ",
        "الْحَقِّ",
        "الْبَاطِلِ",
        "الْعَذَابِ",
        "الرَّحْمَةِ",
        "الْمَغْفِرَةِ",
        "التَّوْبَةِ",
        "الْإِيمَانِ",
        "الْكُفْرِ",
      ],
    };

    // تحديد نوع الكلمة الصحيحة
    const getWordCategory = (
      word: string
    ): keyof typeof commonWords | "general" => {
      const cleanWord = normalizeText(word);

      for (const [category, words] of Object.entries(commonWords)) {
        if (
          words.some(
            (w) =>
              cleanWord.includes(normalizeText(w)) ||
              normalizeText(w).includes(cleanWord)
          )
        ) {
          return category as keyof typeof commonWords;
        }
      }
      return "general";
    };

    const category = getWordCategory(correctWord);
    const wrongOptions: string[] = [];

    // إضافة كلمات من نفس التصنيف
    if (category !== "general") {
      const categoryWords = commonWords[category]
        .filter((word) => !isDuplicate(word, correctWord))
        .sort(() => Math.random() - 0.5);

      for (const word of categoryWords) {
        if (wrongOptions.length >= 3) break;
        if (!wrongOptions.some((option) => isDuplicate(option, word))) {
          wrongOptions.push(word);
        }
      }
    }

    // إضافة كلمات عامة كاحتياط
    if (wrongOptions.length < 3) {
      const allCommonWords = Object.values(commonWords)
        .flat()
        .filter((word) => !isDuplicate(word, correctWord))
        .sort(() => Math.random() - 0.5);

      for (const word of allCommonWords) {
        if (wrongOptions.length >= 3) break;
        if (!wrongOptions.some((option) => isDuplicate(option, word))) {
          wrongOptions.push(word);
        }
      }
    }

    // التأكد من وجود 3 خيارات فقط
    return wrongOptions.slice(0, 3);
  };

  // توليد خيارات خاطئة لبداية الآيات - محسّنة لمنع التكرار
  const generateWrongAyahStartOptions = async (
    correctStart: string,
    ayahsData: (Ayah & { surahNumber: number })[]
  ): Promise<string[]> => {
    const wrongOptions: string[] = [];

    // جلب بدايات من آيات أخرى (من نفس السورة ومن سور أخرى)
    const allStarts = ayahsData
      .map((ayah) => ayah.text.split(" ").slice(0, 3).join(" "))
      .filter((start) => !isDuplicate(start, correctStart))
      .sort(() => Math.random() - 0.5);

    // إضافة البدايات المتاحة
    for (const start of allStarts) {
      if (wrongOptions.length >= 3) break;
      if (!wrongOptions.some((option) => isDuplicate(option, start))) {
        wrongOptions.push(start);
      }
    }

    // بدايات شائعة في القرآن كخيارات احتياطية
    const commonStarts = [
      "وَالَّذِينَ آمَنُوا وَعَمِلُوا",
      "يَا أَيُّهَا الَّذِينَ",
      "قُلْ أَعُوذُ بِرَبِّ",
      "إِنَّ الَّذِينَ كَفَرُوا",
      "وَمَا كَانَ لِمُؤْمِنٍ",
      "وَلَقَدْ أَرْسَلْنَا إِلَىٰ",
      "الَّذِينَ آمَنُوا وَعَمِلُوا",
      "فَأَمَّا الَّذِينَ آمَنُوا",
      "وَمِنَ النَّاسِ مَن",
      "فَإِذَا قُضِيَتِ الصَّلَاةُ",
    ];

    // إضافة خيارات احتياطية إذا لم نحصل على ما يكفي
    if (wrongOptions.length < 3) {
      for (const start of commonStarts) {
        if (wrongOptions.length >= 3) break;
        if (
          !isDuplicate(start, correctStart) &&
          !wrongOptions.some((option) => isDuplicate(option, start))
        ) {
          wrongOptions.push(start);
        }
      }
    }

    // التأكد من وجود 3 خيارات فقط
    return wrongOptions.slice(0, 3);
  };

  // توليد خيارات خاطئة لنهاية الآيات - محسّنة لمنع التكرار
  const generateWrongEndingOptions = async (
    correctEnding: string,
    ayahsData: (Ayah & { surahNumber: number })[]
  ): Promise<string[]> => {
    const wrongOptions: string[] = [];

    // جلب نهايات من آيات أخرى
    const allEndings = ayahsData
      .map((ayah) => ayah.text.split(" ").slice(-3).join(" "))
      .filter((ending) => !isDuplicate(ending, correctEnding))
      .sort(() => Math.random() - 0.5);

    // إضافة النهايات المتاحة
    for (const ending of allEndings) {
      if (wrongOptions.length >= 3) break;
      if (!wrongOptions.some((option) => isDuplicate(option, ending))) {
        wrongOptions.push(ending);
      }
    }

    // نهايات شائعة في القرآن الكريم كخيارات احتياطية
    const commonEndings = [
      "وَاللَّهُ عَلِيمٌ حَكِيمٌ",
      "وَاللَّهُ غَفُورٌ رَّحِيمٌ",
      "وَاللَّهُ عَزِيزٌ حَكِيمٌ",
      "إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ",
      "وَاللَّهُ سَمِيعٌ عَلِيمٌ",
      "وَاللَّهُ بِمَا تَعْمَلُونَ خَبِيرٌ",
      "لَعَلَّكُمْ تَتَّقُونَ",
      "لَعَلَّكُمْ تَشْكُرُونَ",
      "وَمَا أَنتُم بِمُعْجِزِينَ",
      "فِي عَذَابٍ مُّهِينٍ",
      "إِنَّ اللَّهَ عَلَىٰ كُلِّ",
      "وَاللَّهُ لَا يُحِبُّ الظَّالِمِينَ",
      "وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ",
    ];

    // إضافة نهايات احتياطية إذا لم نحصل على ما يكفي
    if (wrongOptions.length < 3) {
      for (const ending of commonEndings) {
        if (wrongOptions.length >= 3) break;
        if (
          !isDuplicate(ending, correctEnding) &&
          !wrongOptions.some((option) => isDuplicate(option, ending))
        ) {
          wrongOptions.push(ending);
        }
      }
    }

    // التأكد من وجود 3 خيارات فقط
    return wrongOptions.slice(0, 3);
  };

  // بدء الاختبار
  // بدء الاختبار
  // بدء الاختبار
  const startTest = () => {
    if (!selectedSurahs || selectedSurahs.length === 0) {
      alert("يرجى اختيار سورة واحدة على الأقل");
      return;
    }

    fetchSurahsAyahs(selectedSurahs);
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setQuestionTimer(20);
    setIsTimerActive(false); // لا نبدأ المؤقت حتى يكون السؤال جاهزاً
    setUserAnswers([]); // تهيئة مصفوفة الإجابات
    setQuestionReady(false);
    setQuestionsGenerated(false); // إعادة تعيين حالة الأسئلة
    setHasAnswered(false); // إعادة تعيين حالة الإجابة
  };

  // بدء مؤقت السؤال يدوياً
  const startQuestionTimer = () => {
    setIsTimerActive(true);
    setQuestionsGenerated(false); // إخفاء زر البدء
  };

  // التعامل مع إجابة السؤال
  const handleAnswer = () => {
    if (selectedAnswer === null || hasAnswered) return;

    // إيقاف المؤقت
    setIsTimerActive(false);
    setHasAnswered(true); // المستخدم أجاب

    // حفظ إجابة المستخدم
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    // لا ننتقل للسؤال التالي تلقائياً - سنعرض النتيجة أولاً
  };

  // الانتقال للسؤال التالي يدوياً
  const goToNextQuestion = () => {
    moveToNextQuestion();
  };

  // التعامل مع انتهاء الوقت
  const handleTimeUp = () => {
    setIsTimerActive(false);
    setHasAnswered(true); // انتهى الوقت

    // حفظ أن المستخدم لم يجب (null)
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = null;
    setUserAnswers(newUserAnswers);

    // لا نضيف نقاط إذا انتهى الوقت دون اختيار إجابة
  };

  // الانتقال للسؤال التالي أو إنهاء الاختبار
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      // المؤقت سيتم إعادة تشغيله تلقائياً من خلال useEffect
    } else {
      setShowResult(true);
      setIsTimerActive(false);
    }
  };

  if (loading) {
    return <TestSkeleton />;
  }

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div
                className={`text-6xl font-bold mb-4 ${
                  percentage >= 70
                    ? "text-green-600"
                    : percentage >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                {percentage.toFixed(0)}%
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                نتيجة الاختبار
              </h2>
              <p className="text-lg text-gray-600">
                لقد أجبت على {score} من {questions.length} أسئلة بشكل صحيح
              </p>
            </div>

            <div
              className={`p-4 rounded-xl mb-6 ${
                percentage >= 70
                  ? "bg-green-100 text-green-800"
                  : percentage >= 50
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
              {percentage >= 70
                ? "🎉 ممتاز! استمر في المراجعة"
                : percentage >= 50
                ? "👍 جيد! تحتاج لمزيد من المراجعة"
                : "📚 يجب عليك مراجعة السورة أكثر"}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-medium">
                اختبار سورة أخرى
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* شريط التقدم */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                السؤال {currentQuestionIndex + 1} من {questions.length}
              </span>
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 ${
                    questionTimer <= 5
                      ? "text-red-600 animate-pulse"
                      : questionTimer <= 10
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-bold text-lg">{questionTimer}s</span>
                </div>
                <span className="text-sm text-gray-600">النتيجة: {score}</span>
              </div>
            </div>
            {/* شريط التقدم للسؤال */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}></div>
              </div>
            </div>
            {/* شريط المؤقت */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-1000 ${
                  questionTimer <= 5
                    ? "bg-red-500"
                    : questionTimer <= 10
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width: `${(questionTimer / 20) * 100}%`,
                }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* مؤشر تحضير السؤال */}
            {!questionReady && (
              <div className="text-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-600">جاري تحضير السؤال...</p>
              </div>
            )}

            <div className="mb-6">
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                الآية رقم {currentQuestion.ayahNumber}
              </span>
              <h2 className="text-xl font-bold text-gray-800 leading-relaxed mb-4">
                {currentQuestion.question}
              </h2>
              {currentQuestion.context && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p
                    className="text-gray-700 leading-relaxed"
                    style={{ direction: "rtl", textAlign: "right" }}>
                    {currentQuestion.context}
                  </p>
                </div>
              )}

              {/* تنبيه لضمان دقة السؤال */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-700 text-sm text-center">
                  💡 تأكد من قراءة السؤال جيداً. الإجابة الصحيحة موجودة دائماً
                  في الخيارات المعروضة
                </p>
              </div>
            </div>

            {/* زر بدء الاختبار فقط في السؤال الأول */}
            {questionReady &&
              questionsGenerated &&
              !isTimerActive &&
              currentQuestionIndex === 0 && (
                <div className="mb-8 text-center">
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-blue-800 font-semibold mb-3">
                      🎯 السؤال الأول جاهز للبدء!
                    </p>
                    <p className="text-blue-700 text-sm">
                      اضغط "بدء الاختبار" لبدء المؤقت والبدء في الإجابة على
                      الأسئلة
                    </p>
                  </div>
                  <button
                    onClick={startQuestionTimer}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-colors font-bold text-lg">
                    🚀 بدء الاختبار
                  </button>
                </div>
              )}

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "";
                let isDisabled = false;

                if (hasAnswered || questionTimer === 0) {
                  // بعد الإجابة أو انتهاء الوقت
                  if (index === currentQuestion.correctAnswer) {
                    // الإجابة الصحيحة دائماً باللون الأخضر
                    buttonClass =
                      "border-green-500 bg-green-100 text-green-800";
                  } else if (
                    index === selectedAnswer &&
                    selectedAnswer !== currentQuestion.correctAnswer
                  ) {
                    // الإجابة الخاطئة التي اختارها المستخدم باللون الأحمر
                    buttonClass = "border-red-500 bg-red-100 text-red-800";
                  } else {
                    // باقي الخيارات بلون رمادي
                    buttonClass = "border-gray-300 bg-gray-100 text-gray-500";
                  }
                  isDisabled = true;
                } else {
                  // قبل الإجابة
                  if (
                    questionTimer === 0 ||
                    !questionReady ||
                    (currentQuestionIndex === 0 && !isTimerActive)
                  ) {
                    buttonClass =
                      "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed";
                    isDisabled = true;
                  } else if (selectedAnswer === index) {
                    buttonClass = "border-blue-500 bg-blue-50 text-blue-800";
                  } else {
                    buttonClass =
                      "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !hasAnswered && setSelectedAnswer(index)}
                    disabled={isDisabled}
                    className={`w-full p-4 text-right rounded-xl border-2 transition-all duration-200 ${buttonClass}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{option}</span>
                      </div>
                      {hasAnswered && (
                        <div className="flex items-center">
                          {index === currentQuestion.correctAnswer && (
                            <span className="text-green-600 font-bold">✅</span>
                          )}
                          {index === selectedAnswer &&
                            selectedAnswer !==
                              currentQuestion.correctAnswer && (
                              <span className="text-red-600 font-bold">❌</span>
                            )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* رسالة تحذيرية عند اقتراب انتهاء الوقت */}
            {questionTimer <= 5 && questionTimer > 0 && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-center">
                <p className="text-red-700 font-bold animate-pulse">
                  ⏰ الوقت على وشك الانتهاء! {questionTimer} ثوانِ متبقية
                </p>
              </div>
            )}

            {/* رسالة انتهاء الوقت */}
            {questionTimer === 0 && (
              <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
                <p className="text-gray-700 font-bold">
                  ⏱️ انتهى الوقت! سيتم الانتقال للسؤال التالي...
                </p>
              </div>
            )}

            {/* رسالة عند الإجابة الصحيحة */}
            {hasAnswered &&
              selectedAnswer === currentQuestion.correctAnswer && (
                <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                  <p className="text-green-800 font-bold text-lg">
                    🎉 إجابة صحيحة! أحسنت
                  </p>
                </div>
              )}

            {/* رسالة عند الإجابة الخاطئة */}
            {hasAnswered &&
              selectedAnswer !== null &&
              selectedAnswer !== currentQuestion.correctAnswer && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
                  <p className="text-red-800 font-bold text-lg">
                    ❌ إجابة خاطئة. الإجابة الصحيحة هي:{" "}
                    {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                  </p>
                </div>
              )}

            {/* رسالة عند انتهاء الوقت */}
            {hasAnswered && selectedAnswer === null && (
              <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                <p className="text-yellow-800 font-bold text-lg">
                  ⏰ انتهى الوقت! الإجابة الصحيحة هي:{" "}
                  {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                </p>
              </div>
            )}

            {!hasAnswered ? (
              <button
                onClick={handleAnswer}
                disabled={
                  selectedAnswer === null ||
                  questionTimer === 0 ||
                  !questionReady ||
                  (currentQuestionIndex === 0 && !isTimerActive)
                }
                className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                  selectedAnswer !== null &&
                  questionTimer > 0 &&
                  questionReady &&
                  (currentQuestionIndex > 0 || isTimerActive)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}>
                تأكيد الإجابة
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="w-full py-3 px-6 rounded-xl font-medium transition-colors bg-green-600 text-white hover:bg-green-700">
                {currentQuestionIndex < questions.length - 1
                  ? "السؤال التالي"
                  : "إنهاء الاختبار"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // عرض سكلتون عند تحميل السور
  if (surahsLoading) {
    return <TestSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            اختبارات القرآن الكريم
          </h1>
          <p className="text-lg text-gray-600">
            اختر السور التي تريد أن تختبر نفسك فيها (يمكنك اختيار أكثر من سورة)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-3">
              اختر السور للامتحان:
            </label>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedSurahs(surahs.map((s) => s.number))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                تحديد الكل
              </button>
              <button
                type="button"
                onClick={() => setSelectedSurahs([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                إلغاء الكل
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-xl p-4 space-y-2">
              {surahs.map((surah) => (
                <label
                  key={surah.number}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSurahs.includes(surah.number)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSurahs([...selectedSurahs, surah.number]);
                      } else {
                        setSelectedSurahs(
                          selectedSurahs.filter((id) => id !== surah.number)
                        );
                      }
                    }}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ml-3"
                  />
                  <span className="text-lg">
                    {surah.number}. {surah.name} ({surah.numberOfAyahs} آية)
                  </span>
                </label>
              ))}
            </div>
            {selectedSurahs.length > 0 && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-green-800 font-medium">
                    تم اختيار {selectedSurahs.length} سورة
                  </p>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {selectedSurahs.length} من {surahs.length}
                  </span>
                </div>

                {selectedSurahs.length <= 5 ? (
                  <p className="text-green-700 text-sm">
                    {selectedSurahs
                      .map((id) => surahs.find((s) => s.number === id)?.name)
                      .join(" - ")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {selectedSurahs.slice(0, 4).map((id) => (
                        <span
                          key={id}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {surahs.find((s) => s.number === id)?.name}
                        </span>
                      ))}
                      {selectedSurahs.length > 4 && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                          و {selectedSurahs.length - 4} سور أخرى
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-green-700 text-sm mt-3">
                  سيتم توليد الأسئلة من جميع السور المختارة بشكل عشوائي
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-3">
              ⏱️ معلومات المؤقت:
            </h3>
            <ul className="space-y-2 text-yellow-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full ml-3"></span>
                وقت كل سؤال: 20 ثانية
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full ml-3"></span>
                الانتقال التلقائي للسؤال التالي عند انتهاء الوقت
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full ml-3"></span>
                تنبيه بصري عند اقتراب انتهاء الوقت (آخر 5 ثواني)
              </li>
            </ul>
          </div>

          <button
            onClick={startTest}
            disabled={selectedSurahs.length === 0}
            className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-colors ${
              selectedSurahs.length > 0
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            بدء الاختبار
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
