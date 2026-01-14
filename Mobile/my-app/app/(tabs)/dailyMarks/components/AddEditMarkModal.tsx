import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { X, BookOpen, RotateCcw, User } from "lucide-react-native";
import type { Mark, Section } from "@/Api/dailyMarksApi";
import type { Student } from "@/Api/studentApi";
import { createMark, updateMark } from "@/Api/dailyMarksApi";

interface AddEditMarkModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMark?: Mark | null;
  section: Section | null;
  student: Student | null;
}

export const AddEditMarkModal: React.FC<AddEditMarkModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingMark,
  section,
  student,
}) => {
  const [reviewMark, setReviewMark] = useState("");
  const [memorizationMark, setMemorizationMark] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingMark) {
      setReviewMark(editingMark.reviewMark?.toString() || "");
      setMemorizationMark(editingMark.memorizationMark?.toString() || "");
      setNote(editingMark.note || "");
    } else {
      setReviewMark("");
      setMemorizationMark("");
      setNote("");
    }
    setError("");
  }, [editingMark, visible]);

  const validateMark = (value: string): boolean => {
    if (value === "") return true; // Allow empty
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  };

  const handleSubmit = async () => {
    if (!section || !student) {
      setError("بيانات المقطع أو الطالب غير متوفرة");
      return;
    }

    const reviewNum = reviewMark === "" ? null : parseFloat(reviewMark);
    const memNum =
      memorizationMark === "" ? null : parseFloat(memorizationMark);

    if (
      (reviewNum !== null &&
        (isNaN(reviewNum) || reviewNum < 0 || reviewNum > 10)) ||
      (memNum !== null && (isNaN(memNum) || memNum < 0 || memNum > 10))
    ) {
      setError("العلامات يجب أن تكون بين 0 و 10");
      return;
    }

    if (reviewNum === null && memNum === null) {
      setError("يجب إدخال علامة واحدة على الأقل");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const markData = {
        studentId: student._id,
        sectionId: section._id,
        reviewMark: reviewNum,
        memorizationMark: memNum,
        note: note.trim() || undefined,
      };

      let response;
      if (editingMark?._id) {
        response = await updateMark(editingMark._id, markData);
      } else {
        response = await createMark(markData);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || "حدث خطأ");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const getMarkColor = (value: string) => {
    if (value === "") return "#d1d5db";
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 10) return "#ef4444";
    if (num >= 9) return "#10b981";
    if (num >= 7) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {editingMark ? "تعديل العلامة" : "إضافة علامة"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={loading}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Student Info */}
            {student && (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <User size={18} color="#10b981" />
                  <Text style={styles.infoLabel}>الطالب:</Text>
                  <Text style={styles.infoValue}>
                    {student.firstName} {student.fatherName} {student.lastName}
                  </Text>
                </View>
              </View>
            )}

            {/* Section Info */}
            {section && (
              <View style={styles.sectionInfo}>
                <View style={styles.sectionRow}>
                  <RotateCcw size={16} color="#10b981" />
                  <Text style={styles.sectionLabel}>المراجعة:</Text>
                  <Text style={styles.sectionValue}>
                    {section.reviewSection}
                  </Text>
                </View>
                <View style={styles.sectionRow}>
                  <BookOpen size={16} color="#14b8a6" />
                  <Text style={styles.sectionLabel}>الحفظ:</Text>
                  <Text style={styles.sectionValue}>
                    {section.memorizationSection}
                  </Text>
                </View>
              </View>
            )}

            {/* Review Mark Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <RotateCcw size={18} color="#10b981" />
                <Text style={styles.label}>علامة المراجعة</Text>
              </View>
              <View style={styles.markInputContainer}>
                <TextInput
                  style={[
                    styles.markInput,
                    {
                      borderColor: getMarkColor(reviewMark),
                      borderWidth: 2,
                    },
                  ]}
                  value={reviewMark}
                  onChangeText={(text) => {
                    // Allow empty or valid numbers with one decimal
                    if (text === "" || /^\d*\.?\d{0,1}$/.test(text)) {
                      setReviewMark(text);
                    }
                  }}
                  placeholder="0-10"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  editable={!loading}
                  maxLength={4}
                />
                <Text style={styles.outOf}>/ 10</Text>
              </View>
              <Text style={styles.helperText}>
                أدخل رقماً من 0 إلى 10 (اترك فارغاً إذا لم يتم التقييم)
              </Text>
            </View>

            {/* Memorization Mark Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <BookOpen size={18} color="#14b8a6" />
                <Text style={styles.label}>علامة الحفظ</Text>
              </View>
              <View style={styles.markInputContainer}>
                <TextInput
                  style={[
                    styles.markInput,
                    {
                      borderColor: getMarkColor(memorizationMark),
                      borderWidth: 2,
                    },
                  ]}
                  value={memorizationMark}
                  onChangeText={(text) => {
                    if (text === "" || /^\d*\.?\d{0,1}$/.test(text)) {
                      setMemorizationMark(text);
                    }
                  }}
                  placeholder="0-10"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  editable={!loading}
                  maxLength={4}
                />
                <Text style={styles.outOf}>/ 10</Text>
              </View>
              <Text style={styles.helperText}>
                أدخل رقماً من 0 إلى 10 (اترك فارغاً إذا لم يتم التقييم)
              </Text>
            </View>

            {/* Note Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>ملاحظة (اختياري)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="أضف ملاحظة للطالب..."
                placeholderTextColor="#9ca3af"
                editable={!loading}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingMark ? "حفظ التعديلات" : "إضافة العلامة"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  closeButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
    textAlign: "right",
  },
  infoCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#14532d",
    flex: 1,
    textAlign: "right",
  },
  sectionInfo: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "right",
  },
  sectionValue: {
    fontSize: 13,
    color: "#1f2937",
    flex: 1,
    textAlign: "right",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    textAlign: "right",
  },
  markInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    width: 100,
  },
  outOf: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "right",
  },
  noteInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    textAlign: "right",
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#10b981",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
