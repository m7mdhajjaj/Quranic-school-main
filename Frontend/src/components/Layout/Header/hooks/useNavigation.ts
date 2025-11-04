import { useMemo } from "react";
import { getPrimaryNavItems, getSecondaryNavItems } from "../constants/navigationItems";
import type { NavigationHookReturn, RolePermissions } from "../types/navigation.types";

export const useNavigation = (rolePermissions: RolePermissions): NavigationHookReturn => {
  const primaryNavItems = useMemo(
    () => getPrimaryNavItems(rolePermissions),
    [rolePermissions]
  );

  const secondaryNavItems = useMemo(
    () => getSecondaryNavItems(rolePermissions),
    [rolePermissions]
  );

  return { primaryNavItems, secondaryNavItems };
};