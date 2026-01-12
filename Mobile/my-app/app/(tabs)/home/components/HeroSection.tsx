import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui";
import { Edit2 } from "lucide-react-native";

interface User {
  role?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  name?: string;
  group?: string;
}

interface HeroSectionProps {
  currentUser: User | null;
  heroImage: string | null;
  heroImageLoading: boolean;
  uploading: boolean;
  isTeacherOrAdmin: boolean;
  onEditButtonClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentUser,
  heroImage,
  heroImageLoading,
  uploading,
  isTeacherOrAdmin,
  onEditButtonClick,
}) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Text Content */}
      <View style={styles.textContent}>
        {/* Personalized Greeting */}
        {currentUser && (
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTitle}>
              {currentUser.role === "student"
                ? `أهلاً وسهلاً بك في أكاديمية المهاجرين، الطالب العزيز ${
                    currentUser.firstName || ""
                  } ${currentUser.fatherName || ""} ${
                    currentUser.lastName || ""
                  }`.trim()
                : `أهلاً وسهلاً بك في أكاديمية المهاجرين، المعلم الفاضل ${
                    currentUser.firstName || currentUser.name || ""
                  } ${currentUser.lastName || ""}`.trim()}
            </Text>

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                يسرنا انضمامك إلى أكاديمية المهاجرين، حيث نؤمن أنك جزء من رحلة
                التميز في رحاب القرآن الكريم.
              </Text>
              {currentUser.role === "student" && currentUser.group && (
                <Text style={styles.groupText}>
                  المجموعة: {currentUser.group}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button variant="primary" size="lg" style={styles.button}>
            ابدأ رحلتك التعليمية
          </Button>
        </View>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          {heroImage ? (
            <>
              {(!imageLoaded || heroImageLoading) && (
                <View style={styles.imageSkeleton}>
                  <ActivityIndicator size="large" color="#10b981" />
                </View>
              )}
              <Image
                source={{ uri: heroImage }}
                style={[
                  styles.image,
                  imageLoaded ? styles.imageVisible : styles.imageHidden,
                ]}
                onLoad={() => setImageLoaded(true)}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
            </>
          ) : heroImageLoading ? (
            <View style={styles.imageSkeleton}>
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.placeholderIcon} />
            </View>
          )}

          {/* Edit button for teachers/admins */}
          {isTeacherOrAdmin && !heroImageLoading && onEditButtonClick && (
            <TouchableOpacity
              onPress={onEditButtonClick}
              disabled={uploading}
              style={styles.editButton}
              activeOpacity={0.7}>
              {uploading ? (
                <ActivityIndicator size="small" color="#047857" />
              ) : (
                <Edit2 size={18} color="#047857" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  textContent: {
    padding: 24,
  },
  greetingContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#047857",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  descriptionContainer: {
    maxWidth: 600,
  },
  descriptionText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
    lineHeight: 24,
  },
  descriptionSubText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  groupText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  button: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    paddingHorizontal: 32,
  },
  imageContainer: {
    padding: 16,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageVisible: {
    opacity: 1,
  },
  imageHidden: {
    opacity: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
  },
  imageSkeleton: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#4c1d95",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  editButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
