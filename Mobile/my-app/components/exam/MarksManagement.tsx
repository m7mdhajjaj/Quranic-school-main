import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  BookOpen,
  Calendar,
  ChevronLeft,
  ClipboardList,
  CheckSquare,
  Square,
} from "lucide-react-native";
import {
  getTeacherGroupsForMarks,
  getAllExams,
  getExamMarks,
  addMark,
  updateMark,
  deleteMarkById,
  bulkDeleteMarks,
} from "@/Api/examApi";
import {
  TeacherGroup,
  Exam,
  MarkWithStudent,
  TeacherGroupStudent,
} from "@/types/exam.types";

type ViewMode = "groups" | "exams" | "students";

interface StudentWithGroup extends TeacherGroupStudent {
  group?: string;
}

const MarksManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("groups");
  const [groupsData, setGroupsData] = useState<TeacherGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<StudentWithGroup[]>([]);
  const [marks, setMarks] = useState<MarkWithStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // جلب بيانات الحلقات عند التحميل
  useEffect(() => {
    fetchGroupsData();
  }, []);

  // جلب الامتحانات للحلقة المختارة
  useEffect(() => {
    if (selectedGroup && viewMode === "exams") {
      fetchExamsForGroup(selectedGroup);
    }
  }, [selectedGroup, viewMode]);

  // جلب الطلاب والعلامات عند اختيار امتحان
  useEffect(() => {
    if (selectedExam && viewMode === "students") {
      fetchStudentsAndMarks();
    }
  }, [selectedExam, viewMode]);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching teacher groups...");
      const response = await getTeacherGroupsForMarks();
      console.log(
        "✅ Teacher groups received:",
        JSON.stringify(response, null, 2)
      );

      const groups = response?.data?.groups || [];
      console.log("📚 Groups count:", groups.length);

      // التأكد من وجود مصفوفة students لكل حلقة
      const groupsWithStudents = groups.map((g: any) => ({
        ...g,
        students: g.students || [],
      }));

      if (groupsWithStudents.length === 0) {
        console.log("⚠️ No groups found");
        setGroupsData([]);
      } else {
        console.log(
          "✅ Groups with students:",
          groupsWithStudents.map((g: any) => ({
            name: g.name,
            studentsCount: g.students?.length || 0,
          }))
        );
        setGroupsData(groupsWithStudents);
      }
    } catch (error) {
      console.error("❌ Error fetching groups data:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء جلب بيانات الحلقات");
      setGroupsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsForGroup = async (group: string) => {
    try {
      setLoading(true);
      const allExams = await getAllExams({ group });
      setExams(allExams.filter((exam) => exam.group === group));
    } catch (error) {
      console.error("Error fetching exams:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء جلب الامتحانات");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndMarks = async () => {
    if (!selectedExam) return;

    try {
      setLoading(true);
      const examId = String(selectedExam._id);

      // جلب الطلاب من الحلقة المحددة والعلامات
      const selectedGroupData = groupsData.find(
        (g) => g.name === selectedExam.group
      );

      console.log("📚 Selected group data:", selectedGroupData);
      console.log("📚 Selected exam group:", selectedExam.group);

      if (!selectedGroupData) {
        Alert.alert("خطأ", "لم يتم العثور على الحلقة");
        setLoading(false);
        return;
      }

      // جلب العلامات
      const marksData = await getExamMarks(examId);
      console.log("📝 Marks data:", marksData);

      // التأكد من وجود مصفوفة الطلاب
      const groupStudents = selectedGroupData.students || [];
      console.log("👥 Group students:", groupStudents);

      // استخدام الطلاب من بيانات الحلقة
      const studentsWithGroup = groupStudents.map((s: any) => ({
        _id: s._id,
        studentId: s.studentId,
        name: s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        group: selectedGroupData.name,
      }));

      setStudents(studentsWithGroup);

      // تحويل العلامات إلى الصيغة المطلوبة
      const formattedMarks: MarkWithStudent[] = Array.isArray(marksData)
        ? marksData.map((m: any) => ({
            _id: m._id,
            studentId:
              typeof m.student === "string" ? m.student : m.student?._id,
            studentName: typeof m.student === "object" ? m.student?.name : "",
            mark: Number(m.mark) || 0,
            examId: examId,
          }))
        : [];

      setMarks(formattedMarks);
    } catch (error) {
      console.error("Error fetching students and marks:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء جلب البيانات");
      setStudents([]);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMark = async (studentId: string, studentName: string) => {
    if (!selectedExam) return;

    try {
      const response = await addMark({
        examId: selectedExam._id,
        studentId,
        mark: 0,
      });

      // تحديث فوري للواجهة
      const newMark: MarkWithStudent = {
        _id: response._id || response._id,
        studentId,
        studentName,
        mark: 0,
        examId: String(selectedExam._id),
      };
      setMarks((prevMarks) => [...prevMarks, newMark]);
      Alert.alert("نجاح", "تم إضافة العلامة بنجاح");
    } catch (error) {
      console.error("Error adding mark:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء إضافة العلامة");
    }
  };

  const handleUpdateMark = async (markId: string, newMark: number) => {
    if (
      !selectedExam ||
      newMark < 0 ||
      newMark > (selectedExam.totalMarks || 100)
    ) {
      Alert.alert(
        "خطأ",
        `العلامة يجب أن تكون بين 0 و ${selectedExam?.totalMarks || 100}`
      );
      return;
    }

    // تحديث فوري للواجهة
    const previousMarks = [...marks];
    setMarks(
      marks.map((m) => (m._id === markId ? { ...m, mark: newMark } : m))
    );
    setEditingMarkId(null);

    try {
      await updateMark(markId, newMark);
      Alert.alert("نجاح", "تم تحديث العلامة بنجاح");
    } catch (error) {
      console.error("Error updating mark:", error);
      setMarks(previousMarks);
      Alert.alert("خطأ", "حدث خطأ أثناء تحديث العلامة");
    }
  };

  const handleDeleteMark = async (markId: string) => {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من حذف هذه العلامة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          const previousMarks = [...marks];
          setMarks(marks.filter((m) => m._id !== markId));

          try {
            await deleteMarkById(markId);
            Alert.alert("نجاح", "تم حذف العلامة بنجاح");
          } catch (error) {
            console.error("Error deleting mark:", error);
            setMarks(previousMarks);
            Alert.alert("خطأ", "حدث خطأ أثناء حذف العلامة");
          }
        },
      },
    ]);
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      Alert.alert("تنبيه", "الرجاء اختيار علامات للحذف");
      return;
    }

    if (!selectedExam) return;

    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف ${selectedStudents.size} علامة؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            const previousMarks = [...marks];
            const studentIdsArray = Array.from(selectedStudents);

            setMarks(marks.filter((m) => !selectedStudents.has(m.studentId)));
            setSelectedStudents(new Set());

            try {
              await bulkDeleteMarks({
                examId: selectedExam._id,
                studentIds: studentIdsArray,
              });
              Alert.alert(
                "نجاح",
                `تم حذف ${studentIdsArray.length} علامة بنجاح`
              );
            } catch (error) {
              console.error("Error bulk deleting marks:", error);
              setMarks(previousMarks);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف العلامات");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s._id)));
    }
  };

  const getStudentMark = (studentId: string) => {
    return marks.find((m) => m.studentId === studentId);
  };

  // فلترة محسّنة للأداء
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase().trim();
    return students.filter((student) => {
      const fullName = student.name.toLowerCase();
      return fullName.includes(query);
    });
  }, [students, searchQuery]);

  // Groups View
  const renderGroupsView = () => (
    <View style={styles.cardsContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : groupsData.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>لا توجد حلقات متاحة</Text>
          <Text style={styles.emptySubtext}>
            يرجى التأكد من أن لديك حلقات مسجلة
          </Text>
        </View>
      ) : (
        groupsData.map((groupCard) => (
          <TouchableOpacity
            key={groupCard.name}
            onPress={() => {
              setSelectedGroup(groupCard.name);
              setViewMode("exams");
            }}
            style={styles.groupCard}
            activeOpacity={0.8}>
            <View style={styles.groupCardHeader}>
              <View style={styles.groupCardHeaderLeft}>
                <View style={styles.groupIconContainer}>
                  <BookOpen size={24} color="white" />
                </View>
                <View>
                  <Text style={styles.groupName}>{groupCard.name}</Text>
                  <Text style={styles.groupSubtext}>حلقة قرآنية</Text>
                </View>
              </View>
              <ChevronLeft size={24} color="white" />
            </View>
            <View style={styles.groupCardStats}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#d1fae5" }]}>
                  <Users size={20} color="#059669" />
                </View>
                <Text style={styles.statLabel}>الطلاب</Text>
                <Text style={styles.statValue}>{groupCard.totalStudents}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
                  <Calendar size={20} color="#2563eb" />
                </View>
                <Text style={styles.statLabel}>الامتحانات</Text>
                <Text style={[styles.statValue, { color: "#2563eb" }]}>
                  {groupCard.examCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  // Exams View
  const renderExamsView = () => (
    <View style={styles.examsContainer}>
      <View style={styles.sectionHeader}>
        <Calendar size={24} color="#059669" />
        <Text style={styles.sectionTitle}>امتحانات {selectedGroup}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : exams.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>لا توجد امتحانات في هذه الحلقة</Text>
        </View>
      ) : (
        exams.map((exam) => (
          <TouchableOpacity
            key={exam._id}
            onPress={() => {
              setSelectedExam(exam);
              setViewMode("students");
            }}
            style={styles.examCard}
            activeOpacity={0.8}>
            <View style={styles.examCardContent}>
              <View style={styles.examCardLeft}>
                <Text style={styles.examName}>{exam.name}</Text>
                <Text style={styles.examDate}>
                  {new Date(exam.date).toLocaleDateString("ar", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <View style={styles.examBadge}>
                  <Text style={styles.examBadgeText}>
                    الدرجة: {exam.totalMarks}
                  </Text>
                </View>
              </View>
              <ChevronLeft size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  // Students View
  const renderStudentsView = () => (
    <View style={styles.studentsContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن طالب..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <View style={styles.bulkActions}>
          <View style={styles.bulkActionsLeft}>
            <CheckSquare size={20} color="#059669" />
            <Text style={styles.bulkActionsText}>
              تم اختيار {selectedStudents.size} طالب
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleBulkDelete}
            disabled={isDeleting}
            style={styles.bulkDeleteButton}>
            <Trash2 size={16} color="white" />
            <Text style={styles.bulkDeleteText}>
              {isDeleting ? "جاري الحذف..." : "حذف المحدد"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Students List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : filteredStudents.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>لا يوجد طلاب في هذه الحلقة</Text>
        </View>
      ) : (
        filteredStudents.map((student, index) => {
          const studentMark = getStudentMark(student._id);
          const isEditing = editingMarkId === studentMark?._id;
          const isSelected = selectedStudents.has(student._id);

          return (
            <View
              key={student._id}
              style={[
                styles.studentRow,
                isSelected && styles.studentRowSelected,
                index % 2 === 0 && styles.studentRowEven,
              ]}>
              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => toggleStudentSelection(student._id)}
                style={styles.checkbox}>
                {isSelected ? (
                  <CheckSquare size={22} color="#059669" />
                ) : (
                  <Square size={22} color="#9ca3af" />
                )}
              </TouchableOpacity>

              {/* Student Info */}
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentGroup}>{student.group}</Text>
              </View>

              {/* Mark */}
              <View style={styles.markContainer}>
                {studentMark ? (
                  isEditing ? (
                    <TextInput
                      style={styles.markInput}
                      keyboardType="numeric"
                      value={editValue}
                      onChangeText={setEditValue}
                      autoFocus
                    />
                  ) : (
                    <View
                      style={[
                        styles.markBadge,
                        studentMark.mark >=
                        (selectedExam?.totalMarks || 100) * 0.5
                          ? styles.markBadgePassed
                          : styles.markBadgeFailed,
                      ]}>
                      <Text
                        style={[
                          styles.markText,
                          studentMark.mark >=
                          (selectedExam?.totalMarks || 100) * 0.5
                            ? styles.markTextPassed
                            : styles.markTextFailed,
                        ]}>
                        {studentMark.mark} / {selectedExam?.totalMarks || 100}
                      </Text>
                    </View>
                  )
                ) : (
                  <Text style={styles.noMarkText}>لم يتم الإدخال</Text>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                {studentMark ? (
                  isEditing ? (
                    <>
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateMark(
                            studentMark._id,
                            Number(editValue) || 0
                          )
                        }
                        style={[styles.actionButton, styles.saveButton]}>
                        <Save size={16} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setEditingMarkId(null)}
                        style={[styles.actionButton, styles.cancelButton]}>
                        <X size={16} color="white" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingMarkId(studentMark._id);
                          setEditValue(String(studentMark.mark));
                        }}
                        style={[styles.actionButton, styles.editButton]}>
                        <Edit2 size={16} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteMark(studentMark._id)}
                        style={[styles.actionButton, styles.deleteButton]}>
                        <Trash2 size={16} color="white" />
                      </TouchableOpacity>
                    </>
                  )
                ) : (
                  <TouchableOpacity
                    onPress={() => handleAddMark(student._id, student.name)}
                    style={styles.addMarkButton}>
                    <Plus size={16} color="white" />
                    <Text style={styles.addMarkText}>إضافة</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Users size={28} color="white" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>إدارة علامات الطلاب</Text>
            <Text style={styles.headerSubtitle}>
              إدخال وتعديل وحذف علامات الطلاب لكل حلقة
            </Text>
          </View>
        </View>

        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            onPress={() => {
              setViewMode("groups");
              setSelectedGroup("");
              setSelectedExam(null);
            }}
            style={styles.breadcrumbItem}>
            <BookOpen size={16} color="white" />
            <Text style={styles.breadcrumbText}>الحلقات</Text>
          </TouchableOpacity>

          {selectedGroup && (
            <>
              <ChevronLeft size={18} color="rgba(255,255,255,0.6)" />
              <TouchableOpacity
                onPress={() => {
                  setViewMode("exams");
                  setSelectedExam(null);
                }}
                style={styles.breadcrumbItem}>
                <Calendar size={16} color="white" />
                <Text style={styles.breadcrumbText}>{selectedGroup}</Text>
              </TouchableOpacity>
            </>
          )}

          {selectedExam && (
            <>
              <ChevronLeft size={18} color="rgba(255,255,255,0.6)" />
              <View
                style={[styles.breadcrumbItem, styles.breadcrumbItemActive]}>
                <ClipboardList size={16} color="white" />
                <Text style={[styles.breadcrumbText, { fontWeight: "bold" }]}>
                  {selectedExam.name}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Content based on viewMode */}
      <View style={styles.content}>
        {viewMode === "groups" && renderGroupsView()}
        {viewMode === "exams" && renderExamsView()}
        {viewMode === "students" && renderStudentsView()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#059669",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  breadcrumbItemActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  breadcrumbText: {
    color: "white",
    fontSize: 13,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  // Cards Container
  cardsContainer: {
    gap: 16,
  },
  // Group Card
  groupCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupCardHeader: {
    backgroundColor: "#059669",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  groupSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  groupCardStats: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059669",
  },
  // Exams Container
  examsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  examCard: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  examCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  examCardLeft: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  examDate: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  examBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  examBadgeText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  // Students Container
  studentsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
    textAlign: "right",
  },
  bulkActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#d1fae5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bulkActionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bulkActionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  bulkDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  bulkDeleteText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  // Student Row
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  studentRowSelected: {
    backgroundColor: "#d1fae5",
  },
  studentRowEven: {
    backgroundColor: "#f9fafb",
  },
  checkbox: {
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  studentGroup: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  markContainer: {
    marginHorizontal: 12,
  },
  markBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markBadgePassed: {
    backgroundColor: "#d1fae5",
  },
  markBadgeFailed: {
    backgroundColor: "#fee2e2",
  },
  markText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  markTextPassed: {
    color: "#059669",
  },
  markTextFailed: {
    color: "#dc2626",
  },
  markInput: {
    width: 70,
    borderWidth: 2,
    borderColor: "#059669",
    borderRadius: 8,
    padding: 8,
    textAlign: "center",
    fontSize: 14,
  },
  noMarkText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#22c55e",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  addMarkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addMarkText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  // Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
});

export default MarksManagement;
