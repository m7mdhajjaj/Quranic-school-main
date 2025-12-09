import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

// Components
import { HomeHeader, StatsCard, MenuGrid, MenuItem } from "./components";

// Constants
import { MENU_ITEMS } from "./constants";

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch updated data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleMenuItemPress = (item: MenuItem) => {
    // TODO: Navigate to the respective screen
    console.log("Navigate to:", item.route);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#10b981"]}
          tintColor="#10b981"
        />
      }>
      {/* Header */}
      <HomeHeader user={user} />

      {/* Stats Card */}
      <StatsCard points={0} attendance={0} quranParts={0} />

      {/* Menu Grid */}
      <MenuGrid items={MENU_ITEMS} onItemPress={handleMenuItemPress} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  logoutButton: {
    backgroundColor: "#fef2f2",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 30,
  },
});

export default Home;
