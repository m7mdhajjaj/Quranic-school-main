import { useMemo, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface MenuPosition {
  top: number;
  right: number;
}

interface MenuButton {
  label: string;
  icon: string; // icon key - سيتم تحويله لأيقونة في الـ component
  onClick: () => void;
  variant: "ghost";
  isActive: boolean;
  isLogout: boolean;
}

interface UseProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onChangePasswordClick: () => void;
  onLogout: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

interface UseProfileMenuReturn {
  menuPosition: MenuPosition;
  menuButtons: MenuButton[];
  isProfilePage: boolean;
  isChangePassword: boolean;
}

/**
 * Hook لإدارة منطق قائمة الملف الشخصي
 * يتضمن:
 * - حساب موضع القائمة المنسدلة
 * - إنشاء أزرار القائمة
 * - تتبع الصفحة الحالية
 */
export const useProfileMenu = ({
  isOpen,
  onClose,
  onProfileClick,
  onChangePasswordClick,
  onLogout,
  buttonRef,
}: UseProfileMenuProps): UseProfileMenuReturn => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isChangePassword = isProfilePage && location.search.includes('change-password');
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, right: 0 });

  // إنشاء أزرار القائمة
  const menuButtons = useMemo<MenuButton[]>(() => [
    {
      label: "الملف الشخصي",
      icon: "user",
      onClick: () => {
        onClose();
        onProfileClick();
      },
      variant: "ghost" as const,
      isActive: isProfilePage && !isChangePassword,
      isLogout: false
    },
    {
      label: "تغيير كلمة المرور", 
      icon: "key",
      onClick: () => {
        onClose();
        onChangePasswordClick();
      },
      variant: "ghost" as const,
      isActive: isChangePassword,
      isLogout: false
    },
    {
      label: "تسجيل الخروج",
      icon: "logout",
      onClick: onLogout,
      variant: "ghost" as const,
      isActive: false,
      isLogout: true
    }
  ], [onClose, onProfileClick, onChangePasswordClick, onLogout, isProfilePage, isChangePassword]);

  // حساب موضع القائمة المنسدلة
  const updatePosition = useCallback(() => {
    if (!buttonRef?.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const menuWidth = screenWidth >= 640 ? 256 : 224; // w-56 = 224px, w-64 = 256px
    
    // تحديد المحاذاة بناءً على موقع الزر في الشاشة
    let rightPosition;
    
    if (buttonRect.left < screenWidth / 2) {
      // محاذاة الحافة اليسرى للقائمة مع الحافة اليسرى للزر
      rightPosition = screenWidth - (buttonRect.left + menuWidth);
    } else {
      // محاذاة الحافة اليمنى للقائمة مع الحافة اليمنى للزر
      rightPosition = screenWidth - buttonRect.right;
    }
    
    // حساب الموضع العمودي - مباشرة تحت الزر مع مسافة صغيرة
    let topPosition = buttonRect.bottom + 6;
    
    // إذا لم يكن هناك مساحة كافية في الأسفل، افتح القائمة للأعلى
    const estimatedHeight = 200;
    if (topPosition + estimatedHeight > screenHeight - 16) {
      topPosition = buttonRect.top - estimatedHeight - 6;
      if (topPosition < 16) {
        topPosition = 16;
      }
    }
    
    setMenuPosition({
      top: Math.max(16, topPosition),
      right: rightPosition,
    });
  }, [buttonRef]);

  // Effect لتحديث الموضع
  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      // حساب الموضع فوراً
      updatePosition();
      
      // إعادة حساب الموضع عند تغيير حجم النافذة أو التمرير
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, buttonRef, updatePosition]);

  return {
    menuPosition,
    menuButtons,
    isProfilePage,
    isChangePassword,
  };
};

export default useProfileMenu;
