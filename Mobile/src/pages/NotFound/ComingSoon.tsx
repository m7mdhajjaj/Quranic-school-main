import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ComingSoonProps {
  title?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title || "قريباً"}</Text>
        <Text style={styles.subtitle}>
          هذه الصفحة ستكون متاحة قريباً إن شاء الله
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
  },
  title: {
    color: "#065f46",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default ComingSoon;
