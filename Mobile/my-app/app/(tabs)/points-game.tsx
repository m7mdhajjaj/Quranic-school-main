/**
 * Points Game Screen - Simplified Version
 * Daily activities tracking for students
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { usePointsGame } from "@/hooks/usePointsGame";
import {
  calculateTotalPoints,
  prayerNames,
  getPrayerPoints,
} from "@/utils/pointsCalculator";
import type { PrayerStatus } from "@/types/pointsGame.types";

export default function PointsGameScreen() {
  const {
    user,
    loading,
    saving,
    teacherGroups,
    selectedGroup,
    setSelectedGroup,
    prayers,
    setPrayers,
    nawafel,
    setNawafel,
    parentRespect,
    setParentRespect,
    schoolAttendance,
    setSchoolAttendance,
    dailyStudy,
    setDailyStudy,
    adhkar,
    setAdhkar,
    halaqah,
    setHalaqah,
    earnedBadges,
    stats,
    rankings,
    badgeRankings,
    savePoints,
    loadRankings,
  } = usePointsGame();

  const [showRankings, setShowRankings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [rankingType, setRankingType] = useState<"points" | "badges">("points");

  const totalPoints = calculateTotalPoints(
    prayers,
    nawafel,
    parentRespect,
    schoolAttendance,
    dailyStudy,
    adhkar,
    halaqah
  );

  const handleSave = async () => {
    const success = await savePoints();
    if (success) {
      Alert.alert("✅ تم الحفظ", "تم حفظ نقاطك بنجاح!");
    } else {
      Alert.alert("❌ خطأ", "حدث خطأ أثناء الحفظ");
    }
  };

  const handleShowRankings = async () => {
    // If teacher, load rankings for selected group
    if (user?.role === "teacher" && selectedGroup) {
      await loadRankings(selectedGroup);
    } else {
      await loadRankings();
    }
    setShowRankings(true);
  };

  const updatePrayer = (prayer: keyof typeof prayers, status: PrayerStatus) => {
    setPrayers((prev) => ({
      ...prev,
      [prayer]: { status },
    }));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Teacher View - Show Rankings Only
  if (user?.role === "teacher") {
    return (
      <LinearGradient
        colors={["#F0FDF4", "#DCFCE7", "#BBF7D0"]}
        style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🏆 ترتيب لعبة النقاط</Text>
            <Text style={styles.subtitle}>اختر الحلقة لعرض ترتيب الطلاب</Text>
          </View>

          {/* Group Selection */}
          <View style={styles.filterCard}>
            <Text style={styles.filterLabel}>الحلقة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGroup}
                onValueChange={(value) => setSelectedGroup(value)}
                style={styles.picker}>
                {teacherGroups.map((group) => (
                  <Picker.Item
                    key={group._id}
                    label={group.name}
                    value={group._id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Show Rankings Button */}
          <TouchableOpacity
            style={styles.showRankingsButton}
            onPress={handleShowRankings}
            disabled={!selectedGroup}>
            <Text style={styles.showRankingsButtonText}>📊 عرض الترتيب</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Rankings Modal */}
        <Modal visible={showRankings} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏆 الترتيب</Text>
                <TouchableOpacity onPress={() => setShowRankings(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    rankingType === "points" && styles.tabActive,
                  ]}
                  onPress={() => setRankingType("points")}>
                  <Text
                    style={[
                      styles.tabText,
                      rankingType === "points" && styles.tabTextActive,
                    ]}>
                    النقاط
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    rankingType === "badges" && styles.tabActive,
                  ]}
                  onPress={() => setRankingType("badges")}>
                  <Text
                    style={[
                      styles.tabText,
                      rankingType === "badges" && styles.tabTextActive,
                    ]}>
                    الشارات
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.rankingList}>
                {(rankingType === "points" ? rankings : badgeRankings).length >
                0 ? (
                  (rankingType === "points" ? rankings : badgeRankings).map(
                    (student, index) => (
                      <View key={student._id} style={styles.rankingItem}>
                        <Text style={styles.rankingRank}>#{index + 1}</Text>
                        <Text style={styles.rankingEmoji}>{student.emoji}</Text>
                        <Text style={styles.rankingName}>{student.name}</Text>
                        <Text style={styles.rankingPoints}>
                          {rankingType === "points"
                            ? student.points
                            : student.badgesCount}
                        </Text>
                      </View>
                    )
                  )
                ) : (
                  <Text style={styles.emptyText}>
                    لا يوجد طلاب في هذه الحلقة
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    );
  }

  // Student View - Original Interface
  if (user?.role !== "student") {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          هذه الصفحة متاحة للطلاب والمعلمين فقط
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#F0FDF4", "#DCFCE7", "#BBF7D0"]}
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎮 لعبة النقاط اليومية</Text>
          <Text style={styles.subtitle}>سجّل أنشطتك اليومية واربح النقاط</Text>
        </View>

        {/* Points Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>نقاطي اليوم</Text>
          <Text style={styles.totalPoints}>{totalPoints}</Text>
          <View style={styles.statsRow}>
            {stats && (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>أسبوعي</Text>
                  <Text style={styles.statValue}>{stats.weeklyPoints}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>شهري</Text>
                  <Text style={styles.statValue}>{stats.monthlyPoints}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>ترتيبي</Text>
                  <Text style={styles.statValue}>#{stats.currentRank}</Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={handleShowRankings}>
              <Text style={styles.smallButtonText}>🏆 الترتيب</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setShowBadges(true)}>
              <Text style={styles.smallButtonText}>
                ⭐ الشارات ({earnedBadges.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕌 الصلوات (60 نقطة)</Text>
          {Object.entries(prayers).map(([key, prayer]) => {
            const prayerKey = key as keyof typeof prayers;
            return (
              <View key={key} style={styles.prayerRow}>
                <Text style={styles.prayerName}>{prayerNames[key]}</Text>
                <View style={styles.prayerButtons}>
                  {(["mosque", "home", "late", "missed"] as PrayerStatus[]).map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.prayerButton,
                          prayer.status === status && styles.prayerButtonActive,
                        ]}
                        onPress={() => updatePrayer(prayerKey, status)}>
                        <Text
                          style={[
                            styles.prayerButtonText,
                            prayer.status === status &&
                              styles.prayerButtonTextActive,
                          ]}>
                          {status === "mosque" && "مسجد"}
                          {status === "home" && "بيت"}
                          {status === "late" && "تأخير"}
                          {status === "missed" && "فائتة"}
                        </Text>
                        <Text style={styles.prayerPoints}>
                          +{getPrayerPoints(status)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Nawafel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌙 النوافل (25 نقطة)</Text>
          <View style={styles.checkboxGrid}>
            {[
              { key: "duha", label: "الضحى (+5)", points: 5 },
              { key: "qiyamAlayl", label: "قيام الليل (+10)", points: 10 },
              { key: "rawatib", label: "الرواتب (+5)", points: 5 },
              { key: "witr", label: "الوتر (+5)", points: 5 },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.checkbox,
                  nawafel[item.key as keyof typeof nawafel] &&
                    styles.checkboxActive,
                ]}
                onPress={() =>
                  setNawafel((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof nawafel],
                  }))
                }>
                <Text
                  style={[
                    styles.checkboxText,
                    nawafel[item.key as keyof typeof nawafel] &&
                      styles.checkboxTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Adhkar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📿 الأذكار (18 نقطة)</Text>
          <View style={styles.checkboxGrid}>
            {[
              { key: "morning", label: "الصباح (+5)" },
              { key: "evening", label: "المساء (+5)" },
              { key: "sleep", label: "النوم (+3)" },
              { key: "afterPrayer", label: "بعد الصلاة (+5)" },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.checkbox,
                  adhkar[item.key as keyof typeof adhkar] &&
                    styles.checkboxActive,
                ]}
                onPress={() =>
                  setAdhkar((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof adhkar],
                  }))
                }>
                <Text
                  style={[
                    styles.checkboxText,
                    adhkar[item.key as keyof typeof adhkar] &&
                      styles.checkboxTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 الأنشطة اليومية</Text>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>بر الوالدين (0-10)</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() =>
                  setParentRespect(Math.max(0, parentRespect - 1))
                }>
                <Text style={styles.counterButton}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{parentRespect}</Text>
              <TouchableOpacity
                onPress={() =>
                  setParentRespect(Math.min(10, parentRespect + 1))
                }>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>الدراسة (ساعات × 2)</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => setDailyStudy(Math.max(0, dailyStudy - 1))}>
                <Text style={styles.counterButton}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{dailyStudy}</Text>
              <TouchableOpacity
                onPress={() => setDailyStudy(Math.min(10, dailyStudy + 1))}>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              schoolAttendance && styles.toggleButtonActive,
            ]}
            onPress={() => setSchoolAttendance(!schoolAttendance)}>
            <Text
              style={[
                styles.toggleButtonText,
                schoolAttendance && styles.toggleButtonTextActive,
              ]}>
              الحضور المدرسي (+5)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Halaqah */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 الحلقة</Text>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>حفظ (دقائق ÷ 10 × 5)</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() =>
                  setHalaqah((prev) => ({
                    ...prev,
                    memorizedMinutes: Math.max(0, prev.memorizedMinutes - 10),
                  }))
                }>
                <Text style={styles.counterButton}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>
                {halaqah.memorizedMinutes}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setHalaqah((prev) => ({
                    ...prev,
                    memorizedMinutes: prev.memorizedMinutes + 10,
                  }))
                }>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>مراجعة (دقائق ÷ 10 × 3)</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() =>
                  setHalaqah((prev) => ({
                    ...prev,
                    reviewedMinutes: Math.max(0, prev.reviewedMinutes - 10),
                  }))
                }>
                <Text style={styles.counterButton}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{halaqah.reviewedMinutes}</Text>
              <TouchableOpacity
                onPress={() =>
                  setHalaqah((prev) => ({
                    ...prev,
                    reviewedMinutes: prev.reviewedMinutes + 10,
                  }))
                }>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>💾 حفظ النقاط</Text>
          )}
        </TouchableOpacity>

        {/* Warning */}
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ أي طالب يزور النقاط سيتم طرده من المسابقة!
          </Text>
        </View>
      </ScrollView>

      {/* Rankings Modal */}
      <Modal visible={showRankings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 الترتيب</Text>
              <TouchableOpacity onPress={() => setShowRankings(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  rankingType === "points" && styles.tabActive,
                ]}
                onPress={() => setRankingType("points")}>
                <Text
                  style={[
                    styles.tabText,
                    rankingType === "points" && styles.tabTextActive,
                  ]}>
                  النقاط
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  rankingType === "badges" && styles.tabActive,
                ]}
                onPress={() => setRankingType("badges")}>
                <Text
                  style={[
                    styles.tabText,
                    rankingType === "badges" && styles.tabTextActive,
                  ]}>
                  الشارات
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.rankingList}>
              {(rankingType === "points" ? rankings : badgeRankings).map(
                (student, index) => (
                  <View
                    key={student._id}
                    style={[
                      styles.rankingItem,
                      student._id === user?._id && styles.rankingItemMe,
                    ]}>
                    <Text style={styles.rankingRank}>#{index + 1}</Text>
                    <Text style={styles.rankingName}>{student.name}</Text>
                    <Text style={styles.rankingPoints}>
                      {rankingType === "points"
                        ? student.points
                        : student.badgesCount}
                    </Text>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Badges Modal */}
      <Modal visible={showBadges} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⭐ شاراتي</Text>
              <TouchableOpacity onPress={() => setShowBadges(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.badgeList}>
              {earnedBadges.length > 0 ? (
                earnedBadges.map((badge) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <View style={styles.badgeInfo}>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDesc}>{badge.description}</Text>
                      <Text style={styles.badgeCount}>
                        ✨ حصلت عليها {badge.count} مرة
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  لم تحصل على أي شارات بعد! 💪
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#059669",
  },
  summaryCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  totalPoints: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  smallButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
  },
  prayerRow: {
    marginBottom: 12,
  },
  prayerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  prayerButtons: {
    flexDirection: "row",
    gap: 6,
  },
  prayerButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  prayerButtonActive: {
    backgroundColor: "#10B981",
  },
  prayerButtonText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  prayerButtonTextActive: {
    color: "#FFF",
  },
  prayerPoints: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  checkbox: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: "48%",
  },
  checkboxActive: {
    backgroundColor: "#10B981",
  },
  checkboxText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  checkboxTextActive: {
    color: "#FFF",
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterButton: {
    fontSize: 24,
    color: "#10B981",
    fontWeight: "bold",
    paddingHorizontal: 12,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    minWidth: 30,
    textAlign: "center",
  },
  toggleButton: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#10B981",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#FFF",
  },
  saveButton: {
    backgroundColor: "#10B981",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  warning: {
    backgroundColor: "#FEE2E2",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  warningText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
  closeButton: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFF",
  },
  rankingList: {
    paddingHorizontal: 20,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  rankingItemMe: {
    backgroundColor: "#DCFCE7",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  rankingRank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B7280",
    marginRight: 12,
  },
  rankingEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  rankingName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  rankingPoints: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  filterCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    backgroundColor: "transparent",
  },
  showRankingsButton: {
    backgroundColor: "#10B981",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  showRankingsButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  badgeList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  badgeItem: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  badgeCount: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#9CA3AF",
    paddingVertical: 40,
  },
});
