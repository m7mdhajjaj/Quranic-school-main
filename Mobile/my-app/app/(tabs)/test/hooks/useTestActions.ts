import { useState, useCallback } from "react";
import {
  saveTestResult,
  type Question,
  type TestResult,
} from "@/Api/testApi";

export const useTestActions = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  // بدء الاختبار
  const initializeTest = useCallback((questionsLength: number) => {
    setTestStarted(true);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setUserAnswers(new Array(questionsLength).fill(null));
  }, []);

  // الانتقال للسؤال التالي
  const moveToNextQuestion = useCallback(
    (questions: Question[], onFinish: () => void) => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setHasAnswered(false);
      } else {
        onFinish();
      }
    },
    [currentQuestionIndex]
  );

  // اختيار إجابة
  const selectAnswer = useCallback(
    (answerIndex: number, correctAnswer: number) => {
      if (hasAnswered) return;

      setSelectedAnswer(answerIndex);
      setHasAnswered(true);

      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = answerIndex;
        return newAnswers;
      });

      if (answerIndex === correctAnswer) {
        setScore((prev) => prev + 1);
      }
    },
    [hasAnswered, currentQuestionIndex]
  );

  // التعامل مع انتهاء الوقت
  const handleTimeUp = useCallback(() => {
    if (hasAnswered) return;

    setHasAnswered(true);

    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = null;
      return newAnswers;
    });
  }, [hasAnswered, currentQuestionIndex]);

  // إنهاء الاختبار وحفظ النتيجة
  const finishTest = useCallback(
    async (questions: Question[]) => {
      setShowResult(true);

      const result: TestResult = {
        score,
        totalQuestions: questions.length,
        timeSpent: 0,
        correctAnswers: score,
        wrongAnswers: questions.length - score,
        userAnswers,
        questions,
      };

      try {
        await saveTestResult(result);
      } catch (error) {
        console.error("❌ خطأ في حفظ النتيجة:", error);
      }
    },
    [score, userAnswers]
  );

  // إعادة تعيين الاختبار
  const resetTest = useCallback(() => {
    setTestStarted(false);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setUserAnswers([]);
  }, []);

  // تحضير السؤال التالي
  const prepareNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
  }, []);

  return {
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
    resetTest,
    prepareNextQuestion,
  };
};
