import { useState, useEffect, useCallback } from 'react';
import { TestSkeleton } from '../components/Loading/LoadingSkeleton';
import {
  getAllSurahs,
  getMultipleSurahsWithAyahs,
  generateTestQuestions,
  saveTestResult,
  type Surah,
  type Question,
  type TestResult,
} from '../Api/testApi';

const Test = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
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
        console.error('خطأ في جلب السور:', error);
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
      console.log('نتيجة الاختبار تم حفظها بنجاح');
    } catch (error) {
      console.log('لم يتم حفظ نتيجة الاختبار:', error);
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
      const generatedQuestions = await generateTestQuestions(shuffledAyahs, numberOfQuestions);
      
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
      
      console.log(`تم توليد ${generatedQuestions.length} أسئلة من ${selectedSurahs.length} سور`);
    } catch (error) {
      console.error('خطأ في إعداد الاختبار:', error);
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
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                انتهى الاختبار! 🎉
              </h1>
              <p className="text-gray-600">إليك نتائج أدائك</p>
            </div>

            <div className="mb-8">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {percentage}%
              </div>
              <p className="text-lg text-gray-700">
                {score} من {questions.length} إجابة صحيحة
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-green-700">إجابات صحيحة</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {questions.length - score}
                </div>
                <div className="text-sm text-red-700">إجابات خاطئة</div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={resetTest}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                اختبار جديد
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
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
              <span>النتيجة: {score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                questionTimer <= 5
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {questionTimer}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </h2>

            {currentQuestion.context && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {currentQuestion.context}
                </p>
              </div>
            )}

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
                    className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                      shouldShowCorrect
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : isWrong
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : isSelected
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            اختبار القرآن الكريم 📖
          </h1>
          <p className="text-gray-600">
            اختر السور التي تريد الاختبار فيها (يمكن اختيار أكثر من سورة)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            اختر السور ({selectedSurahs.length} محددة)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => handleSurahSelection(surah.number)}
                className={`p-3 rounded-lg border-2 text-sm transition-colors ${
                  selectedSurahs.includes(surah.number)
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-white border-gray-300 hover:border-green-300'
                }`}
              >
                <div className="font-medium">{surah.name}</div>
                <div className="text-xs text-gray-500">{surah.numberOfAyahs} آية</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={startTest}
            disabled={selectedSurahs.length === 0}
            className={`py-4 px-8 rounded-xl text-lg font-medium transition-colors ${
              selectedSurahs.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            بدء الاختبار
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;