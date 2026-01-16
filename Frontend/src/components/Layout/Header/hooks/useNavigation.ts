import { useMemo } from "react";
import { getPrimaryNavItems, getSecondaryNavItems } from "../constants/navigationItems";
import type { NavigationHookReturn, RolePermissions, SecretaryPermissions } from "../types/navigation.types";

interface UseNavigationParams extends Omit<RolePermissions, 'secretaryPermissions'> {
  secretaryPermissions?: SecretaryPermissions;
}

export const useNavigation = (params: UseNavigationParams): NavigationHookReturn => {
  const rolePermissions: RolePermissions = {
    isStudent: params.isStudent,
    isTeacher: params.isTeacher,
    isAdmin: params.isAdmin,
    isSecretary: params.isSecretary,
    isTeacherOrAdmin: params.isTeacherOrAdmin,
    secretaryPermissions: params.secretaryPermissions,
  };

  const primaryNavItems = useMemo(
    () => getPrimaryNavItems(rolePermissions),
    [
      rolePermissions.isStudent,
      rolePermissions.isTeacher,
      rolePermissions.isAdmin,
      rolePermissions.isSecretary,
      rolePermissions.isTeacherOrAdmin,
      rolePermissions.secretaryPermissions?.groupsAccess,
      rolePermissions.secretaryPermissions?.teachersAccess,
    ]
  );

  const secondaryNavItems = useMemo(
    () => getSecondaryNavItems(rolePermissions),
    [rolePermissions]
  );

  return { primaryNavItems, secondaryNavItems };
};