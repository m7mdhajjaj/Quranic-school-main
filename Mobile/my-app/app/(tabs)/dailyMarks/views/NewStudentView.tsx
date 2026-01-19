import React, { memo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import {
  BookOpen,
  RefreshCw,
  Search,
  ChevronLeft,
  BookMarked,
  Target,
  Sparkles,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import { SurahCard } from "../components/SurahCard";
import { SurahDetailsView } from "../components/SurahDetailsView";
import {
  useStudentGroupedSections,
  isActiveSurahForMemorization,
  isActiveSurahForReview,
  ActiveSurahItem,
} from "@/hooks/useStudentGroupedSections";
import type { GroupedSurah } from "@/Api/studentGroupedSectionsApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

type FilterStatus = "all" | "completed" | "in_progress" | "not_started";

interface FilterButton {
  key: FilterStatus;
  label: string;
}

const FILTER_BUTTONS: FilterButton[] = [
  { key: "all", label: "الكل" },
  { key: "completed", label: "مكتملة" },
  { key: "in_progress", label: "قيد التقدم" },
  { key: "not_started", label: "لم تبدأ" },
];

/**
 * Loading Skeleton for Surah Cards
 */
const SurahCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader} />
    <View style={styles.skeletonBody}>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonBadge} />
        <View style={styles.skeletonBadge} />
      </View>
    </View>
  </View>
);

/**
 * Empty State Component
 */
const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <BookOpen size={48} color="#10b981" />
    </View>
    <Text style={styles.emptyTitle}>لا توجد مقاطع بعد</Text>
    <Text style={styles.emptySubtitle}>
      سيقوم المعلم بتعيين مقاطع الحفظ والمراجعة لك قريباً
    </Text>
  </View>
);

/**
 * Compact Header Component
 */
const StudentHeader = memo<{
  totalSurahs: number;
  completedSurahs: number;
  overallProgress: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}>(
  ({
    totalSurahs,
    completedSurahs,
    overallProgress,
    onRefresh,
    isRefreshing,
  }) => {
    return (
      <LinearGradient
        colors={["#10b981", "#0d9488", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        {/* Title Section */}
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconContainer}>
              <BookOpen size={24} color="#ffffff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>مقاطعي في القرآن</Text>
              <Text style={styles.headerSubtitle}>
                تتبع تقدمك في الحفظ والمراجعة
              </Text>
            </View>
          </View>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              disabled={isRefreshing}
              style={styles.refreshButton}>
              <RefreshCw
                size={20}
                color="#ffffff"
                style={
                  isRefreshing ? { transform: [{ rotate: "180deg" }] } : {}
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalSurahs}</Text>
            <Text style={styles.statLabel}>سورة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedSurahs}</Text>
            <Text style={styles.statLabel}>مكتملة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{overallProgress}%</Text>
            <Text style={styles.statLabel}>التقدم</Text>
          </View>
        </View>
      </LinearGradient>
    );
  },
);

/**
 * Filter and Search Section
 */
const FilterSection = memo<{
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}>(({ filterStatus, onFilterChange, searchQuery, onSearchChange }) => {
  return (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="ابحث عن سورة..."
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <X size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterButtonsContainer}>
        {FILTER_BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.key}
            onPress={() => onFilterChange(btn.key)}
            style={[
              styles.filterButton,
              filterStatus === btn.key && styles.filterButtonActive,
            ]}>
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === btn.key && styles.filterButtonTextActive,
              ]}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

/**
 * Active Surah Banners Section
 */
const ActiveSurahsSection = memo<{
  activeSurahs: ActiveSurahItem[];
  onSurahClick: (surahNumber: number) => void;
}>(({ activeSurahs, onSurahClick }) => {
  const memorizationSurah = activeSurahs.find((s) => s.type === "memorization");
  const reviewSurah = activeSurahs.find((s) => s.type === "review");

  if (!memorizationSurah && !reviewSurah) return null;

  const isSameSurah =
    memorizationSurah &&
    reviewSurah &&
    memorizationSurah.surahNumber === reviewSurah.surahNumber;

  return (
    <View style={styles.activeSurahsContainer}>
      <View style={styles.activeSurahsHeader}>
        <Sparkles size={20} color="#f59e0b" />
        <Text style={styles.activeSurahsTitle}>السورة الفعالة الآن</Text>
      </View>
      <Text style={styles.activeSurahsSubtitle}>
        🔒 يجب إكمالها قبل البدء بسورة جديدة
      </Text>

      {isSameSurah ? (
        <TouchableOpacity
          style={styles.sameSurahCard}
          onPress={() => onSurahClick(memorizationSurah.surahNumber)}>
          <LinearGradient
            colors={["#8b5cf6", "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sameSurahCardGradient}>
            <View style={styles.sameSurahContent}>
              <View style={styles.sameSurahLeft}>
                <View style={styles.sameSurahIcon}>
                  <BookOpen size={24} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.sameSurahName}>
                    {memorizationSurah.surahName}
                  </Text>
                  <View style={styles.sameSurahBadges}>
                    <View style={styles.memorizationBadge}>
                      <Text style={styles.badgeText}>حفظ</Text>
                    </View>
                    <View style={styles.reviewBadge}>
                      <Text style={styles.badgeText}>مراجعة</Text>
                    </View>
                  </View>
                </View>
              </View>
              <ChevronLeft size={24} color="rgba(255,255,255,0.6)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.separateSurahsRow}>
          {memorizationSurah && (
            <TouchableOpacity
              style={styles.activeSurahCard}
              onPress={() => onSurahClick(memorizationSurah.surahNumber)}>
              <View style={styles.activeSurahCardHeader}>
                <View style={styles.activeSurahIconGreen}>
                  <BookMarked size={20} color="#ffffff" />
                </View>
                <View style={styles.activeSurahTextContainer}>
                  <Text style={styles.activeSurahName}>
                    {memorizationSurah.surahName}
                  </Text>
                  <View style={styles.memorizationBadge}>
                    <Text style={styles.badgeText}>حفظ</Text>
                  </View>
                </View>
                <ChevronLeft size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
          {reviewSurah && (
            <TouchableOpacity
              style={styles.activeSurahCard}
              onPress={() => onSurahClick(reviewSurah.surahNumber)}>
              <View style={styles.activeSurahCardHeader}>
                <View style={styles.activeSurahIconBlue}>
                  <Target size={20} color="#ffffff" />
                </View>
                <View style={styles.activeSurahTextContainer}>
                  <Text style={styles.activeSurahName}>
                    {reviewSurah.surahName}
                  </Text>
                  <View style={styles.reviewBadge}>
                    <Text style={styles.badgeText}>مراجعة</Text>
                  </View>
                </View>
                <ChevronLeft size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

/**
 * New Student View Component - عرض السور المجمعة للطالب
 */
export const NewStudentView = memo(() => {
  const { user: currentUser } = useAuth();
  const studentId = currentUser?._id || "";
  const groupId = currentUser?.group || "";

  const {
    data: surahs,
    activeSurahs,
    isLoading,
    error,
    refetch,
  } = useStudentGroupedSections({
    studentId,
    groupId,
  });

  const [selectedSurah, setSelectedSurah] = useState<GroupedSurah | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Handle clicking on active surah banner
  const handleActiveSurahClick = useCallback(
    (surahNumber: number) => {
      const surah = surahs.find((s) => s.surahNumber === surahNumber);
      if (surah) {
        setSelectedSurah(surah);
      }
    },
    [surahs],
  );

  // Filter surahs based on status and search query
  const filteredSurahs = surahs.filter((surah) => {
    // Filter by status
    if (filterStatus !== "all" && surah.status !== filterStatus) {
      return false;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      return (
        surah.surahName.includes(searchQuery) ||
        surah.surahNumber.toString().includes(searchQuery)
      );
    }
    return true;
  });

  // Calculate summary
  const totalSurahs = surahs.length;
  const completedSurahs = surahs.filter((s) => s.status === "completed").length;
  const totalSegments = surahs.reduce(
    (sum, s) => sum + (s.segments?.length || 0),
    0,
  );
  const overallProgress =
    totalSurahs > 0 ? Math.round((completedSurahs / totalSurahs) * 100) : 0;

  // If a surah is selected, show details view in a modal
  if (selectedSurah) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="fullScreen">
        <SurahDetailsView
          surah={selectedSurah}
          onClose={() => setSelectedSurah(null)}
          isActiveMemorization={isActiveSurahForMemorization(
            selectedSurah.surahNumber,
            activeSurahs,
          )}
          isActiveReview={isActiveSurahForReview(
            selectedSurah.surahNumber,
            activeSurahs,
          )}
        />
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <StudentHeader
        totalSurahs={totalSurahs}
        completedSurahs={completedSurahs}
        overallProgress={overallProgress}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        {/* Filter and Search Section */}
        <FilterSection
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Active Surah Banners */}
        {!isLoading && activeSurahs.length > 0 && (
          <ActiveSurahsSection
            activeSurahs={activeSurahs}
            onSurahClick={handleActiveSurahClick}
          />
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.retryButton}>
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.surahsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SurahCardSkeleton key={i} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSurahs.length === 0 && <EmptyState />}

        {/* Surahs Grid */}
        {!isLoading && !error && filteredSurahs.length > 0 && (
          <View style={styles.surahsGrid}>
            {filteredSurahs.map((surah) => {
              const isActiveMemorization = isActiveSurahForMemorization(
                surah.surahNumber,
                activeSurahs,
              );
              const isActiveReview = isActiveSurahForReview(
                surah.surahNumber,
                activeSurahs,
              );
              return (
                <View key={surah.surahNumber} style={styles.surahCardWrapper}>
                  <SurahCard
                    surah={surah}
                    onPress={() => setSelectedSurah(surah)}
                    isActiveMemorization={isActiveMemorization}
                    isActiveReview={isActiveReview}
                  />
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 20,
    paddingTop: 48,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    textAlign: "right",
  },
  filterButtonsContainer: {
    gap: 8,
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  filterButtonActive: {
    backgroundColor: "#10b981",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  activeSurahsContainer: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 16,
    padding: 16,
  },
  activeSurahsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  activeSurahsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#92400e",
  },
  activeSurahsSubtitle: {
    fontSize: 12,
    color: "#b45309",
    marginBottom: 12,
  },
  sameSurahCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sameSurahCardGradient: {
    padding: 16,
  },
  sameSurahContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sameSurahLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sameSurahIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
  },
  sameSurahName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  sameSurahBadges: {
    flexDirection: "row",
    gap: 6,
  },
  separateSurahsRow: {
    gap: 10,
  },
  activeSurahCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activeSurahCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeSurahIconGreen: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 10,
  },
  activeSurahIconBlue: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
  },
  activeSurahTextContainer: {
    flex: 1,
    gap: 4,
  },
  activeSurahName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  memorizationBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  reviewBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#047857",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#b91c1c",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#dc2626",
  },
  surahsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  surahCardWrapper: {
    width: CARD_WIDTH,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  skeletonHeader: {
    height: 80,
    backgroundColor: "#e5e7eb",
  },
  skeletonBody: {
    padding: 16,
    gap: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    width: "66%",
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 8,
  },
  skeletonBadge: {
    height: 32,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyIconContainer: {
    backgroundColor: "#dcfce7",
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 280,
  },
});
