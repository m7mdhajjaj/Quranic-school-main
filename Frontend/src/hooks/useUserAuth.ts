import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  _id: string;
  name?: string;
  role?: 'student' | 'teacher' | 'admin' | string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber?: string;
  teacherId?: number;
  studentId?: number;
  group?: string;
  groups?: string[];
  teacher?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  residence?: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useUserAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Clear user data from localStorage
  const clearUserData = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Load user data from localStorage
  const loadUserData = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return user;
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearUserData();
      return null;
    }
  }, [clearUserData]);

  // Save user data to localStorage
  const saveUserData = useCallback((user: User, token: string) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearUserData();
    navigate('/login', { replace: true });
  }, [clearUserData, navigate]);

  // Update user data
  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setAuthState(prevState => {
      if (!prevState.user) return prevState;
      
      const newUser = { ...prevState.user, ...updatedUser };
      
      try {
        localStorage.setItem('user', JSON.stringify(newUser));
      } catch (error) {
        console.error('Error updating user data:', error);
      }
      
      return {
        ...prevState,
        user: newUser,
      };
    });
  }, []);

  // Check if user is teacher or admin
  const isTeacherOrAdmin = useCallback(() => {
    return authState.user?.role === 'teacher' || authState.user?.role === 'admin';
  }, [authState.user?.role]);

  // Get user's full name
  const getUserFullName = useCallback(() => {
    const { user } = authState;
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    return user.firstName || user.name || '';
  }, [authState]);

  // Get user's display role
  const getUserRole = useCallback(() => {
    switch (authState.user?.role) {
      case 'teacher':
        return 'معلم';
      case 'admin':
        return 'مدير';
      case 'student':
      default:
        return 'طالب';
    }
  }, [authState.user?.role]);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    ...authState,
    loadUserData,
    saveUserData,
    clearUserData,
    logout,
    updateUser,
    isTeacherOrAdmin,
    getUserFullName,
    getUserRole,
  };
};

export default useUserAuth;