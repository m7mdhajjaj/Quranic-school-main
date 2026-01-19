import { useState, useEffect, useCallback } from "react";

interface UseTestTimerProps {
  testStarted: boolean;
  showResult: boolean;
  hasAnswered: boolean;
  onTimeUp: () => void;
}

export const useTestTimer = ({
  testStarted,
  showResult,
  hasAnswered,
  onTimeUp,
}: UseTestTimerProps) => {
  const [questionTimer, setQuestionTimer] = useState(20);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // إعادة تعيين المؤقت
  const resetTimer = useCallback(() => {
    setQuestionTimer(20);
    setIsTimerActive(false);
  }, []);

  // إيقاف المؤقت
  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
  }, []);

  // بدء المؤقت
  const startTimer = useCallback(() => {
    setIsTimerActive(true);
  }, []);

  // منطق المؤقت
  useEffect(() => {
    if (isTimerActive && testStarted && !showResult && questionTimer > 0) {
      const timer = setTimeout(() => {
        setQuestionTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (questionTimer === 0 && testStarted && !showResult) {
      if (!hasAnswered) {
        stopTimer();
        onTimeUp();
      }
    }
  }, [
    questionTimer,
    isTimerActive,
    testStarted,
    showResult,
    hasAnswered,
    onTimeUp,
    stopTimer,
  ]);

  return {
    questionTimer,
    isTimerActive,
    resetTimer,
    stopTimer,
    startTimer,
  };
};
