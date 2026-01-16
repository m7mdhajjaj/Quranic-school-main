// ============================================================================
// Secretary Index Screen - الصفحة الرئيسية للسكرتير
// ============================================================================

import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function SecretaryIndex() {
  const { user, getSecretaryPermissions } = useAuth();
  const permissions = getSecretaryPermissions();

  // إعادة التوجيه حسب الصلاحيات
  if (permissions?.studentsAccess && permissions.studentsAccess !== "none") {
    return <Redirect href="/(tabs)/secretary/students" />;
  }
  if (permissions?.groupsAccess && permissions.groupsAccess !== "none") {
    return <Redirect href="/(tabs)/secretary/groups" />;
  }
  if (permissions?.teachersAccess && permissions.teachersAccess !== "none") {
    return <Redirect href="/(tabs)/secretary/teachers" />;
  }

  // إذا لم يكن لديه أي صلاحيات، أعده للصفحة الرئيسية
  return <Redirect href="/(tabs)" />;
}
