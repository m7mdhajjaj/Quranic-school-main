import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Users,
  BookOpen,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
} from "lucide-react-native";
import type { Student } from "@/Api/studentApi";
import {
  getFilteredSections,
  getFilteredMarks,
  deleteSection,
  deleteMark,
} from "@/Api/dailyMarksApi";
import type { Section, Mark } from "@/Api/dailyMarksApi";
import { Card } from "@/components/ui/Card";
import { AddEditSectionModal } from "../components/AddEditSectionModal";
import { AddEditMarkModal } from "../components/AddEditMarkModal";
import { StudentsMarksTable } from "../components/StudentsMarksTable";

interface TeacherViewProps {
  students: Student[];
  teacherGroups: string[];
  currentUser: any;
}

interface GroupWithStats {
  name: string;
  studentsCount: number;
  sectionsCount: number;
  loading: boolean;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  students,
  teacherGroups,
  currentUser,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [groupsWithStats, setGroupsWithStats] = useState<GroupWithStats[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const currentDate = new Date();
  const [selectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear] = useState<number>(currentDate.getFullYear());

  useEffect(() => {
    loadGroupsStats();
  }, [teacherGroups, students]);

  useEffect(() => {
    if (selectedGroup) {
      loadSections();
    }
  }, [selectedGroup, selectedMonth, selectedYear]);

  const loadGroupsStats = async () => {
    const stats: GroupWithStats[] = teacherGroups.map((groupName) => ({
      name: groupName,
      studentsCount: students.filter((s) => s.group === groupName).length,
      sectionsCount: 0,
      loading: true,
    }));

    setGroupsWithStats(stats);

    // Load sections count for each group
    for (let i = 0; i < teacherGroups.length; i++) {
      const groupName = teacherGroups[i];
      try {
        const response = await getFilteredSections({
          group: groupName,
          month: selectedMonth,
          year: selectedYear,
        });

        if (response.success && response.data) {
          setGroupsWithStats((prev) =>
            prev.map((g) =>
              g.name === groupName
                ? { ...g, sectionsCount: response.data!.length, loading: false }
                : g
            )
          );
        }
      } catch (error) {
        console.error(`Error loading sections for ${groupName}:`, error);
      }
    }
  };

  const loadSections = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const response = await getFilteredSections({
        group: selectedGroup,
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success && response.data) {
        setSections(response.data);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarks = async (sectionId: string) => {
    setLoading(true);
    try {
      // Get marks for all students in the group for this month
      const response = await getFilteredMarks({
        group: selectedGroup!,
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success && response.data) {
        // Filter marks for the selected section only
        const sectionMarks = response.data.filter((mark) => {
          const markSectionId =
            typeof mark.sectionId === "string"
              ? mark.sectionId
              : mark.sectionId._id;
          return markSectionId === sectionId;
        });
        setMarks(sectionMarks);
      }
    } catch (error) {
      console.error("Error loading marks:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedSection) {
      await loadMarks(selectedSection._id);
    } else if (selectedGroup) {
      await loadSections();
    } else {
      await loadGroupsStats();
    }
    setRefreshing(false);
  };

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    setSelectedSection(null);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSelectedSection(null);
    setSections([]);
    setMarks([]);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setMarks([]);
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    loadMarks(section._id);
  };

  // Section Management
  const handleAddSection = () => {
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setShowSectionModal(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا المقطع؟ سيتم حذف جميع العلامات المرتبطة به.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const response = await deleteSection(sectionId);
            if (response.success) {
              loadSections();
            } else {
              Alert.alert("خطأ", response.message || "فشل حذف المقطع");
            }
          },
        },
      ]
    );
  };

  const handleSectionModalSuccess = () => {
    loadSections();
    if (selectedGroup) {
      loadGroupsStats();
    }
  };

  // Mark Management
  const handleAddMark = (student: Student) => {
    setSelectedStudent(student);
    setEditingMark(null);
    setShowMarkModal(true);
  };

  const handleEditMark = (mark: Mark, student: Student) => {
    setSelectedStudent(student);
    setEditingMark(mark);
    setShowMarkModal(true);
  };

  const handleDeleteMark = (markId: string) => {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من حذف هذه العلامة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          const response = await deleteMark(markId);
          if (response.success) {
            if (selectedSection) {
              loadMarks(selectedSection._id);
            }
          } else {
            Alert.alert("خطأ", response.message || "فشل حذف العلامة");
          }
        },
      },
    ]);
  };

  const handleMarkModalSuccess = () => {
    if (selectedSection) {
      loadMarks(selectedSection._id);
    }
  };

  if (!selectedGroup) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>اختر حلقة</Text>
          <Text style={styles.headerSubtitle}>
            اختر حلقة لعرض مقاطعها وعلاماتها
          </Text>
        </View>

        <View style={styles.gridContainer}>
          {groupsWithStats.map((group) => (
            <TouchableOpacity
              key={group.name}
              style={styles.groupCard}
              onPress={() => handleGroupSelect(group.name)}
              activeOpacity={0.7}>
              <Card style={styles.cardContent}>
                <View style={styles.groupIconContainer}>
                  <Users size={24} color="#ffffff" />
                </View>

                <Text style={styles.groupName}>{group.name}</Text>

                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Users size={18} color="#10b981" />
                    <View>
                      <Text style={styles.statLabel}>عدد الطلاب</Text>
                      <Text style={styles.statValue}>
                        {group.studentsCount}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statBox, styles.statBoxAlt]}>
                    <BookOpen size={18} color="#14b8a6" />
                    <View>
                      <Text style={styles.statLabel}>عدد المقاطع</Text>
                      <Text style={styles.statValue}>
                        {group.loading ? "..." : group.sectionsCount}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.groupFooter}>
                  <BookOpen size={16} color="#10b981" />
                  <Text style={styles.groupFooterText}>اضغط لعرض المقاطع</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Show Students Marks Table when section is selected
  if (selectedSection) {
    const groupStudents = students.filter((s) => s.group === selectedGroup);

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToSections}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color="#10b981" />
          <Text style={styles.backButtonText}>العودة إلى المقاطع</Text>
        </TouchableOpacity>

        <View style={styles.studentsSectionHeader}>
          <View style={styles.studentsSectionInfo}>
            <BookOpen size={24} color="#ffffff" />
            <View style={styles.studentsSectionText}>
              <Text style={styles.studentsSectionTitle}>
                {new Date(selectedSection.date).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.studentsSectionSubtitle}>
                المراجعة: {selectedSection.reviewSection} | الحفظ:{" "}
                {selectedSection.memorizationSection}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <StudentsMarksTable
            students={groupStudents}
            marks={marks}
            section={selectedSection}
            loading={loading}
            onAddMark={handleAddMark}
            onEditMark={handleEditMark}
            onDeleteMark={handleDeleteMark}
          />
        </View>

        {/* Modals */}
        {selectedStudent && (
          <AddEditMarkModal
            visible={showMarkModal}
            onClose={() => setShowMarkModal(false)}
            onSuccess={handleMarkModalSuccess}
            mark={editingMark}
            section={selectedSection}
            student={selectedStudent}
          />
        )}
      </ScrollView>
    );
  }

  // Show Sections List when group is selected (but no section selected yet)
  if (selectedGroup && !selectedSection) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToGroups}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color="#10b981" />
          <Text style={styles.backButtonText}>العودة إلى الحلقات</Text>
        </TouchableOpacity>

        <View style={styles.sectionsHeader}>
          <View style={styles.sectionsHeaderIcon}>
            <Users size={24} color="#ffffff" />
          </View>
          <View style={styles.sectionsHeaderText}>
            <Text style={styles.sectionsHeaderTitle}>{selectedGroup}</Text>
            <Text style={styles.sectionsHeaderSubtitle}>
              {sections.length} مقطع في هذا الشهر
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addSectionButton}
            onPress={handleAddSection}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>جاري تحميل المقاطع...</Text>
          </View>
        ) : sections.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>لا توجد مقاطع</Text>
            <Text style={styles.emptyDescription}>
              لم يتم إضافة أي مقاطع لهذه الحلقة في هذا الشهر
            </Text>
          </Card>
        ) : (
          <View style={styles.sectionsContainer}>
            {sections.map((section) => {
              const date = new Date(section.date);
              const formattedDate = date.toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });

              return (
                <Card key={section._id} style={styles.sectionCard}>
                  <TouchableOpacity
                    onPress={() => handleSectionSelect(section)}
                    activeOpacity={0.7}>
                    <View style={styles.sectionHeader}>
                      <BookOpen size={20} color="#10b981" />
                      <Text style={styles.sectionDate}>{formattedDate}</Text>
                    </View>

                    <View style={styles.sectionContent}>
                      <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>مقطع المراجعة:</Text>
                        <Text style={styles.sectionValue}>
                          {section.reviewSection}
                        </Text>
                      </View>

                      <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>مقطع الحفظ:</Text>
                        <Text style={styles.sectionValue}>
                          {section.memorizationSection}
                        </Text>
                      </View>
                    </View>

                    {section.marksStatus && (
                      <View style={styles.sectionFooter}>
                        <View
                          style={[
                            styles.statusBadge,
                            section.marksStatus === "completed" &&
                              styles.statusCompleted,
                            section.marksStatus === "in_progress" &&
                              styles.statusInProgress,
                            section.marksStatus === "not_started" &&
                              styles.statusNotStarted,
                          ]}>
                          <Text style={styles.statusText}>
                            {section.marksStatus === "completed"
                              ? "مكتمل"
                              : section.marksStatus === "in_progress"
                                ? "قيد التنفيذ"
                                : "لم يبدأ"}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Section Actions */}
                  <View style={styles.sectionActions}>
                    <TouchableOpacity
                      style={styles.editSectionButton}
                      onPress={() => handleEditSection(section)}>
                      <Edit size={16} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteSectionButton}
                      onPress={() => handleDeleteSection(section._id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Modals */}
        <AddEditSectionModal
          visible={showSectionModal}
          onClose={() => setShowSectionModal(false)}
          onSuccess={handleSectionModalSuccess}
          section={editingSection}
          group={selectedGroup}
          teacherId={currentUser?._id || ""}
        />
      </ScrollView>
    );
  }

  // Show Groups Grid (no group selected) - default view
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#10b981"]}
          tintColor="#10b981"
        />
      }>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>اختر حلقة</Text>
        <Text style={styles.headerSubtitle}>
          اختر حلقة لعرض مقاطعها وعلاماتها
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {groupsWithStats.map((group) => (
          <TouchableOpacity
            key={group.name}
            style={styles.groupCard}
            onPress={() => handleGroupSelect(group.name)}
            activeOpacity={0.7}>
            <Card style={styles.cardContent}>
              <View style={styles.groupIconContainer}>
                <Users size={24} color="#ffffff" />
              </View>

              <Text style={styles.groupName}>{group.name}</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Users size={18} color="#10b981" />
                  <View>
                    <Text style={styles.statLabel}>عدد الطلاب</Text>
                    <Text style={styles.statValue}>{group.studentsCount}</Text>
                  </View>
                </View>

                <View style={[styles.statBox, styles.statBoxAlt]}>
                  <BookOpen size={18} color="#14b8a6" />
                  <View>
                    <Text style={styles.statLabel}>عدد المقاطع</Text>
                    <Text style={styles.statValue}>
                      {group.loading ? "..." : group.sectionsCount}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.groupFooter}>
                <BookOpen size={16} color="#10b981" />
                <Text style={styles.groupFooterText}>اضغط لعرض المقاطع</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  gridContainer: {
    padding: 16,
    gap: 16,
  },
  groupCard: {
    marginBottom: 0,
  },
  cardContent: {
    padding: 20,
  },
  groupIconContainer: {
    backgroundColor: "#10b981",
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statBoxAlt: {
    backgroundColor: "#f0fdfa",
    borderColor: "#99f6e4",
  },
  statLabel: {
    fontSize: 10,
    color: "#059669",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
  },
  groupFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
  },
  groupFooterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  sectionsHeader: {
    backgroundColor: "#10b981",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionsHeaderIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
  },
  sectionsHeaderText: {
    flex: 1,
  },
  sectionsHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionsHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  emptyCard: {
    margin: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  sectionsContainer: {
    padding: 16,
    gap: 12,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  sectionContent: {
    gap: 12,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  sectionValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    flex: 1,
    textAlign: "left",
    marginLeft: 8,
  },
  sectionFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusCompleted: {
    backgroundColor: "#d1fae5",
  },
  statusInProgress: {
    backgroundColor: "#dbeafe",
  },
  statusNotStarted: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  addSectionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 8,
  },
  sectionActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  editSectionButton: {
    padding: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  deleteSectionButton: {
    padding: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  studentsSectionHeader: {
    backgroundColor: "#10b981",
    padding: 20,
    marginBottom: 16,
  },
  studentsSectionInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  studentsSectionText: {
    flex: 1,
  },
  studentsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  studentsSectionSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  tableContainer: {
    padding: 16,
  },
});
