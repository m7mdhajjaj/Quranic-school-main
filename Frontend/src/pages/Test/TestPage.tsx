// ============================================================================
// TestPage - الصفحة الرئيسية للاختبار
// ============================================================================

import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useTestData } from "./hooks/useTestData";
import { useTestActions } from "./hooks/useTestActions";
import { useTestTimer } from "./hooks/useTestTimer";
import { SurahSelectionView } from "./SurahSelectionView";
import { TestView } from "./TestView";
import { ResultView } from "./ResultView";
import type { TestResult } from "./types/test";

const TestPage = () => {
  const {
    surahs,
    questions,
    selectedSurahs,
    loading,
    surahsLoading,
    handleSurahSelection,
    clearSelectedSurahs,
    startTest: fetchQuestions,
    resetData,
  } = useTestData();

  const {
    testStarted,
    showResult,
    currentQuestionIndex,
    score,
    selectedAnswer,
    hasAnswered,
    userAnswers,
    initializeTest,
    moveToNextQuestion,
    selectAnswer,
    handleTimeUp,
    finishTest,
    resetTest: resetActions,
    prepareNextQuestion,
  } = useTestActions();

  // Callback لإنهاء الاختبار
  const handleFinishTest = useCallback(() => {
    finishTest(questions);
  }, [finishTest, questions]);

  // Callback للانتقال للسؤال التالي
  const handleMoveNext = useCallback(() => {
    moveToNextQuestion(questions, handleFinishTest);
  }, [moveToNextQuestion, questions, handleFinishTest]);

  // Callback للوقت المنتهي
  const handleTimerUp = useCallback(() => {
    handleTimeUp();
    setTimeout(() => {
      handleMoveNext();
    }, 2000);
  }, [handleTimeUp, handleMoveNext]);

  const { questionTimer, resetTimer, stopTimer, startTimer } = useTestTimer({
    testStarted,
    showResult,
    hasAnswered,
    onTimeUp: handleTimerUp,
  });

  // تحضير السؤال الجديد
  useEffect(() => {
    if (testStarted && !showResult) {
      resetTimer();
      prepareNextQuestion();

      const prepareQuestion = setTimeout(() => {
        startTimer();
      }, 500);

      return () => clearTimeout(prepareQuestion);
    }
  }, [
    currentQuestionIndex,
    testStarted,
    showResult,
    resetTimer,
    prepareNextQuestion,
    startTimer,
  ]);

  // بدء الاختبار
  const handleStartTest = async () => {
    const result = await fetchQuestions();

    if (!result.success || result.questions.length === 0) {
      toast.error("❌ فشل في تحميل الأسئلة. يرجى المحاولة مرة أخرى.");
      return;
    }

    initializeTest(result.questions.length);
  };

  // اختيار إجابة
  const handleSelectAnswer = (answerIndex: number) => {
    if (hasAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    selectAnswer(answerIndex, currentQuestion.correctAnswer);
    stopTimer();

    setTimeout(() => {
      handleMoveNext();
    }, 2000);
  };

  // إعادة تعيين كامل
  const handleResetTest = () => {
    resetActions();
    resetData();
  };

  // الذهاب للرئيسية
  const handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  // عرض Loading
  if (surahsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // عرض النتيجة
  if (showResult && questions.length > 0) {
    const result: TestResult = {
      score,
      totalQuestions: questions.length,
      timeSpent: 0,
      correctAnswers: score,
      wrongAnswers: questions.length - score,
      userAnswers,
      questions,
    };

    return (
      <ResultView
        result={result}
        onResetTest={handleResetTest}
        onGoHome={handleGoHome}
      />
    );
  }

  // عرض الاختبار
  if (testStarted && questions.length > 0) {
    return (
      <TestView
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        score={score}
        selectedAnswer={selectedAnswer}
        hasAnswered={hasAnswered}
        questionTimer={questionTimer}
        onSelectAnswer={handleSelectAnswer}
      />
    );
  }

  // عرض اختيار السور
  return (
    <SurahSelectionView
      surahs={surahs}
      selectedSurahs={selectedSurahs}
      onSurahSelect={handleSurahSelection}
      onStartTest={handleStartTest}
      onClearAll={clearSelectedSurahs}
      loading={loading}
    />
  );
};

export default TestPage;
