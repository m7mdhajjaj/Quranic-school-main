import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { TestResult } from "@/Api/testApi";

interface ResultViewProps {
  result: TestResult;
  onResetTest: () => void;
  onGoHome: () => void;
}

const calculatePercentage = (score: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return "#f59e0b"; // yellow
  if (percentage >= 70) return "#10b981"; // green
  if (percentage >= 50) return "#06b6d4"; // teal
  return "#6b7280"; // gray
};

const getMotivationalMessage = (percentage: number): string => {
  if (percentage >= 90) return "ممتاز! حفظك رائع جداً 🌟";
  if (percentage >= 70) return "جيد جداً! استمر في المثابرة 💪";
  if (percentage >= 50) return "مقبول، لكن يمكنك التحسين 📚";
  return "لا بأس، استمر في المحاولة 💫";
};

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onResetTest,
  onGoHome,
}) => {
  const router = useRouter();
  const percentage = calculatePercentage(result.score, result.totalQuestions);
  const progressColor = getProgressColor(percentage);
  const motivationalMessage = getMotivationalMessage(percentage);

  // حساب محيط الدائرة
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* العنوان */}
        <View style={styles.header}>
          <Text style={styles.title}>🎉 النتيجة</Text>
        </View>

        {/* دائرة التقدم */}
        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <View style={[styles.progressCircleInner, { borderColor: progressColor }]}>
              <Text style={[styles.progressPercentage, { color: progressColor }]}>
                {percentage}%
              </Text>
            </View>
          </View>
          <Text style={styles.scoreText}>
            {result.score} من {result.totalQuestions} إجابة صحيحة
          </Text>
        </View>

        {/* رسالة تحفيزية */}
        <View style={styles.motivationalContainer}>
          <Text style={styles.motivationalText}>{motivationalMessage}</Text>
        </View>

        {/* إحصائيات مفصلة */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardCorrect]}>
            <Text style={styles.statNumber}>{result.correctAnswers}</Text>
            <Text style={styles.statLabel}>✓ إجابات صحيحة</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWrong]}>
            <Text style={styles.statNumber}>{result.wrongAnswers}</Text>
            <Text style={styles.statLabel}>✗ إجابات خاطئة</Text>
          </View>
          <View style={[styles.statCard, styles.statCardTotal]}>
            <Text style={styles.statNumber}>{result.totalQuestions}</Text>
            <Text style={styles.statLabel}>📝 إجمالي الأسئلة</Text>
          </View>
        </View>

        {/* أزرار الإجراءات */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={onResetTest}
            activeOpacity={0.8}>
            <LinearGradient
              colors={["#059669", "#047857"]}
              style={styles.resetButtonGradient}>
              <Text style={styles.resetButtonText}>🔄 اختبار جديد</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              onGoHome();
              router.push("/(tabs)");
            }}
            activeOpacity={0.7}>
            <Text style={styles.homeButtonText}>🏠 العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#065f46",
  },
  progressCircleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreText: {
    fontSize: 18,
    color: "#374151",
    marginTop: 16,
    fontWeight: "600",
  },
  motivationalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  motivationalText: {
    fontSize: 18,
    color: "#065f46",
    textAlign: "center",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statCardCorrect: {
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#10b981",
  },
  statCardWrong: {
    backgroundColor: "#fee2e2",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  statCardTotal: {
    backgroundColor: "#e0f2fe",
    borderWidth: 2,
    borderColor: "#06b6d4",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  resetButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  homeButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
