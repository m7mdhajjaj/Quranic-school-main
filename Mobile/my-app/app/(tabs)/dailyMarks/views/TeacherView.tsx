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
import type { Student } from "@/Api/studentApi";
import {
  getFilteredSections,
  getFilteredMarks,
  deleteSection,
  deleteMark,
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

interface TeacherViewProps {
  students: Student[];
  teacherGroups: string[];
  currentUser: any;
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
}) => {
  // State Management
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [groupsWithStats, setGroupsWithStats] = useState<GroupWithStats[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [selectedStatus, setSelectedStatus] = useState<MarkStatus | null>(null);
  const [filterMode, setFilterMode] = useState<"week" | "all">("all");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Modals State
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Date Filter State
  const currentDate = new Date();
  const [selectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear] = useState<number>(currentDate.getFullYear());

  // Load Groups Stats on mount
  useEffect(() => {
    loadGroupsStats();
  }, [teacherGroups, students]);

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
        setGroupsWithStats((prev) =>
          prev.map((g) => (g.name === groupName ? { ...g, loading: false } : g))
        );
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
              loadGroupsStats();
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
            selectedGroup={selectedGroup}
            studentSearchQuery={studentSearchQuery}
            onStudentSearchChange={setStudentSearchQuery}
            onBack={handleBackToSections}>
            <StudentsMarksTable
              section={selectedSection}
              marks={marks}
              students={students.filter((s) => s.group === selectedGroup)}
              onAddMark={handleAddMark}
              onEditMark={handleEditMark}
              onDeleteMark={handleDeleteMark}
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
          group={selectedGroup}
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
          onEditSection={handleEditSection}
          onDeleteSection={handleDeleteSection}
          onAddSection={handleAddSection}
          showActions={true}
        />
      </ScrollView>

      {/* Modals */}
      <AddEditSectionModal
        visible={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        onSuccess={handleSectionModalSuccess}
        group={selectedGroup}
        editingSection={editingSection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  filterSection: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
});
