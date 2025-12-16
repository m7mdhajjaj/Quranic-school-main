import React, { useMemo } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { User as UserIcon } from "lucide-react-native";
import { OnlineStatus } from "./OnlineStatus";
import {
  getUserInfo,
  getAvatarUrl,
  getGenderColor,
  getTextColor,
  getUserInitials,
  normalizeGender,
} from "./utils";

export interface AvatarProps {
  /** Avatar image URL from Cloudinary */
  src?: string | null;
  /** Alternative image URL (for preview when editing) */
  previewSrc?: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Size of the avatar */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  /** User's name for fallback initial */
  userName?: string;
  /** User ID for fetching avatar from API */
  userId?: string;
  /** User role for API endpoint */
  userRole?: string;
  /** User object with all data */
  user?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    gender?: string;
    role?: string;
    isActive?: boolean;
    avatar?: {
      url?: string;
      publicId?: string;
    };
  };
  /** User's gender for color theming */
  gender?: "male" | "female" | "ذكر" | "أنثى";
  /** Whether to show loading state */
  loading?: boolean;
  /** Whether the avatar is clickable */
  clickable?: boolean;
  /** Click handler */
  onPress?: () => void;
  /** Border style */
  border?: "none" | "thin" | "thick" | "ring";
  /** Show online status indicator */
  showStatus?: boolean;
  /** Status indicator size */
  statusSize?: "sm" | "md" | "lg";
  /** Force status */
  forceStatus?: "online" | "offline" | "active" | "inactive";
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  "2xl": 80,
  "3xl": 112,
  "4xl": 160,
};

const iconSizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 64,
};

const fontSizeMap = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 18,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  previewSrc,
  alt,
  size = "md",
  userName,
  user,
  gender: externalGender,
  loading = false,
  clickable = false,
  onPress,
  border = "thin",
  showStatus = false,
  statusSize = "md",
  forceStatus,
}) => {
  // استخراج معلومات المستخدم
  const userInfo = useMemo(() => getUserInfo(user), [user]);

  // تحديد الصورة المعروضة
  const displaySrc = previewSrc || src || getAvatarUrl(user);

  // تحديد اسم المستخدم
  const displayName = userName || userInfo?.name || alt || "";

  // تحديد الجنس
  const userGender = normalizeGender(
    externalGender || userInfo?.gender || user?.gender
  );

  // الحصول على الحرف الأول
  const initial = getUserInitials(displayName);

  // لون الخلفية حسب الجنس
  const bgColor = getGenderColor(userGender);

  // Sizes
  const avatarSize = sizeMap[size];
  const iconSize = iconSizeMap[size];
  const fontSize = fontSizeMap[size];

  // Border styles
  const borderStyles = {
    none: {},
    thin: { borderWidth: 1, borderColor: "#e5e7eb" },
    thick: { borderWidth: 3, borderColor: "#10b981" },
    ring: { borderWidth: 3, borderColor: "#10b981" },
  };

  const containerStyle = [
    styles.container,
    { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
    borderStyles[border],
  ];

  const content = (
    <View style={containerStyle}>
      {loading ? (
        <View style={[styles.loading, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      ) : displaySrc ? (
        <Image
          source={{ uri: displaySrc }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : initial ? (
        <View style={[styles.fallbackText, { backgroundColor: bgColor }]}>
          <Text style={[styles.initialText, { fontSize }]}>{initial}</Text>
        </View>
      ) : (
        <View style={[styles.fallbackIcon, { backgroundColor: bgColor }]}>
          <UserIcon size={iconSize} color="#ffffff" />
        </View>
      )}

      {/* Online Status */}
      {showStatus && (
        <OnlineStatus
          isOnline={forceStatus === "online" || forceStatus === "active"}
          size={statusSize}
          position="absolute"
          user={user}
        />
      )}
    </View>
  );

  if (clickable && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  loading: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    // Size applied dynamically
  },
  fallbackText: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  fallbackIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
