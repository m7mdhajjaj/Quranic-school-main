// components/profile/AvatarSection.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { Avatar } from "@/components/Avatar/Avatar";
import type { UserProfile } from "@/types/profile.types";

interface AvatarSectionProps {
  user: UserProfile;
  avatarFile: string | null;
  isEditing: boolean;
  onPickImage: () => void;
  onDeleteAvatar: () => void;
}

export const AvatarSection = ({
  user,
  avatarFile,
  isEditing,
  onPickImage,
  onDeleteAvatar,
}: AvatarSectionProps) => {
  // Get avatar URL safely
  const avatarUrl =
    typeof user.avatar === "object" && user.avatar?.url
      ? user.avatar.url
      : typeof user.avatar === "string"
        ? user.avatar
        : null;

  return (
    <View style={styles.container}>
      {/* Avatar with Preview */}
      <View style={styles.avatarWrapper}>
        {avatarFile && typeof avatarFile === "string" ? (
          <Image source={{ uri: avatarFile }} style={styles.preview} />
        ) : (
          <Avatar
            user={user}
            size="xl"
            border="thick"
            showStatus={true}
            statusSize="lg"
            userId={user._id}
            userRole={user.role}
          />
        )}

        {/* Edit Button - shown when editing */}
        {isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={onPickImage}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        )}

        {/* Delete Button - shown when editing and has image */}
        {isEditing && (avatarFile || avatarUrl) && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDeleteAvatar}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  preview: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  editButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    fontSize: 18,
    color: "#ffffff",
  },
  deleteButton: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
