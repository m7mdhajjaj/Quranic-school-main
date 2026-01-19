import React, { useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useTestData } from "./hooks/useTestData";
import { useTestActions } from "./hooks/useTestActions";
import { useTestTimer } from "./hooks/useTestTimer";
import { SurahSelectionView } from "./components/SurahSelectionView";
import { TestView } from "./components/TestView";
import { ResultView } from "./components/ResultView";
import type { TestResult } from "@/Api/testApi";

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

  // بدء الاختبار
  const handleStartTest = async () => {
    const result = await fetchQuestions();

    if (!result.success || result.questions.length === 0) {
      Alert.alert("خطأ", "❌ فشل في تحميل الأسئلة. يرجى المحاولة مرة أخرى.");
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
