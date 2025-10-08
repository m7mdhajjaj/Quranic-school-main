import { useState, useEffect, useCallback } from "react";
import { TestSkeleton } from "../components/Loading/LoadingSkeleton";
import {
  getAllSurahs,
  getMultipleSurahsWithAyahs,
  generateTestQuestions,
  saveTestResult,
  type Surah,
  type Question,
  type TestResult,
} from "../Api/testApi";

const Test = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(20);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [surahsLoading, setSurahsLoading] = useState(true);

  // Load Surahs
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

  // Finish test and save result using API
  const finishTest = useCallback(async () => {
    setIsTimerActive(false);
    setShowResult(true);

    const correctAnswers = userAnswers.filter(
      (answer, index) => answer === questions[index]?.correctAnswer
    ).length;

    const testResult: TestResult = {
      score: correctAnswers,
      totalQuestions: questions.length,
      timeSpent: 0,
      correctAnswers,
      wrongAnswers: questions.length - correctAnswers,
      userAnswers,
      questions,
    };

    try {
      await saveTestResult(testResult);
      console.log("نتيجة الاختبار تم حفظها بنجاح");
    } catch (error) {
      console.log("لم يتم حفظ نتيجة الاختبار:", error);
    }
  }, [userAnswers, questions]);

  // Move to next question or finish test
  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishTest();
    }
  }, [currentQuestionIndex, questions.length, finishTest]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (hasAnswered) return;

    setIsTimerActive(false);
    setHasAnswered(true);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = null;
    setUserAnswers(newUserAnswers);

    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  }, [hasAnswered, userAnswers, currentQuestionIndex, moveToNextQuestion]);

  // Question timer logic
  useEffect(() => {
    if (isTimerActive && testStarted && !showResult && questionTimer > 0) {
      const timer = setTimeout(() => {
        setQuestionTimer(questionTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (questionTimer === 0 && testStarted && !showResult) {
      handleTimeUp();
    }
  }, [questionTimer, isTimerActive, testStarted, showResult, handleTimeUp]);

  // Prepare new question
  useEffect(() => {
    if (testStarted && !showResult) {
      setQuestionTimer(20);
      setIsTimerActive(false);
      setSelectedAnswer(null);
      setHasAnswered(false);

      const prepareQuestion = setTimeout(() => {
        setIsTimerActive(true);
      }, 500);

      return () => clearTimeout(prepareQuestion);
    }
  }, [currentQuestionIndex, testStarted, showResult]);

  // Handle Surah selection
  const handleSurahSelection = (surahNumber: number) => {
    setSelectedSurahs((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((s) => s !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  // Start test by fetching ayahs and generating questions using API
  const startTest = useCallback(async () => {
    if (selectedSurahs.length === 0) return;

    setLoading(true);
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);

    try {
      // استخدام API لجلب الآيات
      const allAyahs = await getMultipleSurahsWithAyahs(selectedSurahs);
      const shuffledAyahs = allAyahs.sort(() => Math.random() - 0.5);
      const numberOfQuestions = Math.min(10, shuffledAyahs.length);

      // استخدام API لتوليد الأسئلة
      const generatedQuestions = await generateTestQuestions(
        shuffledAyahs,
        numberOfQuestions
      );

      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));

      console.log(
        `تم توليد ${generatedQuestions.length} أسئلة من ${selectedSurahs.length} سور`
      );
    } catch (error) {
      console.error("خطأ في إعداد الاختبار:", error);
      setTestStarted(false);
    } finally {
      setLoading(false);
    }
  }, [selectedSurahs]);

  // Handle answer selection
  const selectAnswer = (answerIndex: number) => {
    if (hasAnswered) return;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    setIsTimerActive(false);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newUserAnswers);

    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  // Reset test
  const resetTest = () => {
    setTestStarted(false);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestions([]);
    setUserAnswers([]);
    setSelectedSurahs([]);
  };

  if (surahsLoading) {
    return <TestSkeleton />;
  }

  if (loading) {
    return <TestSkeleton />;
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;
    const isAverage = percentage >= 50;

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* نتيجة الاختبار */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 text-center border border-emerald-100">
            {/* أيقونة النجاح */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-4 ${
                  isPerfect
                    ? "bg-gradient-to-br from-yellow-400 to-orange-400 animate-bounce"
                    : isGood
                    ? "bg-gradient-to-br from-emerald-400 to-teal-400"
                    : isAverage
                    ? "bg-gradient-to-br from-blue-400 to-cyan-400"
                    : "bg-gradient-to-br from-gray-400 to-slate-400"
                } shadow-lg`}>
                <span className="text-5xl">
                  {isPerfect ? "🏆" : isGood ? "🌟" : isAverage ? "👍" : "📝"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">
                {isPerfect
                  ? "ممتاز! نتيجة كاملة! 🎉"
                  : isGood
                  ? "أحسنت! نتيجة رائعة! 🌟"
                  : isAverage
                  ? "جيد! يمكنك التحسين 💪"
                  : "حاول مرة أخرى 📚"}
              </h1>
              <p className="text-gray-600 text-lg">
                انتهى الاختبار - إليك نتيجتك
              </p>
            </div>

            {/* النسبة المئوية الكبيرة */}
            <div className="mb-8 relative">
              <div className="relative inline-block">
                {/* دائرة تقدم */}
                <svg
                  className="w-48 h-48 mx-auto transform -rotate-90"
                  viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={
                      isPerfect
                        ? "#f59e0b"
                        : isGood
                        ? "#10b981"
                        : isAverage
                        ? "#3b82f6"
                        : "#6b7280"
                    }
                    strokeWidth="8"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className={`text-5xl md:text-6xl font-bold ${
                      isPerfect
                        ? "text-yellow-600"
                        : isGood
                        ? "text-emerald-600"
                        : isAverage
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}>
                    {percentage}%
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-700 mt-4 font-medium">
                {score} من {questions.length} إجابة صحيحة
              </p>
            </div>

            {/* إحصائيات مفصلة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-emerald-600 mb-1">
                  {score}
                </div>
                <div className="text-sm font-medium text-emerald-700">
                  ✓ إجابات صحيحة
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-red-600 mb-1">
                  {questions.length - score}
                </div>
                <div className="text-sm font-medium text-red-700">
                  ✗ إجابات خاطئة
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {questions.length}
                </div>
                <div className="text-sm font-medium text-blue-700">
                  📝 إجمالي الأسئلة
                </div>
              </div>
            </div>

            {/* رسالة تحفيزية */}
            <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 p-4 rounded-xl mb-6 border border-emerald-200">
              <p className="text-gray-700 font-medium">
                {isPerfect
                  ? "🌟 ما شاء الله! حفظك ممتاز، استمر في المراجعة!"
                  : isGood
                  ? "💪 أداء جيد جداً! واصل الاجتهاد لتصل للكمال"
                  : isAverage
                  ? "📖 نتيجة مقبولة، المزيد من المراجعة سيحسن أداءك"
                  : "🤲 لا تيأس، الممارسة والمراجعة المستمرة هي المفتاح"}
              </p>
            </div>

            {/* أزرار الإجراءات */}
            <div className="space-y-3">
              <button
                onClick={resetTest}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                🔄 اختبار جديد
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-300">
                🏠 العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* شريط التقدم والإحصائيات */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm md:text-base shadow-md">
                  السؤال {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-xl font-bold text-emerald-700 border border-emerald-200">
                  <span className="text-2xl">⭐</span> {score}
                </div>
              </div>
              <div className="text-gray-600 text-sm font-medium hidden md:block">
                {Math.round(progress)}% مكتمل
              </div>
            </div>

            {/* شريط التقدم المحسّن */}
            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out shadow-md"
                style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* مؤقت السؤال */}
          <div className="text-center mb-6">
            <div className="inline-block">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full text-3xl md:text-4xl font-bold shadow-xl transition-all duration-300 ${
                  questionTimer <= 5
                    ? "bg-gradient-to-br from-red-500 to-pink-500 text-white animate-pulse scale-110"
                    : questionTimer <= 10
                    ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                }`}>
                {questionTimer}
              </div>
              <div className="text-gray-600 text-sm mt-2 font-medium">
                {questionTimer <= 5 ? "⚠️ أسرع!" : "⏱️ الوقت المتبقي"}
              </div>
            </div>
          </div>

          {/* بطاقة السؤال */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border border-blue-100">
            {/* رقم السؤال والتصنيف */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                سؤال {currentQuestionIndex + 1}
              </div>
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                📖 اختبار قرآني
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {currentQuestion.context && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl mb-6 border-r-4 border-emerald-500 shadow-md">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">📜</span>
                  <p className="text-gray-700 leading-loose font-arabic text-lg">
                    {currentQuestion.context}
                  </p>
                </div>
              </div>
            )}

            {/* خيارات الإجابة */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const isWrong = hasAnswered && isSelected && !isCorrect;
                const shouldShowCorrect = hasAnswered && isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={hasAnswered}
                    className={`group w-full p-4 md:p-5 text-right rounded-2xl border-2 transition-all duration-300 font-medium text-base md:text-lg ${
                      shouldShowCorrect
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-500 text-emerald-800 shadow-lg scale-105"
                        : isWrong
                        ? "bg-gradient-to-r from-red-100 to-pink-100 border-red-500 text-red-800 shadow-lg"
                        : isSelected
                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800"
                        : "bg-white border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md hover:-translate-y-0.5"
                    } ${hasAnswered ? "cursor-default" : "cursor-pointer"}`}>
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{option}</span>
                      {shouldShowCorrect && (
                        <span className="text-2xl mr-2 animate-bounce">✓</span>
                      )}
                      {isWrong && <span className="text-2xl mr-2">✗</span>}
                      {!hasAnswered && (
                        <span className="text-gray-400 group-hover:text-indigo-500 transition-colors mr-2">
                          {index === 0
                            ? "①"
                            : index === 1
                            ? "②"
                            : index === 2
                            ? "③"
                            : "④"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* رسالة تشجيعية */}
          {!hasAnswered && questionTimer <= 10 && (
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-full border border-yellow-300 shadow-md">
                <span className="text-gray-700 font-medium">
                  {questionTimer <= 5
                    ? "⚡ أسرع! الوقت ينفد"
                    : "💡 فكّر جيداً قبل الإجابة"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg ">
              🕌 مركز اختبارات القرآن الكريم
            </div>
          </div>
          <h1 className=" text-4xl md:text-5xl font-bold text-indigo-600 mb-4">
            اختبار القرآن الكريم 📖
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto ">
            اختر السور التي تريد أن تختبر حفظك فيها - يمكنك اختيار سورة واحدة أو
            عدة سور
          </p>
        </div>

        {/* بطاقة اختيار السور */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 mb-8 border border-indigo-100">
          {/* رأس القسم */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl shadow-md">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">اختر السور</h2>
                <p className="text-sm text-gray-500">اختر من القائمة أدناه</p>
              </div>
            </div>

            {/* عداد السور المختارة */}
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-5 py-3 rounded-2xl border-2 border-emerald-300 shadow-md">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700">
                  {selectedSurahs.length}
                </div>
                <div className="text-xs font-medium text-emerald-600">
                  سورة محددة
                </div>
              </div>
            </div>
          </div>

          {/* رسالة توجيهية */}
          {selectedSurahs.length === 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-200">
              <p className="text-gray-700 text-center font-medium">
                👈 اختر سورة واحدة على الأقل للبدء في الاختبار
              </p>
            </div>
          )}

          {/* أزرار التنقل والعرض */}
          <div className="mb-4">
            {/* أزرار التنقل */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                  currentPage === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-x-1"
                }`}>
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">السابق</span>
                <span className="sm:hidden">◄</span>
              </button>

              {/* مؤشر الصفحة الحالية للموبايل */}
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                  {currentPage + 1} / {Math.ceil(surahs.length / 18)}
                </div>
              </div>

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(Math.ceil(surahs.length / 18) - 1, currentPage + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(surahs.length / 18) - 1}
                className={`flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                  currentPage >= Math.ceil(surahs.length / 18) - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:translate-x-1"
                }`}>
                <span className="hidden sm:inline">التالي</span>
                <span className="sm:hidden">►</span>
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* أزرار الصفحات - مخفية على الموبايل الصغير */}
            <div className="hidden md:flex gap-2 justify-center">
              {Array.from({ length: Math.ceil(surahs.length / 18) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-10 h-10 rounded-full font-bold transition-all duration-300 ${
                      currentPage === index
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-110"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}>
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </div>

          {/* شبكة السور مع Pagination */}
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {surahs
                .slice(currentPage * 18, (currentPage + 1) * 18)
                .map((surah) => {
                  const isSelected = selectedSurahs.includes(surah.number);
                  return (
                    <button
                      key={surah.number}
                      onClick={() => handleSurahSelection(surah.number)}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-sm transition-all duration-300 transform active:scale-95 md:hover:scale-105 hover:shadow-xl ${
                        isSelected
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600 text-white shadow-lg scale-[1.02] md:scale-105"
                          : "bg-white border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50"
                      }`}>
                      {/* رقم السورة */}
                      <div
                        className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md ${
                          isSelected
                            ? "bg-yellow-400 text-yellow-900"
                            : "bg-gray-200 text-gray-600 group-hover:bg-indigo-500 group-hover:text-white"
                        }`}>
                        {surah.number}
                      </div>

                      {/* علامة الاختيار */}
                      {isSelected && (
                        <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce">
                          <span className="text-emerald-600 text-sm sm:text-lg">
                            ✓
                          </span>
                        </div>
                      )}

                      {/* محتوى البطاقة */}
                      <div className="mt-1">
                        <div
                          className={`font-bold mb-0.5 sm:mb-1 text-sm sm:text-base leading-tight ${
                            isSelected
                              ? "text-white"
                              : "text-gray-800 group-hover:text-indigo-700"
                          }`}>
                          {surah.name}
                        </div>
                        <div
                          className={`text-[10px] sm:text-xs ${
                            isSelected
                              ? "text-emerald-100"
                              : "text-gray-500 group-hover:text-indigo-600"
                          }`}>
                          📄 {surah.numberOfAyahs} آية
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* مؤشر عدد السور المعروضة */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 px-3 sm:px-4 py-2 rounded-full border border-gray-300">
                <span className="text-gray-700 font-medium text-xs sm:text-sm">
                  <span className="hidden sm:inline">عرض </span>
                  {currentPage * 18 + 1} -{" "}
                  {Math.min((currentPage + 1) * 18, surahs.length)}
                  <span className="hidden sm:inline">
                    {" "}
                    من {surahs.length} سورة
                  </span>
                  <span className="sm:hidden"> / {surahs.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={startTest}
            disabled={selectedSurahs.length === 0}
            className={`group relative overflow-hidden py-4 sm:py-5 px-8 sm:px-10 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold transition-all duration-300 shadow-xl ${
              selectedSurahs.length > 0
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl active:scale-95 md:hover:scale-105 transform"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            <div className="relative z-10 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🎯</span>
              <span>بدء الاختبار</span>
              {selectedSurahs.length > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {selectedSurahs.length}
                </span>
              )}
            </div>
            {selectedSurahs.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
          </button>

          {selectedSurahs.length > 0 && (
            <button
              onClick={() => setSelectedSurahs([])}
              className="py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
              🗑️ مسح الكل
            </button>
          )}
        </div>

        {/* إحصائيات سريعة */}
        {selectedSurahs.length > 0 && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-200 text-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📊</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-700">
                ~10
              </div>
              <div className="text-xs sm:text-sm text-blue-600">
                أسئلة متوقعة
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-purple-200 text-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⏱️</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-700">
                20 ث
              </div>
              <div className="text-xs sm:text-sm text-purple-600">لكل سؤال</div>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-200 text-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-700">
                {selectedSurahs.reduce((sum, num) => {
                  const surah = surahs.find((s) => s.number === num);
                  return sum + (surah?.numberOfAyahs || 0);
                }, 0)}
              </div>
              <div className="text-xs sm:text-sm text-amber-600">
                آية إجمالية
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;
