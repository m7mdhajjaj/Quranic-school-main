import type { LucideIcon } from "lucide-react";
import type { Socket } from "socket.io-client";

export interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: "student" | "teacher" | "admin";
  profileImage?: string;
}

export interface HeaderProps {
  className?: string;
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

export interface RolePermissions {
  isTeacher: boolean;
  isAdmin: boolean;
  isTeacherOrAdmin: boolean;
}

export interface NavigationHookReturn {
  primaryNavItems: NavigationItem[];
  secondaryNavItems: NavigationItem[];
}