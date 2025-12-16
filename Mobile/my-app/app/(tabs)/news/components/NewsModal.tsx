import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  X,
  Plus,
  Edit,
  Globe,
  Users,
  Upload,
  Trash2,
} from "lucide-react-native";
import { INews } from "@/Api/newsApi";

interface NewsModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  isLoading: boolean;
  newNews: Partial<INews>;
  selectedImages: string[];
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (name: string, value: string) => void;
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  isEditMode,
  isLoading,
  newNews,
  selectedImages,
  onClose,
  onSubmit,
  onInputChange,
  onPickImages,
  onRemoveImage,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* Header */}
            <View
              style={[
                styles.header,
                isEditMode ? styles.headerEdit : styles.headerAdd,
              ]}>
              <View style={styles.headerContent}>
                {isEditMode ? (
                  <Edit size={28} color="#ffffff" />
                ) : (
                  <Plus size={28} color="#ffffff" />
                )}
                <Text style={styles.headerTitle}>
                  {isEditMode ? "تعديل الخبر" : "إضافة خبر جديد"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.formContent}
              showsVerticalScrollIndicator={false}>
              {/* Title Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  عنوان الخبر <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={newNews.title}
                  onChangeText={(value) => onInputChange("title", value)}
                  placeholder="أدخل عنوان الخبر"
                  placeholderTextColor="#9ca3af"
                  editable={!isLoading}
                />
              </View>

              {/* Visibility Selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  نوع الخبر <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.visibilityContainer}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      (newNews.visibility === "general" ||
                        !newNews.visibility) &&
                        styles.visibilityOptionActive,
                    ]}
                    onPress={() => onInputChange("visibility", "general")}
                    activeOpacity={0.7}>
                    <Globe
                      size={24}
                      color={
                        newNews.visibility === "general" || !newNews.visibility
                          ? "#10b981"
                          : "#6b7280"
                      }
                    />
                    <Text
                      style={[
                        styles.visibilityLabel,
                        (newNews.visibility === "general" ||
                          !newNews.visibility) &&
                          styles.visibilityLabelActive,
                      ]}>
                      عام
                    </Text>
                    <Text style={styles.visibilityDescription}>
                      يظهر لجميع الطلاب والمعلمين
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      newNews.visibility === "group" &&
                        styles.visibilityOptionActive,
                    ]}
                    onPress={() => onInputChange("visibility", "group")}
                    activeOpacity={0.7}>
                    <Users
                      size={24}
                      color={
                        newNews.visibility === "group" ? "#10b981" : "#6b7280"
                      }
                    />
                    <Text
                      style={[
                        styles.visibilityLabel,
                        newNews.visibility === "group" &&
                          styles.visibilityLabelActive,
                      ]}>
                      طلاب المعلم
                    </Text>
                    <Text style={styles.visibilityDescription}>
                      يظهر لطلابك فقط
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image Upload Section */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  صور الخبر
                  <Text style={styles.imageNote}>
                    {" (حتى 10 صور, كل صورة حتى 5MB)"}
                  </Text>
                </Text>

                {/* Upload Button */}
                {selectedImages.length < 10 && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={onPickImages}
                    activeOpacity={0.7}
                    disabled={isLoading}>
                    <Upload size={32} color="#10b981" />
                    <Text style={styles.uploadText}>اضغط لاختيار الصور</Text>
                    <Text style={styles.uploadSubtext}>
                      {selectedImages.length} / 10 صور محملة
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Image Preview Grid */}
                {selectedImages.length > 0 && (
                  <View style={styles.imageGrid}>
                    {selectedImages.map((uri, index) => (
                      <View key={index} style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => onRemoveImage(index)}
                          activeOpacity={0.7}>
                          <Trash2 size={16} color="#ffffff" />
                        </TouchableOpacity>
                        <View style={styles.imageNumber}>
                          <Text style={styles.imageNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Content Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  محتوى الخبر <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newNews.content}
                  onChangeText={(value) => onInputChange("content", value)}
                  placeholder="أدخل محتوى الخبر"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
                disabled={isLoading}
                activeOpacity={0.7}>
                <X size={20} color="#ffffff" />
                <Text style={styles.buttonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSubmit}
                style={[
                  styles.button,
                  isEditMode ? styles.updateButton : styles.addButton,
                ]}
                disabled={isLoading}
                activeOpacity={0.7}>
                {isEditMode ? (
                  <Edit size={20} color="#ffffff" />
                ) : (
                  <Plus size={20} color="#ffffff" />
                )}
                <Text style={styles.buttonText}>
                  {isEditMode ? "تحديث" : "إضافة"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 600,
    maxHeight: "90%",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerAdd: {
    backgroundColor: "#10b981",
  },
  headerEdit: {
    backgroundColor: "#3b82f6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    padding: 20,
    maxHeight: 400,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    textAlign: "right",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  visibilityContainer: {
    flexDirection: "row",
    gap: 12,
  },
  visibilityOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  visibilityOptionActive: {
    borderColor: "#10b981",
    backgroundColor: "#d1fae5",
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6b7280",
    marginTop: 8,
  },
  visibilityLabelActive: {
    color: "#059669",
  },
  visibilityDescription: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  addButton: {
    backgroundColor: "#10b981",
  },
  updateButton: {
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageNote: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "normal",
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#10b981",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  imagePreviewContainer: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 20,
    padding: 6,
  },
  imageNumber: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageNumberText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
