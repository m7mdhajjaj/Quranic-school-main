import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PageHeader = () => {
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>📿</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>الأذكار</Text>
        <Text style={styles.subtitle}>اختر نوع الأذكار التي تريد قراءتها</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  icon: {
    fontSize: 28,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },
  subtitle: {
    marginTop: 2,
    color: "#059669",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
});

export default PageHeader;
