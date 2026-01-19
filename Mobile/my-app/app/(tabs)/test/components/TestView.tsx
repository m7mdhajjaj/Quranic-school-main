import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Question } from "@/Api/testApi";

interface TestViewProps {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  questionTimer: number;
  onSelectAnswer: (answerIndex: number) => void;
}

export const TestView: React.FC<TestViewProps> = ({
  questions,
  currentQuestionIndex,
  score,
  selectedAnswer,
  hasAnswered,
  questionTimer,
  onSelectAnswer,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* العنوان */}
        <View style={styles.header}>
          <Text style={styles.title}>📝 اختبار قرآني</Text>
          <Text style={styles.subtitle}>
            السؤال {currentQuestionIndex + 1} من {questions.length}
          </Text>
        </View>

        {/* شريط التقدم */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>

        {/* المؤقت */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, questionTimer <= 10 && styles.timerCircleWarning]}>
            <Text style={[styles.timerText, questionTimer <= 10 && styles.timerTextWarning]}>
              {questionTimer}
            </Text>
          </View>
        </View>

        {/* بطاقة السؤال */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>سؤال {currentQuestionIndex + 1}</Text>
            </View>
            <View style={styles.questionTypeBadge}>
              <Text style={styles.questionTypeText}>📖 اختبار قرآني</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.context && (
            <View style={styles.contextContainer}>
              <Text style={styles.contextEmoji}>📜</Text>
              <Text style={styles.contextText}>{currentQuestion.context}</Text>
            </View>
          )}

          {/* خيارات الإجابة */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const isWrong = hasAnswered && isSelected && !isCorrect;
              const shouldShowCorrect = hasAnswered && isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    shouldShowCorrect && styles.optionButtonCorrect,
                    isWrong && styles.optionButtonWrong,
                    isSelected && !hasAnswered && styles.optionButtonSelected,
                  ]}
                  onPress={() => onSelectAnswer(index)}
                  disabled={hasAnswered}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.optionText,
                    shouldShowCorrect && styles.optionTextCorrect,
                    isWrong && styles.optionTextWrong,
                  ]}>
                    {option}
                  </Text>
                  {shouldShowCorrect && (
                    <Text style={styles.optionIcon}>✓</Text>
                  )}
                  {isWrong && (
                    <Text style={styles.optionIconWrong}>✗</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* رسالة تشجيعية */}
        {!hasAnswered && questionTimer <= 10 && (
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>
              {questionTimer <= 5 ? "⏰ الوقت ينفد!" : "💪 استمر!"}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#047857",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#059669",
  },
  timerCircleWarning: {
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  timerTextWarning: {
    color: "#ffffff",
  },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  questionBadge: {
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  questionBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  questionTypeBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  questionTypeText: {
    color: "#92400e",
    fontSize: 12,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    lineHeight: 28,
  },
  contextContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderRightWidth: 4,
    borderRightColor: "#10b981",
    flexDirection: "row",
    gap: 12,
  },
  contextEmoji: {
    fontSize: 24,
  },
  contextText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  optionButtonCorrect: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  optionButtonWrong: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  optionTextCorrect: {
    color: "#047857",
  },
  optionTextWrong: {
    color: "#dc2626",
  },
  optionIcon: {
    fontSize: 24,
    color: "#10b981",
    marginLeft: 8,
  },
  optionIconWrong: {
    fontSize: 24,
    color: "#ef4444",
    marginLeft: 8,
  },
  encouragementContainer: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  encouragementText: {
    fontSize: 16,
    color: "#92400e",
    fontWeight: "600",
  },
});
