import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface User {
  name?: string;
  role?: string;
}

interface HomeHeaderProps {
  user: User | null;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ user }) => {
  const getRoleText = (role?: string) => {
    switch (role) {
      case "student":
        return "طالب";
      case "teacher":
        return "معلم";
      case "admin":
        return "مدير";
      default:
        return "مستخدم";
    }
  };

  return (
    <LinearGradient colors={["#10b981", "#059669"]} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.welcomeText}>مرحباً</Text>
        <Text style={styles.userName}>{user?.name || "المستخدم"}</Text>
        <Text style={styles.roleText}>{getRoleText(user?.role)}</Text>
      </View>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{user?.name?.charAt(0) || "؟"}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    color: "#a7f3d0",
    fontSize: 14,
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  roleText: {
    color: "#6ee7b7",
    fontSize: 14,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
  },
});
