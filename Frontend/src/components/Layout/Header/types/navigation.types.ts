import type { LucideIcon } from "lucide-react";
import type { Socket } from "socket.io-client";

export interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  color: string;
  subItems?: NavigationItem[]; // عناصر القائمة المنسدلة
}

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: "student" | "teacher" | "admin" | "secretary";
  profileImage?: string;
}

export interface HeaderProps {
  className?: string;
  isGuest?: boolean;
}

export interface LogoProps {
  className?: string;
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

export interface ProfileMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onChangePasswordClick: () => void;
  onLogout: () => void;
}

export interface ProfileButtonProps {
  user: User;
  isOpen: boolean;
  onClick: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  primaryItems: NavigationItem[];
  secondaryItems: NavigationItem[];
  onLogout: () => void;
  onProfileClick: () => void;
}

export interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export interface SocketHookReturn {
  socket: Socket | null;
}

export interface LogoHookReturn {
  logoUrl: string | null;
  logoLoading: boolean;
}

// Secretary Access Levels
export type AccessLevel = 'none' | 'view' | 'manage';

export interface SecretaryPermissions {
  groupsAccess?: AccessLevel;
  teachersAccess?: AccessLevel;
  studentsAccess?: AccessLevel;
}

export interface RolePermissions {
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isSecretary: boolean;
  isTeacherOrAdmin: boolean;
  // صلاحيات السكرتير
  secretaryPermissions?: SecretaryPermissions;
}

export interface NavigationHookReturn {
  primaryNavItems: NavigationItem[];
  secondaryNavItems: NavigationItem[];
}