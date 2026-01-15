import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  X,
  FileText,
  BookOpen,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  Info,
} from "lucide-react-native";
import { Exam, ExamFormData } from "@/types/exam.types";
import { useTeacherGroups } from "@/hooks/exam/useTeacherGroups";

interface ExamFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ExamFormData) => Promise<void>;
  editingExam?: Exam | null;
  isSubmitting: boolean;
}

// الثوابت
const EXAM_TYPES = [
  { value: "شفهي", label: "شفهي", color: "#8b5cf6" },
  { value: "كتابي", label: "كتابي", color: "#3b82f6" },
  { value: "تقييم شامل", label: "تقييم شامل", color: "#059669" },
] as const;

const TIME_OPTIONS = [
  { value: "12:00", label: "12:00 ظهراً" },
  { value: "12:30", label: "12:30 ظهراً" },
  { value: "13:00", label: "1:00 مساءً" },
  { value: "13:30", label: "1:30 مساءً" },
  { value: "14:00", label: "2:00 مساءً" },
  { value: "14:30", label: "2:30 مساءً" },
  { value: "15:00", label: "3:00 مساءً" },
  { value: "15:30", label: "3:30 مساءً" },
  { value: "16:00", label: "4:00 مساءً" },
  { value: "16:30", label: "4:30 مساءً" },
  { value: "17:00", label: "5:00 مساءً" },
  { value: "17:30", label: "5:30 مساءً" },
  { value: "18:00", label: "6:00 مساءً" },
  { value: "18:30", label: "6:30 مساءً" },
  { value: "19:00", label: "7:00 مساءً" },
  { value: "19:30", label: "7:30 مساءً" },
  { value: "20:00", label: "8:00 مساءً" },
  { value: "20:30", label: "8:30 مساءً" },
  { value: "21:00", label: "9:00 مساءً" },
];

// دالة للحصول على تاريخ بعد يومين
const getDateAfterTwoDays = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split("T")[0];
};

const DEFAULT_VALUES: ExamFormData = {
  name: "",
  date: getDateAfterTwoDays(),
  time: "12:00",
  subject: "",
  examType: "شفهي",
  duration: 60,
  totalMarks: 20,
  passingMarks: 10,
  groups: [],
};

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingExam,
  isSubmitting,
}) => {
  const { groups, loading: groupsLoading } = useTeacherGroups();
  const [formData, setFormData] = useState<ExamFormData>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTimePicker, setShowTimePicker] = useState(false);

  // تحديث البيانات عند التعديل
  useEffect(() => {
    if (editingExam) {
      // التعامل مع البيانات القادمة من الباك إند (type بدل examType و group بدل groups)
      const examType = editingExam.type || editingExam.examType || "شفهي";
      const examGroups =
        editingExam.groups || (editingExam.group ? [editingExam.group] : []);

      setFormData({
        name: editingExam.name,
        date: editingExam.date.split("T")[0],
        time: editingExam.time || "12:00",
        examType: examType as any,
        subject: editingExam.subject,
        duration: editingExam.duration || 60,
        totalMarks: editingExam.totalMarks,
        passingMarks:
          editingExam.passingMarks || Math.floor(editingExam.totalMarks / 2),
        groups: examGroups,
      });
    } else {
      setFormData(DEFAULT_VALUES);
    }
    setErrors({});
  }, [editingExam, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم الامتحان مطلوب";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "المادة مطلوبة";
    }
    if (!formData.date) {
      newErrors.date = "التاريخ مطلوب";
    }
    if (formData.totalMarks <= 0) {
      newErrors.totalMarks = "مجموع الدرجات يجب أن يكون أكبر من صفر";
    }
    if (
      formData.passingMarks < 0 ||
      formData.passingMarks > formData.totalMarks
    ) {
      newErrors.passingMarks = "درجة النجاح يجب أن تكون بين 0 ومجموع الدرجات";
    }
    if (formData.duration < 5 || formData.duration > 120) {
      newErrors.duration = "المدة يجب أن تكون بين 5 و 120 دقيقة";
    }
    if (formData.groups.length === 0) {
      newErrors.groups = "يجب اختيار حلقة واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // الخطأ يُعالج في useExamActions
    }
  };

  const toggleGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter((id) => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  const getTimeLabel = (value: string) => {
    return TIME_OPTIONS.find((t) => t.value === value)?.label || value;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* الرأس */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                {editingExam ? (
                  <FileText size={24} color="white" />
                ) : (
                  <Text style={styles.headerIconText}>+</Text>
                )}
              </View>
              <Text style={styles.headerTitle}>
                {editingExam ? "تعديل الامتحان" : "إضافة امتحان جديد"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* ═══════════════════════════════════════════════════════════════
                القسم الأول: المعلومات الأساسية
            ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Info size={20} color="#059669" />
                <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
              </View>

              {/* اسم الامتحان */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <FileText size={16} color="#059669" />
                  <Text style={styles.label}>اسم الامتحان</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="مثلاً: اختبار القرآن الشهري"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, errors.name && styles.inputError]}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* المادة */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <BookOpen size={16} color="#059669" />
                  <Text style={styles.label}>المادة</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, subject: text }))
                  }
                  placeholder="مثلاً: القرآن الكريم"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, errors.subject && styles.inputError]}
                />
                {errors.subject && (
                  <Text style={styles.errorText}>{errors.subject}</Text>
                )}
              </View>

              {/* نوع الامتحان */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <FileText size={16} color="#059669" />
                  <Text style={styles.label}>نوع الامتحان</Text>
                </View>
                <View style={styles.typeContainer}>
                  {EXAM_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          examType: type.value as any,
                        }))
                      }
                      style={[
                        styles.typeButton,
                        formData.examType === type.value && {
                          backgroundColor: type.color,
                          borderColor: type.color,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.examType === type.value &&
                            styles.typeButtonTextActive,
                        ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                القسم الثاني: موعد الامتحان
            ═══════════════════════════════════════════════════════════════ */}
            <View style={[styles.section, styles.sectionGreen]}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#059669" />
                <Text style={styles.sectionTitle}>موعد الامتحان</Text>
              </View>

              {/* التاريخ */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Calendar size={16} color="#059669" />
                  <Text style={styles.label}>التاريخ</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  value={formData.date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, errors.date && styles.inputError]}
                />
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date}</Text>
                )}
              </View>

              <View style={styles.row}>
                {/* الوقت */}
                <View style={[styles.inputGroup, styles.flex1]}>
                  <View style={styles.labelRow}>
                    <Clock size={16} color="#059669" />
                    <Text style={styles.label}>الوقت</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(!showTimePicker)}
                    style={styles.input}>
                    <Text style={styles.inputText}>
                      {getTimeLabel(formData.time)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* المدة */}
                <View style={[styles.inputGroup, styles.flex1]}>
                  <View style={styles.labelRow}>
                    <Clock size={16} color="#059669" />
                    <Text style={styles.label}>المدة (دقيقة)</Text>
                  </View>
                  <TextInput
                    value={formData.duration.toString()}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: parseInt(text) || 60,
                      }))
                    }
                    keyboardType="numeric"
                    style={[styles.input, errors.duration && styles.inputError]}
                  />
                  {errors.duration && (
                    <Text style={styles.errorText}>{errors.duration}</Text>
                  )}
                </View>
              </View>

              {/* اختيار الوقت */}
              {showTimePicker && (
                <View style={styles.timePickerContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.timeOptionsRow}>
                      {TIME_OPTIONS.map((time) => (
                        <TouchableOpacity
                          key={time.value}
                          onPress={() => {
                            setFormData((prev) => ({
                              ...prev,
                              time: time.value,
                            }));
                            setShowTimePicker(false);
                          }}
                          style={[
                            styles.timeOption,
                            formData.time === time.value &&
                              styles.timeOptionActive,
                          ]}>
                          <Text
                            style={[
                              styles.timeOptionText,
                              formData.time === time.value &&
                                styles.timeOptionTextActive,
                            ]}>
                            {time.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <View style={styles.hintContainer}>
                    <Info size={12} color="#059669" />
                    <Text style={styles.hintText}>
                      الوقت المسموح من 12:00 ظهراً إلى 9:00 مساءً
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.hintContainer}>
                <Info size={12} color="#059669" />
                <Text style={styles.hintText}>
                  الحد الأقصى للمدة ساعتين (120 دقيقة)
                </Text>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                القسم الثالث: نظام التقييم
            ═══════════════════════════════════════════════════════════════ */}
            <View style={[styles.section, styles.sectionGreen]}>
              <View style={styles.sectionHeader}>
                <Award size={20} color="#059669" />
                <Text style={styles.sectionTitle}>نظام التقييم</Text>
              </View>

              <View style={styles.row}>
                {/* مجموع الدرجات */}
                <View style={[styles.inputGroup, styles.flex1]}>
                  <View style={styles.labelRow}>
                    <CheckCircle size={16} color="#059669" />
                    <Text style={styles.label}>مجموع الدرجات</Text>
                  </View>
                  <TextInput
                    value={formData.totalMarks.toString()}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        totalMarks: parseInt(text) || 20,
                      }))
                    }
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      errors.totalMarks && styles.inputError,
                    ]}
                  />
                  {errors.totalMarks && (
                    <Text style={styles.errorText}>{errors.totalMarks}</Text>
                  )}
                </View>

                {/* درجة النجاح */}
                <View style={[styles.inputGroup, styles.flex1]}>
                  <View style={styles.labelRow}>
                    <CheckCircle size={16} color="#059669" />
                    <Text style={styles.label}>درجة النجاح</Text>
                  </View>
                  <TextInput
                    value={formData.passingMarks.toString()}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        passingMarks: parseInt(text) || 10,
                      }))
                    }
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      errors.passingMarks && styles.inputError,
                    ]}
                  />
                  {errors.passingMarks && (
                    <Text style={styles.errorText}>{errors.passingMarks}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                القسم الرابع: اختيار الحلقات
            ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users size={20} color="#059669" />
                <Text style={styles.sectionTitle}>
                  الحلقات ({formData.groups.length} محدد)
                </Text>
                <Text style={styles.required}>*</Text>
              </View>

              {groupsLoading ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : groups.length === 0 ? (
                <View style={styles.emptyGroups}>
                  <Text style={styles.emptyGroupsText}>
                    لا توجد حلقات متاحة
                  </Text>
                </View>
              ) : (
                <View style={styles.groupsContainer}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group._id}
                      onPress={() => toggleGroup(group._id)}
                      activeOpacity={0.7}
                      style={[
                        styles.groupItem,
                        formData.groups.includes(group._id) &&
                          styles.groupItemActive,
                      ]}>
                      <Text
                        style={[
                          styles.groupItemText,
                          formData.groups.includes(group._id) &&
                            styles.groupItemTextActive,
                        ]}>
                        {group.name}
                      </Text>
                      {formData.groups.includes(group._id) && (
                        <View style={styles.checkIcon}>
                          <Text style={styles.checkIconText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.groups && (
                <Text style={styles.errorText}>{errors.groups}</Text>
              )}
            </View>
          </ScrollView>

          {/* أزرار الإجراءات */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
              disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingExam ? "حفظ التعديلات" : "إضافة الامتحان"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionGreen: {
    backgroundColor: "#ecfdf5",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
    textAlign: "right",
  },
  inputText: {
    fontSize: 15,
    color: "#1f2937",
    textAlign: "right",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  typeButtonTextActive: {
    color: "white",
  },
  timePickerContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  timeOptionsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  timeOptionActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  timeOptionText: {
    fontSize: 13,
    color: "#374151",
  },
  timeOptionTextActive: {
    color: "white",
    fontWeight: "600",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: "#059669",
  },
  groupsContainer: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 8,
    maxHeight: 200,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  groupItemActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  groupItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  groupItemTextActive: {
    color: "white",
  },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyGroups: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 12,
    padding: 16,
  },
  emptyGroupsText: {
    color: "#92400e",
    textAlign: "center",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#6b7280",
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
});
