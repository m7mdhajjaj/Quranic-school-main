import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { checkIsActive } from '../utils/navigation.utils';
import type { NavigationItem } from '../types/navigation.types';

// ============================================================================
// Types
// ============================================================================
interface UseMobileMenuOptions {
  primaryItems: NavigationItem[];
  secondaryItems: NavigationItem[];
  onClose: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

interface UseMobileMenuReturn {
  // Data
  allItems: NavigationItem[];
  expandedItems: string[];
  
  // Location
  pathname: string;
  
  // Handlers
  toggleExpand: (label: string) => void;
  handleNavClick: () => void;
  handleProfileAction: () => void;
  handleLogoutAction: () => void;
  
  // Utils
  isItemActive: (item: NavigationItem) => boolean;
  isSubItemActive: (to: string) => boolean;
  isItemExpanded: (label: string) => boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================
export const useMobileMenu = ({
  primaryItems,
  secondaryItems,
  onClose,
  onLogout,
  onProfileClick,
}: UseMobileMenuOptions): UseMobileMenuReturn => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Combine all navigation items
  const allItems = [...primaryItems, ...secondaryItems];

  // ==================== Handlers ====================
  const toggleExpand = useCallback((label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  }, []);

  const handleNavClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleProfileAction = useCallback(() => {
    onClose();
    onProfileClick();
  }, [onClose, onProfileClick]);

  const handleLogoutAction = useCallback(() => {
    onClose();
    onLogout();
  }, [onClose, onLogout]);

  // ==================== Utils ====================
  const isItemActive = useCallback((item: NavigationItem): boolean => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    if (hasSubItems) {
      return item.subItems?.some(sub => checkIsActive(sub.to, location.pathname)) ?? false;
    }
    return checkIsActive(item.to, location.pathname);
  }, [location.pathname]);

  const isSubItemActive = useCallback((to: string): boolean => {
    return checkIsActive(to, location.pathname);
  }, [location.pathname]);

  const isItemExpanded = useCallback((label: string): boolean => {
    return expandedItems.includes(label);
  }, [expandedItems]);

  // ==================== Return ====================
  return {
    // Data
    allItems,
    expandedItems,
    
    // Location
    pathname: location.pathname,
    
    // Handlers
    toggleExpand,
    handleNavClick,
    handleProfileAction,
    handleLogoutAction,
    
    // Utils
    isItemActive,
    isSubItemActive,
    isItemExpanded,
  };
};

export default useMobileMenu;
