import React, { useState, useEffect, useMemo } from "react";
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
import { ArrowRight, Users } from "lucide-react-native";
import { getStudentsByGroup, type Student } from "@/Api/studentApi";
import {
  getFilteredSections,
  getFilteredMarks,
  deleteSection,
  deleteMark,
  getTeacherAssistantStudents,
  Student as DailyMarksStudent,
} from "@/Api/dailyMarksApi";
import type { Section, Mark } from "@/Api/dailyMarksApi";
import { GroupsGridView } from "../components/GroupsGridView";
import { SectionDetailsView } from "../components/SectionDetailsView";
import {
  SectionStatusFilter,
  MarkStatus,
} from "../components/SectionStatusFilter";
import { PeriodFilterToggle } from "../components/PeriodFilterToggle";
import { AddEditSectionModal } from "../components/AddEditSectionModal";
import { AddEditMarkModal } from "../components/AddEditMarkModal";
import { StudentsMarksTable } from "../components/StudentsMarksTable";
import { SectionsTable } from "../components/SectionsTable";
import { AddTimetableSessionModal } from "../components/AddTimetableSessionModal";

interface TeacherViewProps {
  students: Student[];
  teacherGroups: string[];
  currentUser: any;
  isTeacherAssistant?: boolean;
}

interface GroupWithStats {
  name: string;
  studentsCount: number;
  sectionsCount: number;
  loading?: boolean;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  students,
  teacherGroups,
  currentUser,
  isTeacherAssistant = false,
}) => {
  // State Management
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [groupsWithStats, setGroupsWithStats] = useState<GroupWithStats[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]); // Students for selected group
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [selectedStatus, setSelectedStatus] = useState<MarkStatus | null>(null);
  const [filterMode, setFilterMode] = useState<"week" | "all">("all");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Modals State
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scheduleTargetSection, setScheduleTargetSection] =
    useState<Section | null>(null);

  // Date Filter State
  const currentDate = new Date();
  const [selectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear] = useState<number>(currentDate.getFullYear());

  // Load Groups Stats on mount
  useEffect(() => {
    loadGroupsStats();
  }, [teacherGroups, students]);

  // Load students when group changes
  useEffect(() => {
    console.log(
      "🔄 [TeacherView] useEffect triggered - selectedGroup:",
      selectedGroup
    );
    if (selectedGroup) {
      console.log(
        "🔄 [TeacherView] Calling loadGroupStudents for:",
        selectedGroup
      );
      loadGroupStudents(selectedGroup);
    } else {
      console.log("🔄 [TeacherView] No group selected, clearing students");
      setGroupStudents([]);
    }
  }, [selectedGroup]);

  // Load Sections when group changes
  useEffect(() => {
    if (selectedGroup) {
      loadSections();
    }
  }, [selectedGroup, selectedMonth, selectedYear, filterMode]);

  // Reset filters when group changes
  useEffect(() => {
    setSelectedStatus(null);
    setStudentSearchQuery("");
  }, [selectedGroup]);

  const loadGroupsStats = async () => {
    // Initialize stats with loading state
    const stats: GroupWithStats[] = teacherGroups.map((groupName) => ({
      name: groupName,
      studentsCount: 0,
      sectionsCount: 0,
      loading: true,
    }));

    setGroupsWithStats(stats);

    // Load both students count and sections count for each group
    for (let i = 0; i < teacherGroups.length; i++) {
      const groupName = teacherGroups[i];
      try {
        let studentsCount = 0;
        
        // مساعد المدرس - استخدام الطلاب من الـ props
        if (isTeacherAssistant && students.length > 0) {
          studentsCount = students.filter(s => s.group === groupName).length;
        } else {
          // Load students count from API
          const studentsResponse = await getStudentsByGroup(groupName);
          studentsCount =
            studentsResponse.success && studentsResponse.data
              ? studentsResponse.data.length
              : 0;
        }

        // Load sections count
        const sectionsResponse = await getFilteredSections({
          group: groupName,
          month: selectedMonth,
          year: selectedYear,
        });
        const sectionsCount =
          sectionsResponse.success && sectionsResponse.data
            ? sectionsResponse.data.length
            : 0;

        // Update both counts
        setGroupsWithStats((prev) =>
          prev.map((g) =>
            g.name === groupName
              ? {
                  ...g,
                  studentsCount,
                  sectionsCount,
                  loading: false,
                }
              : g
          )
        );
      } catch (error) {
        console.error(`Error loading stats for ${groupName}:`, error);
        setGroupsWithStats((prev) =>
          prev.map((g) => (g.name === groupName ? { ...g, loading: false } : g))
        );
      }
    }
  };

  // Load students for selected group
  const loadGroupStudents = async (groupName: string) => {
    console.log("📚 [TeacherView] Loading students for group:", groupName);
    try {
      // مساعد المدرس - استخدام الطلاب من الـ props إذا متوفرة
      if (isTeacherAssistant) {
        // أولاً: محاولة استخدام الطلاب من الـ props
        if (students.length > 0) {
          const filteredStudents = students.filter(s => s.group === groupName);
          if (filteredStudents.length > 0) {
            setGroupStudents(filteredStudents);
            console.log("✅ [TeacherView] Teacher assistant - filtered students from props:", filteredStudents.length);
            return;
          }
        }
        
        // إذا لم نجد طلاب، نجلبهم من الـ API
        console.log("📚 [TeacherView] Teacher assistant - fetching students from API for group:", groupName);
        const assistantStudentsResponse = await getTeacherAssistantStudents();
        if (assistantStudentsResponse.success && assistantStudentsResponse.data) {
          const filteredStudents = assistantStudentsResponse.data.filter((s: DailyMarksStudent) => s.group === groupName);
          setGroupStudents(filteredStudents as Student[]);
          console.log("✅ [TeacherView] Teacher assistant - loaded students from API:", filteredStudents.length);
          return;
        }
        
        // إذا فشل كل شيء، نستخدم API العادي
        console.log("📚 [TeacherView] Teacher assistant - falling back to regular API");
      }

      const response = await getStudentsByGroup(groupName);

      if (response.success && response.data) {
        console.log("📚 [TeacherView] Raw data length:", response.data.length);
        // Use all students - don't filter by isActive for daily marks
        // Teachers need to see all students to add marks
        setGroupStudents(response.data);
        console.log("✅ [TeacherView] Loaded students:", response.data.length);
      } else {
        console.error(
          "❌ [TeacherView] Failed to load students - success:",
          response.success,
          "data:",
          response.data,
          "message:",
          response.message
        );
        setGroupStudents([]);
      }
    } catch (error) {
      console.error("❌ [TeacherView] Error loading students:", error);
      setGroupStudents([]);
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
      const response = await getFilteredMarks({
        group: selectedGroup!,
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success && response.data) {
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

  // Filtered Sections by Status
  const filteredSections = useMemo(() => {
    if (!selectedStatus) return sections;
    return sections.filter((section) => section.marksStatus === selectedStatus);
  }, [sections, selectedStatus]);

  // Status Counts
  const statusCounts = useMemo(() => {
    return {
      all: sections.length,
      completed: sections.filter((s) => s.marksStatus === "completed").length,
      in_progress: sections.filter((s) => s.marksStatus === "in_progress")
        .length,
      not_started: sections.filter(
        (s) => s.marksStatus === "not_started" || !s.marksStatus
      ).length,
    };
  }, [sections]);

  // Handlers
  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedSection && selectedGroup) {
      await Promise.all([
        loadMarks(selectedSection._id),
        loadGroupStudents(selectedGroup),
      ]);
    } else if (selectedGroup) {
      await Promise.all([loadSections(), loadGroupStudents(selectedGroup)]);
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
    setGroupStudents([]);
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
              loadGroupsStats();
            } else {
              Alert.alert("خطأ", response.message || "فشل حذف المقطع");
            }
          },
        },
      ]
    );
  };

  // Handle Add Schedule for a section
  const handleAddSchedule = (section: Section) => {
    setScheduleTargetSection(section);
    setShowTimetableModal(true);
  };

  const handleTimetableModalClose = () => {
    setShowTimetableModal(false);
    setScheduleTargetSection(null);
    // Refresh sections to get updated timetable info
    loadSections();
  };

  const handleSectionModalSuccess = () => {
    loadSections();
    loadGroupsStats();
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
      loadSections(); // Refresh to update section status
    }
  };

  // Render: Groups Grid View (when no group selected)
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
        <GroupsGridView
          groupsWithStats={groupsWithStats}
          onGroupSelect={handleGroupSelect}
          isLoading={loading}
        />
      </ScrollView>
    );
  }

  // Render: Section Details View (when section selected)
  if (selectedSection) {
    // Debug log
    console.log("📊 [TeacherView] Selected group:", selectedGroup);
    console.log("📊 [TeacherView] Group students count:", groupStudents.length);

    return (
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#10b981"]}
              tintColor="#10b981"
            />
          }>
          <SectionDetailsView
            section={selectedSection}
            selectedGroup={selectedGroup || ""}
            studentSearchQuery={studentSearchQuery}
            onStudentSearchChange={setStudentSearchQuery}
            onBack={handleBackToSections}>
            <StudentsMarksTable
              section={selectedSection}
              marks={marks}
              students={groupStudents}
              onAddMark={handleAddMark}
              onEditMark={isTeacherAssistant ? undefined : handleEditMark}
              onDeleteMark={isTeacherAssistant ? undefined : handleDeleteMark}
              searchQuery={studentSearchQuery}
            />
          </SectionDetailsView>
        </ScrollView>

        {/* Modals */}
        <AddEditMarkModal
          visible={showMarkModal}
          onClose={() => setShowMarkModal(false)}
          onSuccess={handleMarkModalSuccess}
          section={selectedSection}
          student={selectedStudent}
          editingMark={editingMark}
        />
      </View>
    );
  }

  // Render: Sections Table View (when group selected but no section selected)
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        {/* Group Header with Back Button */}
        <View style={styles.groupHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToGroups}>
            <ArrowRight size={20} color="#10b981" />
            <Text style={styles.backButtonText}>العودة للحلقات</Text>
          </TouchableOpacity>
          <View style={styles.groupInfo}>
            <View style={styles.groupIconContainer}>
              <Users size={20} color="#ffffff" />
            </View>
            <Text style={styles.groupName}>{selectedGroup}</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          {/* Status Filter */}
          <SectionStatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            counts={statusCounts}
          />

          {/* Period Filter */}
          <PeriodFilterToggle
            selectedMode={filterMode}
            onModeChange={setFilterMode}
          />
        </View>

        <SectionsTable
          sections={filteredSections}
          marks={marks}
          isTeacher={true}
          onSectionSelect={handleSectionSelect}
          onEditSection={isTeacherAssistant ? undefined : handleEditSection}
          onDeleteSection={isTeacherAssistant ? undefined : handleDeleteSection}
          onAddSection={isTeacherAssistant ? undefined : handleAddSection}
          onAddSchedule={isTeacherAssistant ? undefined : handleAddSchedule}
          showActions={true}
        />
      </ScrollView>

      {/* Modals - مساعد المدرس لا يستطيع إضافة أو تعديل المقاطع */}
      {!isTeacherAssistant && (
        <AddEditSectionModal
          visible={showSectionModal}
          onClose={() => setShowSectionModal(false)}
          onSuccess={handleSectionModalSuccess}
          group={selectedGroup}
          editingSection={editingSection}
        />
      )}

      {/* Timetable Modal for adding schedule to existing section - للمعلمين فقط */}
      {!isTeacherAssistant && scheduleTargetSection && (
        <AddTimetableSessionModal
          visible={showTimetableModal}
          onClose={handleTimetableModalClose}
          sectionId={scheduleTargetSection._id}
          groupName={selectedGroup || ""}
          sessionType={
            scheduleTargetSection.memorizationSection &&
            !scheduleTargetSection.reviewSection
              ? "hifz"
              : !scheduleTargetSection.memorizationSection &&
                  scheduleTargetSection.reviewSection
                ? "murajaah"
                : "both"
          }
          sectionDate={scheduleTargetSection.date}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  groupHeader: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10b981",
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  filterSection: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
});
