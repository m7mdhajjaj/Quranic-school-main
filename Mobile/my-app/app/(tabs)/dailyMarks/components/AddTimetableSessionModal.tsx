import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, Clock, Calendar, BookOpen, RotateCcw } from "lucide-react-native";
import {
  createTimetableForSection,
  getAvailableHours,
} from "@/Api/TimeTable.Api";

interface AddTimetableSessionModalProps {
  visible: boolean;
  onClose: () => void;
  sectionId: string;
  groupName: string;
  sessionType: "hifz" | "murajaah" | "both";
  sectionDate: string;
}

export const AddTimetableSessionModal: React.FC<
  AddTimetableSessionModalProps
> = ({ visible, onClose, sectionId, groupName, sessionType, sectionDate }) => {
  const [loading, setLoading] = useState(false);
  const [loadingHours, setLoadingHours] = useState(true);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [selectedStartHour, setSelectedStartHour] = useState<string>("");
  const [selectedEndHour, setSelectedEndHour] = useState<string>("");
  const [error, setError] = useState("");

  // Load available hours
  useEffect(() => {
    if (visible) {
      loadAvailableHours();
    }
  }, [visible]);

  const loadAvailableHours = async () => {
    setLoadingHours(true);
    try {
      const response = await getAvailableHours();
      if (response.success && response.data?.hours) {
        setAvailableHours(response.data.hours);
        // Set default selection
        if (response.data.hours.length >= 2) {
          setSelectedStartHour(response.data.hours[0]);
          setSelectedEndHour(response.data.hours[1]);
        }
      }
    } catch (err) {
      console.error("Error loading hours:", err);
      setError("فشل في تحميل الأوقات المتاحة");
    } finally {
      setLoadingHours(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStartHour || !selectedEndHour) {
      setError("يرجى اختيار وقت البداية والنهاية");
      return;
    }

    // Validate time range
    const startIndex = availableHours.indexOf(selectedStartHour);
    const endIndex = availableHours.indexOf(selectedEndHour);
    if (endIndex <= startIndex) {
      setError("وقت النهاية يجب أن يكون بعد وقت البداية");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createTimetableForSection(sectionId, {
        startHour: selectedStartHour,
        endHour: selectedEndHour,
        sessionType: sessionType,
      });

      if (response.success) {
        Alert.alert("تم بنجاح", "تمت إضافة الموعد في الجدول بنجاح!", [
          { text: "حسناً", onPress: onClose },
        ]);
      } else {
        setError("فشل في إضافة الموعد");
      }
    } catch (err: any) {
      console.error("Error creating session:", err);
      if (err.isConflict) {
        setError(err.message || "يوجد تعارض مع موعد آخر");
      } else {
        setError("حدث خطأ أثناء إضافة الموعد");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSessionTypeLabel = () => {
    switch (sessionType) {
      case "hifz":
        return "حفظ";
      case "murajaah":
        return "مراجعة";
      default:
        return "حفظ ومراجعة";
    }
  };

  const getSessionTypeStyle = () => {
    switch (sessionType) {
      case "hifz":
        return { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" };
      case "murajaah":
        return { bg: "#fef3c7", text: "#b45309", border: "#fde68a" };
      default:
        return { bg: "#e9d5ff", text: "#7c3aed", border: "#d8b4fe" };
    }
  };

  const typeStyle = getSessionTypeStyle();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    } catch {
      return dateStr;
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>إضافة موعد في الجدول</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={loading}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Section Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Calendar size={18} color="#10b981" />
                <Text style={styles.infoLabel}>التاريخ:</Text>
                <Text style={styles.infoValue}>{formatDate(sectionDate)}</Text>
              </View>

              <View style={styles.infoRow}>
                <BookOpen size={18} color="#10b981" />
                <Text style={styles.infoLabel}>الحلقة:</Text>
                <Text style={styles.infoValue}>{groupName}</Text>
              </View>

              <View style={styles.infoRow}>
                {sessionType === "hifz" ? (
                  <BookOpen size={18} color={typeStyle.text} />
                ) : (
                  <RotateCcw size={18} color={typeStyle.text} />
                )}
                <Text style={styles.infoLabel}>نوع الجلسة:</Text>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: typeStyle.bg,
                      borderColor: typeStyle.border,
                    },
                  ]}>
                  <Text
                    style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                    {getSessionTypeLabel()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.timeSection}>
              <View style={styles.timeSectionHeader}>
                <Clock size={20} color="#10b981" />
                <Text style={styles.timeSectionTitle}>اختر وقت الجلسة</Text>
              </View>

              {loadingHours ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text style={styles.loadingText}>جاري تحميل الأوقات...</Text>
                </View>
              ) : (
                <>
                  {/* Start Time */}
                  <Text style={styles.timeLabel}>وقت البداية</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hoursContainer}>
                    {availableHours.map((hour) => (
                      <TouchableOpacity
                        key={`start-${hour}`}
                        style={[
                          styles.hourButton,
                          selectedStartHour === hour &&
                            styles.hourButtonSelected,
                        ]}
                        onPress={() => setSelectedStartHour(hour)}
                        disabled={loading}>
                        <Text
                          style={[
                            styles.hourText,
                            selectedStartHour === hour &&
                              styles.hourTextSelected,
                          ]}>
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* End Time */}
                  <Text style={styles.timeLabel}>وقت النهاية</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hoursContainer}>
                    {availableHours.map((hour) => {
                      const isDisabled =
                        availableHours.indexOf(hour) <=
                        availableHours.indexOf(selectedStartHour);
                      return (
                        <TouchableOpacity
                          key={`end-${hour}`}
                          style={[
                            styles.hourButton,
                            selectedEndHour === hour &&
                              styles.hourButtonSelected,
                            isDisabled && styles.hourButtonDisabled,
                          ]}
                          onPress={() =>
                            !isDisabled && setSelectedEndHour(hour)
                          }
                          disabled={loading || isDisabled}>
                          <Text
                            style={[
                              styles.hourText,
                              selectedEndHour === hour &&
                                styles.hourTextSelected,
                              isDisabled && styles.hourTextDisabled,
                            ]}>
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Selected Time Summary */}
                  {selectedStartHour && selectedEndHour && (
                    <View style={styles.timeSummary}>
                      <Clock size={16} color="#047857" />
                      <Text style={styles.timeSummaryText}>
                        من {selectedStartHour} إلى {selectedEndHour}
                      </Text>
                    </View>
                  )}
                </>
              )}
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
                  (loading || loadingHours) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || loadingHours}>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>إضافة الموعد</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
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
  scrollView: {
    padding: 20,
    paddingTop: 16,
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
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeSection: {
    marginBottom: 20,
  },
  timeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  hoursContainer: {
    marginBottom: 16,
  },
  hourButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hourButtonSelected: {
    backgroundColor: "#10b981",
    borderColor: "#059669",
  },
  hourButtonDisabled: {
    backgroundColor: "#f1f5f9",
    opacity: 0.5,
  },
  hourText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  hourTextSelected: {
    color: "#ffffff",
  },
  hourTextDisabled: {
    color: "#94a3b8",
  },
  timeSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  timeSummaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#047857",
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
