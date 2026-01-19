import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  RefreshCw,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Define type locally - matches ActiveSurah structure
interface ActiveSurahInfo {
  surahNumber: number;
  surahName: string;
  totalAyahs?: number;
  progress?: number;
}

interface ActiveSurahBannerProps {
  activeSurah: ActiveSurahInfo;
  onPress: () => void;
  type: "memorization" | "review";
}

export const ActiveSurahBanner: React.FC<ActiveSurahBannerProps> = ({
  activeSurah,
  onPress,
  type,
}) => {
  const isMemorization = type === "memorization";

  const gradientColors: [string, string] = isMemorization
    ? ["#f59e0b", "#d97706"]
    : ["#8b5cf6", "#7c3aed"];

  const icon = isMemorization ? (
    <BookOpen size={32} color="#ffffff" />
  ) : (
    <RefreshCw size={32} color="#ffffff" />
  );

  const title = isMemorization
    ? "السورة الفعّالة للحفظ"
    : "السورة الفعّالة للمراجعة";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {/* Decorative sparkles */}
        <View style={styles.sparkleTop}>
          <Sparkles size={16} color="rgba(255,255,255,0.4)" />
        </View>
        <View style={styles.sparkleBottom}>
          <Sparkles size={12} color="rgba(255,255,255,0.3)" />
        </View>

        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>{icon}</View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>{title}</Text>
              <Text style={styles.surahName}>{activeSurah.surahName}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  رقم {activeSurah.surahNumber}
                </Text>
                <View style={styles.dot} />
                <Text style={styles.infoText}>
                  {activeSurah.totalAyahs} آية
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>التقدم</Text>
              <View style={styles.progressCircle}>
                <Text style={styles.progressValue}>
                  {Math.round(activeSurah.progress || 0)}%
                </Text>
              </View>
              {/* Progress arc would go here in a more complex implementation */}
            </View>
            <ChevronLeft size={24} color="rgba(255,255,255,0.6)" />
          </View>
        </View>

        {/* Progress bar at bottom */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${activeSurah.progress || 0}%` },
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    padding: 20,
    position: "relative",
  },
  sparkleTop: {
    position: "absolute",
    top: 12,
    right: 60,
    opacity: 0.6,
  },
  sparkleBottom: {
    position: "absolute",
    bottom: 40,
    left: 20,
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: 2,
  },
  surahName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressContainer: {
    alignItems: "center",
    gap: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 3,
  },
});
