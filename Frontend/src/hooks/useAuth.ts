import { useContext } from 'react';
import AuthContext, { type AuthContextType } from '../Context/AuthContext';

// Hook مخصص لاستخدام AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth يجب أن يُستخدم داخل AuthProvider');
  }
  
  return context;
};