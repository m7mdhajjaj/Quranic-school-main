// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';

// export interface User {
//   _id: string;
//   name?: string;
//   role?: 'student' | 'teacher' | 'admin' | string;
//   firstName?: string;
//   lastName?: string;
//   fatherName?: string;
//   grandFatherName?: string;
//   motherName?: string;
//   idNumber?: string;
//   teacherId?: number;
//   studentId?: number;
//   group?: string;
//   groups?: string[];
//   teacher?: string;
//   birthDate?: string;
//   age?: number;
//   gender?: string;
//   residence?: string;
//   email?: string;
//   phoneNumber?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// export const useUserAuth = () => {
//   const navigate = useNavigate();
//   const [authState, setAuthState] = useState<AuthState>({
//     user: null,
//     token: null,
//     isAuthenticated: false,
//     isLoading: true,
//   });

//   // Clear user data from localStorage
//   const clearUserData = useCallback(() => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     localStorage.removeItem('userId');
    
//     setAuthState({
//       user: null,
//       token: null,
//       isAuthenticated: false,
//       isLoading: false,
//     });
//   }, []);

//   // Load user data from localStorage
//   const loadUserData = useCallback(() => {
//     try {
//       const token = localStorage.getItem('token');
//       const userJson = localStorage.getItem('user');
      
//       if (token && userJson) {
//         const user = JSON.parse(userJson) as User;
//         setAuthState({
//           user,
//           token,
//           isAuthenticated: true,
//           isLoading: false,
//         });
//         return user;
//       } else {
//         setAuthState({
//           user: null,
//           token: null,
//           isAuthenticated: false,
//           isLoading: false,
//         });
//         return null;
//       }
//     } catch (error) {
//       console.error('Error parsing user data:', error);
//       clearUserData();
//       return null;
//     }
//   }, [clearUserData]);

//   // Save user data to localStorage
//   const saveUserData = useCallback((user: User, token: string) => {
//     try {
//       localStorage.setItem('user', JSON.stringify(user));
//       localStorage.setItem('token', token);
//       localStorage.setItem('userId', user._id);
      
//       setAuthState({
//         user,
//         token,
//         isAuthenticated: true,
//         isLoading: false,
//       });
//     } catch (error) {
//       console.error('Error saving user data:', error);
//     }
//   }, []);

//   // Logout function
//   const logout = useCallback(() => {
//     clearUserData();
//     navigate('/login', { replace: true });
//   }, [clearUserData, navigate]);

//   // Update user data
//   const updateUser = useCallback((updatedUser: Partial<User>) => {
//     setAuthState(prevState => {
//       if (!prevState.user) return prevState;
      
//       const newUser = { ...prevState.user, ...updatedUser };
      
//       try {
//         localStorage.setItem('user', JSON.stringify(newUser));
//       } catch (error) {
//         console.error('Error updating user data:', error);
//       }
      
//       return {
//         ...prevState,
//         user: newUser,
//       };
//     });
//   }, []);

//   // Check if user is teacher or admin
//   const isTeacherOrAdmin = useCallback(() => {
//     return authState.user?.role === 'teacher' || authState.user?.role === 'admin';
//   }, [authState.user?.role]);

//   // Get user's full name
//   const getUserFullName = useCallback(() => {
//     const { user } = authState;
//     if (!user) return '';
    
//     if (user.firstName && user.lastName) {
//       return `${user.firstName} ${user.lastName}`;
//     }
    
//     return user.firstName || user.name || '';
//   }, [authState]);

//   // Get user's display role
//   const getUserRole = useCallback(() => {
//     switch (authState.user?.role) {
//       case 'teacher':
//         return 'معلم';
//       case 'admin':
//         return 'مدير';
//       case 'student':
//       default:
//         return 'طالب';
//     }
//   }, [authState.user?.role]);

//   // Load user data on mount
//   useEffect(() => {
//     loadUserData();
//   }, [loadUserData]);

//   return {
//     ...authState,
//     loadUserData,
//     saveUserData,
//     clearUserData,
//     logout,
//     updateUser,
//     isTeacherOrAdmin,
//     getUserFullName,
//     getUserRole,
//   };
// };

// export default useUserAuth;






// Frontend/src/hooks/useUserAuthEnhanced.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFlag } from '../hooks/AuthFlagContext';

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

export const useUserAuthEnhanced = () => {
  const navigate = useNavigate();
  const { markUserOnline, markUserOffline, authFlag } = useAuthFlag();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Clear user data from localStorage and update auth flag
  const clearUserData = useCallback(() => {
    console.log("🧹 Clearing user data from localStorage...");
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Update auth flag to false
    markUserOffline();
  }, [markUserOffline]);

  // Load user data from localStorage
  const loadUserData = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        console.log("📖 Loading user data from localStorage...");
        console.log("👤 User found:", user.firstName || user.name || 'Unknown');
        
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Update auth flag to true if user data exists
        markUserOnline();
        return user;
      } else {
        console.log("📖 No user data found in localStorage");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Update auth flag to false if no user data
        markUserOffline();
        return null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearUserData();
      return null;
    }
  }, [clearUserData, markUserOnline, markUserOffline]);

  // Save user data to localStorage and update auth flag
  const saveUserData = useCallback((user: User, token: string) => {
    try {
      console.log("💾 Saving user data to localStorage...");
      console.log("👤 User:", user.firstName || user.name || 'Unknown');
      console.log("🔐 Token saved");
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Update auth flag to true on successful save
      markUserOnline();
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, [markUserOnline]);

  // Logout function with auth flag update
  const logout = useCallback(() => {
    console.log("🚪 User logout initiated...");
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
        console.log("🔄 User data updated in localStorage");
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
    authFlag, // Expose the auth flag
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

export default useUserAuthEnhanced;