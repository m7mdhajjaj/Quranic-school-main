// ============================================================================
// TestPage - الصفحة الرئيسية للاختبار
// ============================================================================

import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useBlocker } from "react-router-dom";
import { useTestData } from "./hooks/useTestData";
import { useTestActions } from "./hooks/useTestActions";
import { useTestTimer } from "./hooks/useTestTimer";
import { SurahSelectionView, TestView, ResultView } from "./components";
import type { TestResult } from './types/test';

const TestPage = () => {
  const {
    surahs,
    questions,
    selectedSurahs,
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

  // حماية من مغادرة الصفحة أثناء الاختبار
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testStarted && !showResult) {
        e.preventDefault();
        e.returnValue = '⚠️ لديك اختبار قيد التنفيذ! ستفقد نتيجتك إذا غادرت الصفحة.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testStarted, showResult]);

  // منع الانتقال لصفحات أخرى أثناء الاختبار
  useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (testStarted && !showResult && currentLocation.pathname !== nextLocation.pathname) {
        return !window.confirm(
          '⚠️ لديك اختبار قيد التنفيذ!\n\nستفقد نتيجتك وإجاباتك إذا غادرت الصفحة.\n\nهل أنت متأكد من المغادرة؟'
        );
      }
      return false;
    }
  );

  // بدء الاختبار
  const handleStartTest = async () => {
    const result = await fetchQuestions();

    if (!result.success || result.questions.length === 0) {
      toast.error('❌ فشل في تحميل الأسئلة. يرجى المحاولة مرة أخرى.');
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

  // إعادة تعيين كامل والرجوع لاختيار السور
  const handleResetTest = () => {
    resetActions();
    resetData();
  };

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
        onGoHome={handleResetTest}
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
      loading={surahsLoading}
    />
  );
};

export default TestPage;
