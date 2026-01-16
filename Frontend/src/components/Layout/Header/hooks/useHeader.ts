import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from './useNavigation';
import { useLogo } from '@/components/Hooks/useLogo';
import { showLogoutConfirmation } from '@/pages/Auth/LogOut/logoutUtils';
import type { NavigationItem } from '../types/navigation.types';

// ============================================================================
// Types
// ============================================================================
interface UseHeaderOptions {
  isGuest?: boolean;
}

interface UseHeaderReturn {
  // User & Auth
  currentUser: ReturnType<typeof useAuth>['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Logo
  logoUrl: string | null;
  logoLoading: boolean;
  
  // Navigation
  primaryNavItems: NavigationItem[];
  secondaryNavItems: NavigationItem[];
  combinedItems: NavigationItem[];
  
  // Menu States
  isMenuOpen: boolean;
  profileMenuOpen: boolean;
  isChangePasswordModalOpen: boolean;
  
  // Refs
  profileMenuRef: React.RefObject<HTMLButtonElement | null>;
  
  // Handlers
  handleLogout: () => Promise<void>;
  handleProfileClick: () => void;
  handleChangePasswordClick: () => void;
  toggleMobileMenu: () => void;
  toggleProfileMenu: () => void;
  closeMobileMenu: () => void;
  closeProfileMenu: () => void;
  closeChangePasswordModal: () => void;
  
  // Utils
  isGuestPathActive: (path: string) => boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================
export const useHeader = ({ isGuest = false }: UseHeaderOptions = {}): UseHeaderReturn => {
  // ==================== External Hooks ====================
  const auth = useAuth();
  const navigate = useNavigate();
  const { logoUrl, logoLoading } = useLogo();

  // ==================== State ====================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // ==================== Refs ====================
  const profileMenuRef = useRef<HTMLButtonElement>(null);

  // ==================== Derived Values ====================
  const currentUser = isGuest ? null : auth.user;
  const isAuthenticated = isGuest ? false : auth.isAuthenticated;
  const isLoading = isGuest ? false : auth.isLoading;

  // ==================== Role Checks ====================
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const isSecretary = currentUser?.role === 'secretary';
  const isTeacherOrAdmin = isTeacher || isAdmin;
  
  // صلاحيات السكرتير
  const secretaryPermissions = isSecretary ? currentUser?.permissions : undefined;

  // ==================== Navigation ====================
  const { primaryNavItems, secondaryNavItems } = useNavigation({
    isTeacher,
    isAdmin,
    isStudent,
    isSecretary,
    isTeacherOrAdmin,
    secretaryPermissions,
  });

  const combinedItems: NavigationItem[] = primaryNavItems;

  // ==================== Handlers ====================
  const handleLogout = useCallback(async () => {
    const confirmed = await showLogoutConfirmation({
      userType: 'user',
      onConfirm: () => {
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
        auth.logout();
      },
    });
    if (!confirmed) console.log('تم إلغاء تسجيل الخروج');
  }, [auth]);

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleChangePasswordClick = useCallback(() => {
    setIsChangePasswordModalOpen(true);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const closeProfileMenu = useCallback(() => {
    setProfileMenuOpen(false);
  }, []);

  const closeChangePasswordModal = useCallback(() => {
    setIsChangePasswordModalOpen(false);
  }, []);

  const isGuestPathActive = useCallback((path: string) => {
    return window.location.pathname === path;
  }, []);

  // ==================== Effects ====================
  // Redirect if not authenticated (only for non-guest mode)
  useEffect(() => {
    if (!isGuest && !isLoading && !isAuthenticated && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isGuest, isAuthenticated, currentUser, navigate, isLoading]);

  // Close menus on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // ==================== Return ====================
  return {
    // User & Auth
    currentUser,
    isAuthenticated,
    isLoading,
    
    // Logo
    logoUrl,
    logoLoading,
    
    // Navigation
    primaryNavItems,
    secondaryNavItems,
    combinedItems,
    
    // Menu States
    isMenuOpen,
    profileMenuOpen,
    isChangePasswordModalOpen,
    
    // Refs
    profileMenuRef,
    
    // Handlers
    handleLogout,
    handleProfileClick,
    handleChangePasswordClick,
    toggleMobileMenu,
    toggleProfileMenu,
    closeMobileMenu,
    closeProfileMenu,
    closeChangePasswordModal,
    
    // Utils
    isGuestPathActive,
  };
};

export default useHeader;
