/**
 * نظام اختبارات القرآن الكريم المحسّن
 * - استخدام API للقرآن الكريم
 * - أسئلة متنوعة: كلمات مخفية، بداية الآيات، ختام الآيات
 * - خيارات ذكية ومتقدمة للإجابات الخاطئة
 * - واجهة مستخدم تفاعلية ومتجاوبة
 */

import { useState, useEffect } from "react";

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

  // جلب قائمة السور
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        console.error("خطأ في جلب السور:", error);
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

  // توليد الأسئلة
  const generateQuestions = async (
    ayahsData: (Ayah & { surahNumber: number })[]
  ) => {
    const generatedQuestions: Question[] = [];
    const numberOfQuestions = Math.min(10, ayahsData.length); // حد أقصى 10 أسئلة

    for (let i = 0; i < numberOfQuestions; i++) {
      const randomAyahIndex = Math.floor(Math.random() * ayahsData.length);
      const ayah = ayahsData[randomAyahIndex];

      // نوع السؤال عشوائي
      const questionTypes: Question["type"][] = [
        "hidden-word",
        "next-ayah-start",
        "ayah-ending",
      ];
      const randomType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question: Question;

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

      generatedQuestions.push(question);
    }

    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(null)); // تهيئة مصفوفة الإجابات
  };

  // توليد سؤال الكلمة المخفية
  const generateHiddenWordQuestion = async (
    ayah: Ayah & { surahNumber: number },
    questionId: number
  ): Promise<Question> => {
    const words = ayah.text.split(" ").filter((word) => word.length > 2);
    const randomWordIndex = Math.floor(Math.random() * words.length);
    const hiddenWord = words[randomWordIndex];

    const questionText = ayah.text.replace(hiddenWord, "____");

    // توليد خيارات خاطئة
    const wrongOptions = await generateWrongWordOptions(hiddenWord, ayah.text);

    // إزالة التكرارات والتأكد من عدم تكرار الإجابة الصحيحة
    const uniqueWrongOptions = wrongOptions
      .filter(
        (option, index, arr) =>
          arr.indexOf(option) === index && // إزالة التكرارات
          option !== hiddenWord && // التأكد من أن الخيار الخاطئ ليس مطابقاً للصحيح
          option.trim() !== hiddenWord.trim() // التأكد من عدم التطابق حتى مع المسافات
      )
      .slice(0, 3); // أخذ أول 3 خيارات فقط

    const allOptions = [hiddenWord, ...uniqueWrongOptions];

    // خلط الخيارات مع الاحتفاظ بمؤشر الإجابة الصحيحة
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const finalCorrectIndex = shuffledOptions.indexOf(hiddenWord);

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

  // توليد سؤال بداية الآية التالية
  const generateNextAyahStartQuestion = async (
    ayah: Ayah & { surahNumber: number },
    ayahsData: (Ayah & { surahNumber: number })[],
    questionId: number
  ): Promise<Question> => {
    // البحث عن الآيات من نفس السورة فقط
    const sameSurahAyahs = ayahsData.filter(
      (a) => a.surahNumber === ayah.surahNumber
    );
    const currentIndex = sameSurahAyahs.findIndex(
      (a) => a.number === ayah.number
    );

    if (currentIndex === -1 || currentIndex === sameSurahAyahs.length - 1) {
      // إذا كانت الآية الأخيرة في السورة، نعيد سؤال كلمة مخفية
      return await generateHiddenWordQuestion(ayah, questionId);
    }

    const nextAyah = sameSurahAyahs[currentIndex + 1];
    const nextAyahWords = nextAyah.text.split(" ");
    const firstThreeWords = nextAyahWords.slice(0, 3).join(" ");

    // توليد خيارات خاطئة من آيات أخرى (من نفس السورة ومن سور أخرى)
    const wrongOptions = await generateWrongAyahStartOptions(
      firstThreeWords,
      ayahsData
    );

    // إزالة التكرارات والتأكد من عدم تكرار الإجابة الصحيحة
    const uniqueWrongOptions = wrongOptions
      .filter(
        (option, index, arr) =>
          arr.indexOf(option) === index && // إزالة التكرارات
          option !== firstThreeWords && // التأكد من أن الخيار الخاطئ ليس مطابقاً للصحيح
          option.trim() !== firstThreeWords.trim() // التأكد من عدم التطابق حتى مع المسافات
      )
      .slice(0, 3); // أخذ أول 3 خيارات فقط

    const allOptions = [firstThreeWords, ...uniqueWrongOptions];

    // خلط الخيارات مع الاحتفاظ بمؤشر الإجابة الصحيحة
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const finalCorrectIndex = shuffledOptions.indexOf(firstThreeWords);

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
      context: `الآية: "${ayah.text}"`,
    };
  };

  // توليد سؤال ختام الآية
  const generateAyahEndingQuestion = async (
    ayah: Ayah & { surahNumber: number },
    ayahsData: (Ayah & { surahNumber: number })[],
    questionId: number
  ): Promise<Question> => {
    const words = ayah.text.split(" ");
    const lastThreeWords = words.slice(-3).join(" ");

    // عرض جزء من الآية (أول 5-8 كلمات) + علامة "____"
    const firstPart = words.slice(0, Math.min(8, words.length - 3)).join(" ");
    const questionText = firstPart + " ____";

    // توليد خيارات خاطئة
    const wrongOptions = await generateWrongEndingOptions(
      lastThreeWords,
      ayahsData
    );

    // إزالة التكرارات والتأكد من عدم تكرار الإجابة الصحيحة
    const uniqueWrongOptions = wrongOptions
      .filter(
        (option, index, arr) =>
          arr.indexOf(option) === index && // إزالة التكرارات
          option !== lastThreeWords && // التأكد من أن الخيار الخاطئ ليس مطابقاً للصحيح
          option.trim() !== lastThreeWords.trim() // التأكد من عدم التطابق حتى مع المسافات
      )
      .slice(0, 3); // أخذ أول 3 خيارات فقط

    const allOptions = [lastThreeWords, ...uniqueWrongOptions];

    // خلط الخيارات مع الاحتفاظ بمؤشر الإجابة الصحيحة
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    const finalCorrectIndex = shuffledOptions.indexOf(lastThreeWords);

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

  // دالة مساعدة لتوليد كلمات مشابهة في التركيب
  const generateSimilarWords = (originalWord: string): string[] => {
    const similarWords = [
      // أسماء الله الحسنى
      "الْعَلِيمُ",
      "الْحَكِيمُ",
      "الرَّحْمَنُ",
      "الرَّحِيمُ",
      "الْعَزِيزُ",
      "الْغَفُورُ",
      "الصَّبُورُ",
      "الشَّكُورُ",
      "الْحَلِيمُ",
      "الْكَرِيمُ",
      "الْعَظِيمُ",

      // كلمات إيمانية
      "الْمُؤْمِنُونَ",
      "الْمُسْلِمُونَ",
      "الْمُتَّقُونَ",
      "الصَّالِحُونَ",
      "الْمُفْلِحُونَ",

      // أفعال قرآنية
      "يُؤْمِنُونَ",
      "يَعْقِلُونَ",
      "يَتَفَكَّرُونَ",
      "يَذْكُرُونَ",
      "يَشْكُرُونَ",

      // مفاهيم قرآنية
      "الْجَنَّةُ",
      "النَّارُ",
      "الْآخِرَةُ",
      "الدُّنْيَا",
      "الْهُدَى",
      "الضَّلَالُ",
    ];

    // فلترة الكلمات المشابهة حسب الطول والحروف الأولى
    return similarWords
      .filter(
        (word) =>
          word !== originalWord &&
          Math.abs(word.length - originalWord.length) <= 2 &&
          word.charAt(0) === originalWord.charAt(0)
      )
      .slice(0, 2);
  };

  // توليد خيارات خاطئة للكلمات - محسّنة لتكون أكثر صعوبة
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
      const cleanWord = word.replace(/[\u064B-\u0652]/g, ""); // إزالة التشكيل

      for (const [category, words] of Object.entries(commonWords)) {
        if (
          words.some(
            (w) =>
              cleanWord.includes(w.replace(/[\u064B-\u0652]/g, "")) ||
              w.replace(/[\u064B-\u0652]/g, "").includes(cleanWord)
          )
        ) {
          return category as keyof typeof commonWords;
        }
      }
      return "general";
    };

    const category = getWordCategory(correctWord);
    let wrongOptions: string[] = [];

    // إضافة كلمات من نفس التصنيف
    if (category !== "general") {
      const categoryWords = commonWords[category]
        .filter(
          (word) =>
            !correctWord.includes(word.replace(/[\u064B-\u0652]/g, "")) &&
            !word
              .replace(/[\u064B-\u0652]/g, "")
              .includes(correctWord.replace(/[\u064B-\u0652]/g, ""))
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      wrongOptions.push(...categoryWords);
    }

    // محاولة جلب كلمات مشابهة من سور أخرى
    try {
      const response = await fetch(
        "https://api.alquran.cloud/v1/search/" +
          correctWord.replace(/[\u064B-\u0652]/g, "") +
          "/all/ar"
      );
      if (response.ok) {
        const searchData = await response.json();
        if (searchData.data && searchData.data.matches) {
          const similarWords = searchData.data.matches
            .flatMap((match: any) => match.text.split(" "))
            .filter(
              (word: string) =>
                word !== correctWord &&
                word.length > 2 &&
                word
                  .replace(/[\u064B-\u0652]/g, "")
                  .includes(
                    correctWord.replace(/[\u064B-\u0652]/g, "").substring(0, 3)
                  )
            )
            .slice(0, 2);
          wrongOptions.push(...similarWords);
        }
      }
    } catch (error) {
      console.log("خطأ في البحث عن كلمات مشابهة:", error);
    }

    // إضافة كلمات مع تشكيل مشابه
    if (wrongOptions.length < 3) {
      const similarWords = generateSimilarWords(correctWord);
      wrongOptions.push(...similarWords.slice(0, 3 - wrongOptions.length));
    }

    // إضافة كلمات عامة كاحتياط أخير
    if (wrongOptions.length < 3) {
      const allCommonWords = Object.values(commonWords)
        .flat()
        .filter(
          (word) =>
            !correctWord.includes(word.replace(/[\u064B-\u0652]/g, "")) &&
            !wrongOptions.includes(word) // تجنب التكرار
        )
        .sort(() => Math.random() - 0.5);
      wrongOptions.push(...allCommonWords.slice(0, 3 - wrongOptions.length));
    }

    // إزالة أي تكرارات نهائية وإرجاع خيارات فريدة
    const uniqueOptions = wrongOptions.filter(
      (option, index, arr) =>
        arr.indexOf(option) === index && // إزالة التكرارات
        option !== correctWord && // التأكد من عدم تطابق مع الإجابة الصحيحة
        option.trim() !== correctWord.trim()
    );

    return uniqueOptions.slice(0, 3);
  };

  // توليد خيارات خاطئة لبداية الآيات - محسّنة
  const generateWrongAyahStartOptions = async (
    correctStart: string,
    ayahsData: (Ayah & { surahNumber: number })[]
  ): Promise<string[]> => {
    const wrongStarts: string[] = [];

    // جلب بدايات من نفس السورة
    const localStarts = ayahsData
      .map((ayah) => ayah.text.split(" ").slice(0, 3).join(" "))
      .filter((start) => start !== correctStart)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    wrongStarts.push(...localStarts);

    // محاولة جلب بدايات مشابهة من سور أخرى
    try {
      const firstWord = correctStart.split(" ")[0];
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${firstWord}/all/ar`
      );
      if (response.ok) {
        const searchData = await response.json();
        if (searchData.data && searchData.data.matches) {
          const similarStarts = searchData.data.matches
            .map((match: any) => match.text.split(" ").slice(0, 3).join(" "))
            .filter(
              (start: string) =>
                start !== correctStart && !wrongStarts.includes(start)
            )
            .slice(0, 1);
          wrongStarts.push(...similarStarts);
        }
      }
    } catch (error) {
      console.log("خطأ في البحث:", error);
    }

    // بدايات شائعة في القرآن كخيارات احتياطية
    const commonStarts = [
      "وَالَّذِينَ آمَنُوا وَعَمِلُوا",
      "يَا أَيُّهَا الَّذِينَ",
      "قُل لَّا أَجِدُ",
      "إِنَّ الَّذِينَ كَفَرُوا",
      "وَمَا كَانَ لِمُؤْمِنٍ",
      "وَلَقَدْ أَرْسَلْنَا إِلَىٰ",
    ];

    // إضافة خيارات احتياطية إذا لم نحصل على ما يكفي
    if (wrongStarts.length < 3) {
      const backupOptions = commonStarts
        .filter(
          (start) => !wrongStarts.includes(start) && start !== correctStart
        )
        .slice(0, 3 - wrongStarts.length);
      wrongStarts.push(...backupOptions);
    }

    // إزالة أي تكرارات نهائية وإرجاع خيارات فريدة
    const uniqueOptions = wrongStarts.filter(
      (option, index, arr) =>
        arr.indexOf(option) === index && // إزالة التكرارات
        option !== correctStart && // التأكد من عدم تطابق مع الإجابة الصحيحة
        option.trim() !== correctStart.trim()
    );

    return uniqueOptions.slice(0, 3);
  };

  // توليد خيارات خاطئة لنهاية الآيات - محسّنة
  const generateWrongEndingOptions = async (
    correctEnding: string,
    ayahsData: (Ayah & { surahNumber: number })[]
  ): Promise<string[]> => {
    const wrongEndings: string[] = [];

    // جلب نهايات من آيات أخرى في نفس السورة
    const localEndings = ayahsData
      .map((ayah) => ayah.text.split(" ").slice(-3).join(" "))
      .filter((ending) => ending !== correctEnding)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    wrongEndings.push(...localEndings);

    // نهايات شائعة في القرآن الكريم
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
    ];

    // إضافة نهايات شائعة كخيارات إضافية
    if (wrongEndings.length < 3) {
      const additionalOptions = commonEndings
        .filter(
          (ending) => !wrongEndings.includes(ending) && ending !== correctEnding
        )
        .slice(0, 3 - wrongEndings.length);
      wrongEndings.push(...additionalOptions);
    }

    // إزالة أي تكرارات نهائية وإرجاع خيارات فريدة
    const uniqueOptions = wrongEndings.filter(
      (option, index, arr) =>
        arr.indexOf(option) === index && // إزالة التكرارات
        option !== correctEnding && // التأكد من عدم تطابق مع الإجابة الصحيحة
        option.trim() !== correctEnding.trim()
    );

    return uniqueOptions.slice(0, 3);
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري تحضير الاختبار...</p>
        </div>
      </div>
    );
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
