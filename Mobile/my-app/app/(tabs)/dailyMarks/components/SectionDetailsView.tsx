import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  FileText,
  BookOpen,
  RotateCcw,
  ArrowLeft,
  Search,
} from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import type { Section } from "@/Api/dailyMarksApi";

interface SectionDetailsViewProps {
  section: Section;
  selectedGroup: string;
  studentSearchQuery: string;
  onStudentSearchChange: (query: string) => void;
  onBack: () => void;
  children: React.ReactNode;
}

/**
 * عرض تفاصيل المقطع مع جدول الطلاب
 */
export const SectionDetailsView: React.FC<SectionDetailsViewProps> = ({
  section,
  selectedGroup,
  studentSearchQuery,
  onStudentSearchChange,
  onBack,
  children,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return date.toLocaleDateString("ar-SA", options);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.7}>
        <ArrowLeft size={20} color="#10b981" />
        <Text style={styles.backButtonText}>العودة إلى المقاطع</Text>
      </TouchableOpacity>

      {/* Section Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.iconBackground}>
                <FileText size={20} color="#ffffff" />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.headerTitle}>
                  {formatDate(section.date)}
                </Text>
                <Text style={styles.headerSubtitle}>{selectedGroup}</Text>
              </View>
            </View>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Search size={16} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              value={studentSearchQuery}
              onChangeText={onStudentSearchChange}
              placeholder="ابحث عن طالب..."
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Sections Info */}
          <View style={styles.sectionsContainer}>
            {/* Memorization Section */}
            <View style={styles.memorizationCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.memorizationIconBg}>
                  <BookOpen size={14} color="#ffffff" />
                </View>
                <Text style={styles.memorizationLabel}>مقطع الحفظ</Text>
              </View>
              <Text style={styles.memorizationText}>
                {section.memorizationSection}
              </Text>
            </View>

            {/* Review Section */}
            <View style={styles.reviewCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.reviewIconBg}>
                  <RotateCcw size={14} color="#ffffff" />
                </View>
                <Text style={styles.reviewLabel}>مقطع المراجعة</Text>
              </View>
              <Text style={styles.reviewText}>{section.reviewSection}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Students Table (passed as children) */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  headerContent: {
    padding: 16,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  titleTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "right",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    textAlign: "right",
    padding: 0,
  },
  sectionsContainer: {
    gap: 12,
  },
  memorizationCard: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7dd3fc",
  },
  reviewCard: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6ee7b7",
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  memorizationIconBg: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewIconBg: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  memorizationLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#075985",
    textTransform: "uppercase",
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
    textTransform: "uppercase",
  },
  memorizationText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0c4a6e",
    textAlign: "right",
    paddingRight: 4,
  },
  reviewText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "right",
    paddingRight: 4,
  },
});

export default SectionDetailsView;
