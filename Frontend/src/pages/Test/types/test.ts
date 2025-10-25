// ============================================================================
// Types & Interfaces للاختبار القرآني
// ============================================================================

import type { Surah, Question, TestResult } from "../../../Api/testApi";

// Re-export types from API
export type { Surah, Question, TestResult };

export interface TestState {
  testStarted: boolean;
  showResult: boolean;
  currentQuestionIndex: number;
  score: number;
  selectedAnswer: number | null;
  questionTimer: number;
  isTimerActive: boolean;
  hasAnswered: boolean;
  userAnswers: (number | null)[];
}

// Props للـ Components
export interface SurahSelectionViewProps {
  surahs: Surah[];
  selectedSurahs: number[];
  onSurahSelect: (surahNumber: number) => void;
  onStartTest: () => void;
  onClearAll: () => void;
  loading?: boolean;
}

export interface TestViewProps {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  questionTimer: number;
  onSelectAnswer: (answerIndex: number) => void;
}

export interface ResultViewProps {
  result: TestResult;
  onResetTest: () => void;
  onGoHome: () => void;
}

export interface SurahCardProps {
  surah: Surah;
  isSelected: boolean;
  onClick: () => void;
}

export interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  onSelectAnswer: (answerIndex: number) => void;
}

export interface TimerProps {
  timer: number;
  isActive: boolean;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  score: number;
}

export interface StatisticsCardsProps {
  selectedSurahs: number[];
  surahs: Surah[];
}
