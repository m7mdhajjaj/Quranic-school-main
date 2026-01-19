import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Surah } from "@/Api/testApi";

interface SurahSelectionViewProps {
  surahs: Surah[];
  selectedSurahs: number[];
  onSurahSelect: (surahNumber: number) => void;
  onStartTest: () => void;
  onClearAll: () => void;
  loading?: boolean;
}

const { width } = Dimensions.get("window");

export const SurahSelectionView: React.FC<SurahSelectionViewProps> = ({
  surahs,
  selectedSurahs,
  onSurahSelect,
  onStartTest,
  onClearAll,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(surahs.length / itemsPerPage);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* العنوان */}
        <View style={styles.header}>
          <Text style={styles.title}>📖 اختبار القرآن الكريم</Text>
          <Text style={styles.subtitle}>
            اختر السور التي تريد أن تختبر حفظك فيها
          </Text>
        </View>

        {/* بطاقة السور */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>اختر السور</Text>
              <Text style={styles.cardSubtitle}>اختر من القائمة أدناه</Text>
            </View>
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountNumber}>{selectedSurahs.length}</Text>
              <Text style={styles.selectedCountLabel}>سورة محددة</Text>
            </View>
          </View>

          {selectedSurahs.length === 0 && (
            <View style={styles.emptyMessage}>
              <Text style={styles.emptyMessageText}>
                👈 اختر سورة واحدة على الأقل للبدء في الاختبار
              </Text>
            </View>
          )}

          {/* أزرار التنقل */}
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}>
              <Text style={styles.paginationButtonText}>◄ السابق</Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {currentPage + 1} / {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage >= totalPages - 1 && styles.paginationButtonDisabled,
              ]}
              onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}>
              <Text style={styles.paginationButtonText}>التالي ►</Text>
            </TouchableOpacity>
          </View>

          {/* شبكة السور */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>جاري تحميل السور...</Text>
            </View>
          ) : surahs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyText}>لا توجد سور متاحة</Text>
            </View>
          ) : (
            <View style={styles.surahsGrid}>
              {surahs
                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                .map((surah) => {
                  const isSelected = selectedSurahs.includes(surah.number);
                  return (
                    <TouchableOpacity
                      key={surah.number}
                      style={[
                        styles.surahCard,
                        isSelected && styles.surahCardSelected,
                      ]}
                      onPress={() => onSurahSelect(surah.number)}
                      activeOpacity={0.7}>
                      <Text style={[styles.surahNumber, isSelected && styles.surahNumberSelected]}>
                        {surah.number}
                      </Text>
                      <Text style={[styles.surahName, isSelected && styles.surahNameSelected]}>
                        {surah.name}
                      </Text>
                      <Text style={[styles.surahAyahs, isSelected && styles.surahAyahsSelected]}>
                        {surah.numberOfAyahs} آية
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}

          <View style={styles.pageInfo}>
            <Text style={styles.pageInfoText}>
              عرض {currentPage * itemsPerPage + 1} -{" "}
              {Math.min((currentPage + 1) * itemsPerPage, surahs.length)} من{" "}
              {surahs.length} سورة
            </Text>
          </View>
        </View>

        {/* أزرار الإجراءات */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.startButton,
              selectedSurahs.length === 0 && styles.startButtonDisabled,
            ]}
            onPress={onStartTest}
            disabled={selectedSurahs.length === 0}
            activeOpacity={0.8}>
            <LinearGradient
              colors={selectedSurahs.length === 0 ? ["#9ca3af", "#6b7280"] : ["#059669", "#047857"]}
              style={styles.startButtonGradient}>
              <Text style={styles.startButtonEmoji}>🎯</Text>
              <Text style={styles.startButtonText}>بدء الاختبار</Text>
              {selectedSurahs.length > 0 && (
                <View style={styles.startButtonBadge}>
                  <Text style={styles.startButtonBadgeText}>{selectedSurahs.length}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {selectedSurahs.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClearAll}
              activeOpacity={0.7}>
              <Text style={styles.clearButtonText}>🗑️ مسح الكل</Text>
            </TouchableOpacity>
          )}
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
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
  },
  card: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectedCount: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10b981",
  },
  selectedCountNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
  },
  selectedCountLabel: {
    fontSize: 10,
    color: "#047857",
    fontWeight: "600",
  },
  emptyMessage: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  emptyMessageText: {
    color: "#047857",
    textAlign: "center",
    fontWeight: "500",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  paginationButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  pageIndicator: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pageIndicatorText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  surahsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  surahCard: {
    width: (width - 72) / 3,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  surahCardSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  surahNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  surahNumberSelected: {
    color: "#059669",
  },
  surahName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  surahNameSelected: {
    color: "#047857",
  },
  surahAyahs: {
    fontSize: 10,
    color: "#6b7280",
  },
  surahAyahsSelected: {
    color: "#059669",
  },
  pageInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  pageInfoText: {
    fontSize: 12,
    color: "#6b7280",
  },
  actions: {
    gap: 12,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  startButtonEmoji: {
    fontSize: 24,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  startButtonBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  startButtonBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
