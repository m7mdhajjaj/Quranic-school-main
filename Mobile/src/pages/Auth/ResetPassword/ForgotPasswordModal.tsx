import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { X, AlertCircle } from "lucide-react-native";

interface ForgotPasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isVisible,
  onClose,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <AlertCircle size={60} color="#eab308" />
            </View>

            {/* Title */}
            <Text style={styles.title}>نسيت كلمة المرور؟</Text>

            {/* Description */}
            <Text style={styles.description}>
              لإعادة تعيين كلمة المرور، يرجى التواصل مع الإدارة
            </Text>

            {/* Contact Info */}
            <View style={styles.contactContainer}>
              <Text style={styles.contactTitle}>معلومات الاتصال:</Text>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>📞 الهاتف:</Text>
                <Text style={styles.contactValue}>+970 123 456 789</Text>
              </View>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>📧 البريد الإلكتروني:</Text>
                <Text style={styles.contactValue}>admin@quran-school.com</Text>
              </View>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>🕐 أوقات العمل:</Text>
                <Text style={styles.contactValue}>
                  السبت - الخميس: 8:00 ص - 4:00 م
                </Text>
              </View>
            </View>

            {/* Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                ملاحظة: سيتم التحقق من هويتك قبل إعادة تعيين كلمة المرور لضمان
                أمان حسابك.
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>حسناً</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    width: "90%",
    maxHeight: "80%",
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  closeButton: {
    alignSelf: "flex-start",
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  contactContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
    textAlign: "right",
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "right",
  },
  contactValue: {
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
  },
  noteContainer: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  noteText: {
    fontSize: 13,
    color: "#92400e",
    textAlign: "right",
    lineHeight: 20,
  },
  closeBtn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ForgotPasswordModal;
