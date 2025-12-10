import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export interface MenuItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  route?: string;
}

interface MenuGridProps {
  items: MenuItem[];
  onItemPress?: (item: MenuItem) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ items, onItemPress }) => {
  return (
    <View style={styles.menuGrid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.menuItem, { backgroundColor: item.color + "15" }]}
          onPress={() => onItemPress?.(item)}
          activeOpacity={0.7}>
          <View
            style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
          </View>
          <Text style={styles.menuTitle}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
  },
  menuItem: {
    width: "47%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});
