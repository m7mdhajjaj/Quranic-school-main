import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit2 } from "lucide-react-native";
import type { AuthUser } from "../../Auth/types";

type Props = {
  currentUser: AuthUser | null;
  heroImage: string | null;
  heroImageLoading: boolean;
  uploading: boolean;
  isTeacherOrAdmin: boolean;
  onEditHeroImage: () => void;
  onStartJourney: () => void;
};

const HeroSection = ({
  currentUser,
  heroImage,
  heroImageLoading,
  uploading,
  isTeacherOrAdmin,
  onEditHeroImage,
  onStartJourney,
}: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const greetingTitle = useMemo(() => {
    if (!currentUser) return "أهلاً وسهلاً بك";

    if (currentUser.role === "student") {
      const fullName = `${currentUser.firstName || ""} ${
        currentUser.fatherName || ""
      } ${currentUser.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim();

      return `أهلاً وسهلاً بك في أكاديمية المهاجرين، الطالب العزيز ${fullName}`.trim();
    }

    const fullName = `${currentUser.firstName || currentUser.name || ""} ${
      currentUser.lastName || ""
    }`
      .replace(/\s+/g, " ")
      .trim();

    return `أهلاً وسهلاً بك في أكاديمية المهاجرين، المعلم الفاضل ${fullName}`.trim();
  }, [currentUser]);

  return (
    <View style={styles.container}>
      {/* Image (top on mobile) */}
      <View style={styles.imageWrap}>
        {heroImage ? (
          <>
            {!imageLoaded && (
              <View style={styles.imageSkeleton}>
                <ActivityIndicator color="#ffffff" />
              </View>
            )}
            <Image
              source={{ uri: heroImage }}
              style={[
                styles.image,
                imageLoaded ? styles.imageVisible : styles.imageHidden,
              ]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
            />
            <View style={styles.imageOverlay} />
          </>
        ) : heroImageLoading ? (
          <View style={styles.imageSkeleton}>
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : (
          <LinearGradient
            colors={["#1e3a8a", "#111827"]}
            style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🕌</Text>
          </LinearGradient>
        )}

        {isTeacherOrAdmin && !heroImageLoading && (
          <TouchableOpacity
            onPress={onEditHeroImage}
            disabled={uploading}
            style={styles.editButton}
            accessibilityRole="button"
            accessibilityLabel={uploading ? "جاري الرفع" : "تعديل صورة الهيرو"}>
            {uploading ? (
              <ActivityIndicator color="#065f46" />
            ) : (
              <Edit2 size={18} color="#047857" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{greetingTitle}</Text>

        <View style={styles.paragraphs}>
          <Text style={styles.paragraphPrimary}>
            يسرنا انضمامك إلى أكاديمية المهاجرين، حيث نؤمن أنك جزء من رحلة
            التميز في رحاب القرآن الكريم.
          </Text>
          <Text style={styles.paragraphSecondary}>
            نتمنى لك رحلة تعليمية ملهمة ومليئة بالنجاح، وأن تحقق أهدافك وتصل إلى
            أعلى درجات التفوق في حفظ وتلاوة وفهم كتاب الله عز وجل.
          </Text>
          {currentUser?.role === "student" && currentUser.group ? (
            <Text style={styles.groupText}>المجموعة: {currentUser.group}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={onStartJourney}
          style={styles.ctaButton}
          accessibilityRole="button">
          <Text style={styles.ctaText}>ابدأ رحلتك التعليمية</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  imageWrap: {
    position: "relative",
    height: 240,
    width: "100%",
    overflow: "hidden",
  },
  imageSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageHidden: {
    opacity: 0,
  },
  imageVisible: {
    opacity: 1,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 41, 59, 0.08)",
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 52,
    color: "rgba(255, 255, 255, 0.45)",
  },
  editButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065f46",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 12,
  },
  paragraphs: {
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  paragraphPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
  },
  paragraphSecondary: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  groupText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  ctaButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default HeroSection;
