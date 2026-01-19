import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
} from "react-native";
import {
  AlertTriangle,
  Calendar,
  Users,
  User,
  ShieldAlert,
  CheckCircle,
} from "lucide-react-native";
import { Warning } from "@/types/warning.types";
import { LinearGradient } from "expo-linear-gradient";

interface StudentViewProps {
  warnings: Warning[];
  loading?: boolean;
}

// Helper functions
const getWarningLabel = (type: string): string => {
  const labels: Record<string, string> = {
    warning: "تنبيه",
    first: "الإنذار الأول",
    second: "الإنذار الثاني",
    third: "الإنذار الثالث",
    expulsion: "فصل",
  };
  return labels[type] || type;
};

const getWarningDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    warning: "تنبيه بسيط - تحذير من الإنذار في المرة القادمة",
    first: "إنذار رسمي أول",
    second: "إنذار رسمي ثانٍ",
    third: "إنذار نهائي - قد يؤدي للفصل",
    expulsion: "فصل نهائي من الحلقة",
  };
  return descriptions[type] || "";
};

const getWarningIcon = (type: string): string => {
  switch (type) {
    case "warning":
      return "💬";
    case "first":
      return "1️⃣";
    case "second":
      return "2️⃣";
    case "third":
      return "3️⃣";
    case "expulsion":
      return "🚫";
    default:
      return "⚠️";
  }
};

const formatArabicDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const getWarningColor = (type: string) => {
  switch (type) {
    case "warning":
      return {
        bg: "#FEF3C7",
        border: "#F59E0B",
        text: "#92400E",
        iconBg: "#FDE68A",
      };
    case "first":
      return {
        bg: "#FFEDD5",
        border: "#F97316",
        text: "#9A3412",
        iconBg: "#FED7AA",
      };
    case "second":
      return {
        bg: "#FEE2E2",
        border: "#EF4444",
        text: "#991B1B",
        iconBg: "#FECACA",
      };
    case "third":
      return {
        bg: "#FCE7F3",
        border: "#EC4899",
        text: "#9F1239",
        iconBg: "#FBCFE8",
      };
    case "expulsion":
      return {
        bg: "#FEE2E2",
        border: "#DC2626",
        text: "#7F1D1D",
        iconBg: "#FECACA",
      };
    default:
      return {
        bg: "#F3F4F6",
        border: "#6B7280",
        text: "#374151",
        iconBg: "#E5E7EB",
      };
  }
};

export const StudentView: React.FC<StudentViewProps> = ({
  warnings,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const renderWarning = ({ item }: { item: Warning }) => {
    const colors = getWarningColor(item.type);
    
    // Extract teacher name
    const teacherName =
      typeof item.teacherId === "object" && item.teacherId
        ? `${item.teacherId.firstName} ${item.teacherId.lastName}`
        : item.teacher || "غير معروف";

    // Extract group name
    const groupName =
      typeof item.groupId === "object" && item.groupId
        ? item.groupId.name
        : item.groupName || "غير معروف";

    return (
      <View style={styles.warningCard}>
        {/* Decorative gradient line */}
        <LinearGradient
          colors={[colors.border, colors.iconBg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientLine}
        />

        <View style={styles.cardContent}>
          {/* Top Row - Warning Type & Date */}
          <View style={styles.topRow}>
            <View style={[styles.warningTypeContainer, { backgroundColor: colors.iconBg }]}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>{getWarningIcon(item.type)}</Text>
              </View>
              <View style={styles.warningTypeText}>
                <Text style={styles.warningTypeLabel}>تنبيه</Text>
                <Text style={[styles.warningTypeTitle, { color: colors.text }]}>
                  {getWarningLabel(item.type)}
                </Text>
              </View>
            </View>

            <View style={[styles.dateContainer, { backgroundColor: colors.bg }]}>
              <Calendar size={16} color={colors.text} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatArabicDate(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={[styles.descriptionContainer, { backgroundColor: colors.bg }]}>
            <AlertTriangle size={20} color="#D97706" />
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {getWarningDescription(item.type)}
            </Text>
          </View>

          {/* Reason */}
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>السبب</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoItem, { backgroundColor: colors.bg }]}>
              <Users size={16} color={colors.text} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>الحلقة</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                  {groupName}
                </Text>
              </View>
            </View>

            <View style={[styles.infoItem, { backgroundColor: colors.bg }]}>
              <User size={16} color={colors.text} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>المعلم</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                  {teacherName}
                </Text>
              </View>
            </View>

            <View style={[styles.infoItem, { backgroundColor: colors.bg }]}>
              <Calendar size={16} color={colors.text} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>التاريخ</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                  {formatArabicDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (warnings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <CheckCircle size={64} color="#10B981" />
        </View>
        <Text style={styles.emptyTitle}>لا توجد إنذارات</Text>
        <Text style={styles.emptyDescription}>
          سجلك نظيف! استمر في التفوق والالتزام 🌟
        </Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Text style={styles.headerEmoji}>⚠️</Text>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            لديك {warnings.length} إنذار
          </Text>
          <Text style={styles.headerSubtitle}>
            الوصول لـ 3 إنذارات يؤدي للفصل من الحلقة
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={warnings}
      renderItem={renderWarning}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  warningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gradientLine: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  warningTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  warningTypeText: {
    flex: 1,
  },
  warningTypeLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  warningTypeTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  reasonContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: "45%",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#DC2626",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
