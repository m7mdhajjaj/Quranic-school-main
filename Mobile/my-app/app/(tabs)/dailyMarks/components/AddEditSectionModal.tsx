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
  Platform,
  Alert,
} from "react-native";
import { X, Calendar, BookOpen, RotateCcw } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Section } from "@/Api/dailyMarksApi";
import { createSection, updateSection } from "@/Api/dailyMarksApi";
import { AddTimetableSessionModal } from "./AddTimetableSessionModal";

interface AddEditSectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSection?: Section | null;
  group: string;
  teacherId?: string;
}

export const AddEditSectionModal: React.FC<AddEditSectionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingSection,
  group,
  teacherId,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reviewSection, setReviewSection] = useState("");
  const [memorizationSection, setMemorizationSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for timetable modal
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [createdSectionData, setCreatedSectionData] = useState<{
    sectionId: string;
    sessionType: "hifz" | "murajaah" | "both";
    sectionDate: string;
  } | null>(null);

  useEffect(() => {
    if (editingSection) {
      setDate(new Date(editingSection.date));
      setReviewSection(editingSection.reviewSection);
      setMemorizationSection(editingSection.memorizationSection);
    } else {
      // Reset for new section
      setDate(new Date());
      setReviewSection("");
      setMemorizationSection("");
    }
    setError("");
  }, [editingSection, visible]);

  const handleSubmit = async () => {
    if (!reviewSection.trim() && !memorizationSection.trim()) {
      setError("يجب إدخال مقطع الحفظ أو المراجعة على الأقل");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sectionData: any = {
        date: date.toISOString(),
        reviewSection: reviewSection.trim(),
        memorizationSection: memorizationSection.trim(),
        group,
      };

      // Only add teacher if provided
      if (teacherId) {
        sectionData.teacher = teacherId;
      }

      let response;
      let createdSection: any = null;

      if (editingSection?._id) {
        response = await updateSection(editingSection._id, sectionData);
      } else {
        response = await createSection(sectionData);
        console.log(
          "📤 [AddEditSectionModal] Create section response:",
          JSON.stringify(response, null, 2)
        );
        createdSection = response.data;
        console.log(
          "📤 [AddEditSectionModal] Created section:",
          JSON.stringify(createdSection, null, 2)
        );
      }

      if (response.success) {
        onSuccess();

        // For new sections only, ask about adding to timetable
        if (!editingSection && createdSection && createdSection._id) {
          console.log(
            "✅ [AddEditSectionModal] Opening timetable dialog for section:",
            createdSection._id
          );

          // Determine session type based on filled fields
          let sessionType: "hifz" | "murajaah" | "both" = "both";
          if (memorizationSection.trim() && !reviewSection.trim()) {
            sessionType = "hifz";
          } else if (!memorizationSection.trim() && reviewSection.trim()) {
            sessionType = "murajaah";
          }

          // Close this modal first
          onClose();

          // Show confirmation dialog
          Alert.alert(
            "تم إضافة المقطع بنجاح",
            "هل تود إضافة موعد في الجدول لهذا المقطع؟",
            [
              {
                text: "لا، شكراً",
                style: "cancel",
              },
              {
                text: "نعم، أضف موعد",
                onPress: () => {
                  // Store section data and open timetable modal
                  setCreatedSectionData({
                    sectionId: createdSection._id,
                    sessionType: sessionType,
                    sectionDate: date.toISOString(),
                  });
                  setShowTimetableModal(true);
                },
              },
            ]
          );
        } else {
          onClose();
        }
      } else {
        setError(response.message || "حدث خطأ");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
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
                {editingSection ? "تعديل المقطع" : "إضافة مقطع جديد"}
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

            {/* Date Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>التاريخ</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}>
                <Calendar size={20} color="#10b981" />
                <Text style={styles.dateText}>
                  {date.toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* Review Section Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <RotateCcw size={18} color="#10b981" />
                <Text style={styles.label}>مقطع المراجعة</Text>
              </View>
              <TextInput
                style={styles.input}
                value={reviewSection}
                onChangeText={setReviewSection}
                placeholder="مثال: الأنعام 1-10"
                placeholderTextColor="#9ca3af"
                editable={!loading}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Memorization Section Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <BookOpen size={18} color="#14b8a6" />
                <Text style={styles.label}>مقطع الحفظ</Text>
              </View>
              <TextInput
                style={styles.input}
                value={memorizationSection}
                onChangeText={setMemorizationSection}
                placeholder="مثال: البقرة 1-5"
                placeholderTextColor="#9ca3af"
                editable={!loading}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Group Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>الحلقة:</Text>
              <Text style={styles.infoValue}>{group}</Text>
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
                    {editingSection ? "حفظ التعديلات" : "إضافة المقطع"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Timetable Session Modal */}
      {createdSectionData && (
        <AddTimetableSessionModal
          visible={showTimetableModal}
          onClose={() => {
            setShowTimetableModal(false);
            setCreatedSectionData(null);
            onClose();
          }}
          sectionId={createdSectionData.sectionId}
          groupName={group}
          sessionType={createdSectionData.sessionType}
          sectionDate={createdSectionData.sectionDate}
        />
      )}
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
  },
  dateText: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
    textAlign: "right",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    textAlign: "right",
    minHeight: 50,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "right",
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
