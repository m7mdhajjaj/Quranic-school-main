import { useContext, useEffect } from 'react';
import AuthContext, { type AuthContextType } from '../contexts/AuthContext';

// Hook مخصص لاستخدام AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth يجب أن يُستخدم داخل AuthProvider');
  }
  
  return context;
};

// Hook للتحقق من المصادقة مع إعادة التوجه
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);
  
  return { isAuthenticated, isLoading };
};

// Hook للتحقق من الأدوار
export const useRoleGuard = (allowedRoles: string[]) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const hasPermission = isAuthenticated && 
    user && 
    allowedRoles.includes(user.role);
  
  return {
    hasPermission,
    isAuthenticated,
    isLoading,
    userRole: user?.role,
  };
};