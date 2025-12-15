import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useAuth, useRoleLayout } from "../../../hooks";
import UserHeader from "./Header/UserHeader";
import { UserSidebar } from "./Sidebar";

interface UserLayoutProps {
  children: React.ReactNode;
  routeName: string;
  onNavigate: (routeName: string) => void;
}

const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  routeName,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { getPageInfo } = useRoleLayout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageInfo = useMemo(
    () => getPageInfo(routeName),
    [getPageInfo, routeName]
  );

  if (!user) return <>{children}</>;

  return (
    <View style={styles.root}>
      <UserHeader
        title={pageInfo.title}
        breadcrumb={pageInfo.breadcrumb}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        onChangePasswordClick={() => onNavigate("ChangePassword")}
      />

      <UserSidebar
        isMobileOpen={sidebarOpen}
        currentRouteName={routeName}
        onMobileClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        onChangePasswordClick={() => onNavigate("ChangePassword")}
      />

      {Platform.OS === "web" ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.webContentContainer}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#f0fdf4",
    ...(Platform.OS === "web"
      ? ({ height: Dimensions.get("window").height } as const)
      : null),
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  webContentContainer: {
    flexGrow: 1,
  },
});

export default UserLayout;
