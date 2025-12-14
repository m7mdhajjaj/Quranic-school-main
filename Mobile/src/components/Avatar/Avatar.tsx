import React, { useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { AuthUser } from "../../pages/Auth/types";

interface AvatarProps {
  user: AuthUser;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 32, style }) => {
  const uri = user?.avatar?.url || user?.imageUrl || undefined;

  const initials = useMemo(() => {
    const name =
      user?.firstName || user?.name || (user?.lastName ? user?.lastName : "");
    const letter = (name || "م").trim().charAt(0);
    return letter || "م";
  }, [user?.firstName, user?.name, user?.lastName]);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
          style as unknown as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#e5e7eb",
  },
  fallback: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#065f46",
    fontWeight: "700",
  },
});

export default Avatar;
