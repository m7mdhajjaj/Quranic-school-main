/**
 * بطاقات إحصائيات الطالب
 * يعرض إحصائيات الغياب والحضور للطالب
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  AlertCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
} from "lucide-react-native";

// ============================================================================
// Stat Card Base Component
// ============================================================================

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  subtitle: string;
  icon: React.ReactNode;
  colorScheme: "rose" | "emerald" | "amber" | "blue";
  extraContent?: React.ReactNode;
}

const colorSchemes = {
  rose: {
    background: "#fff1f2",
    border: "#fecdd3",
    iconBg: "#ffe4e6",
    titleColor: "#be123c",
    valueColor: "#e11d48",
    subtitleColor: "#f43f5e",
  },
  emerald: {
    background: "#ecfdf5",
    border: "#a7f3d0",
    iconBg: "#d1fae5",
    titleColor: "#047857",
    valueColor: "#059669",
    subtitleColor: "#10b981",
  },
  amber: {
    background: "#fffbeb",
    border: "#fde68a",
    iconBg: "#fef3c7",
    titleColor: "#b45309",
    valueColor: "#d97706",
    subtitleColor: "#f59e0b",
  },
  blue: {
    background: "#eff6ff",
    border: "#bfdbfe",
    iconBg: "#dbeafe",
    titleColor: "#1d4ed8",
    valueColor: "#2563eb",
    subtitleColor: "#3b82f6",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  colorScheme,
  extraContent,
}) => {
  const colors = colorSchemes[colorScheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
          {icon}
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.iconBg, borderColor: colors.border },
          ]}>
          <Text style={[styles.badgeText, { color: colors.titleColor }]}>
            {title}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.subtitle, { color: colors.subtitleColor }]}>
          {subtitle}
        </Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.valueColor }]}>
            {value}
          </Text>
          <Text style={[styles.unit, { color: colors.subtitleColor }]}>
            {unit}
          </Text>
        </View>
        {extraContent}
      </View>
    </View>
  );
};

// ============================================================================
// Specialized Cards
// ============================================================================

interface TotalAbsenceCardProps {
  count: number;
  label?: string;
}

export const TotalAbsenceCard: React.FC<TotalAbsenceCardProps> = ({
  count,
  label = "غيابات هذا الأسبوع",
}) => (
  <StatCard
    title="الغياب"
    value={count}
    unit="يوم"
    subtitle={label}
    icon={<AlertCircle size={24} color="#e11d48" />}
    colorScheme="rose"
    extraContent={
      <Text style={styles.extraText}>
        {count === 0 ? "سجل نظيف! 👏" : "انتبه لعدد أيام الغياب"}
      </Text>
    }
  />
);

interface WeeklyStatsCardProps {
  totalDays: number;
  absenceCount: number;
  label?: string;
}

export const WeeklyStatsCard: React.FC<WeeklyStatsCardProps> = ({
  totalDays,
  absenceCount,
  label = "إجمالي المقاطع",
}) => (
  <StatCard
    title="المقاطع"
    value={totalDays}
    unit="حصة"
    subtitle={label}
    icon={<Calendar size={24} color="#059669" />}
    colorScheme="emerald"
    extraContent={
      <View>
        {absenceCount > 0 && (
          <View style={styles.absenceBadge}>
            <Text style={styles.absenceBadgeText}>{absenceCount} غيابات</Text>
          </View>
        )}
        <Text style={styles.extraTextEmerald}>عدد أيام الدوام المقررة</Text>
      </View>
    }
  />
);

interface AbsenceRateCardProps {
  rate: number;
  absenceCount: number;
  totalDays: number;
}

export const AbsenceRateCard: React.FC<AbsenceRateCardProps> = ({
  rate,
  absenceCount,
  totalDays,
}) => (
  <StatCard
    title="النسبة"
    value={rate.toFixed(1)}
    unit="%"
    subtitle="نسبة الغياب"
    icon={<TrendingUp size={24} color="#d97706" />}
    colorScheme="amber"
    extraContent={
      <View>
        <Text style={styles.extraTextAmber}>
          {absenceCount} غياب من أصل {totalDays} حصة
        </Text>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${Math.min(rate, 100)}%` }]}
          />
        </View>
      </View>
    }
  />
);

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    gap: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    justifyContent: "flex-end",
  },
  value: {
    fontSize: 36,
    fontWeight: "900",
  },
  unit: {
    fontSize: 14,
    fontWeight: "600",
  },
  extraText: {
    fontSize: 11,
    color: "#f43f5e",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "right",
  },
  extraTextEmerald: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "right",
  },
  extraTextAmber: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "right",
  },
  absenceBadge: {
    alignSelf: "flex-end",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  absenceBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ef4444",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 4,
  },
});
