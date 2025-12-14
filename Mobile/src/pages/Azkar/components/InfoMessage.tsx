import React from "react";
import { StyleSheet, Text, View } from "react-native";

const InfoMessage = () => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>📿</Text>
        <View style={styles.textWrap}>
          <Text style={styles.title}>أذكار مختصرة للطلاب</Text>
          <Text style={styles.body}>
            هذه مجموعة مختارة من الأذكار بأعداد مناسبة لتسهيل الالتزام بها
            يومياً. نسأل الله أن يعيننا وإياكم على ذكره وشكره وحسن عبادته
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ✨ اجعل الأذكار عادة يومية تنير قلبك وتحصّن نفسك ✨
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  emoji: {
    fontSize: 28,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#047857",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  body: {
    marginTop: 6,
    color: "#374151",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  footer: {
    marginTop: 10,
    alignItems: "center",
  },
  footerText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
});

export default InfoMessage;
