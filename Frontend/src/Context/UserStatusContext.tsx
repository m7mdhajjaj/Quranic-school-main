/**
 * 🟢 User Status Context - Real-time Presence System
 * ==================================================
 * نظام مركزي لإدارة حالة المستخدمين (Online/Offline) في الوقت الفعلي
 * يعتمد 100% على Socket.io - لا يعتمد على API calls
 * 
 * @module UserStatusContext
 * @description المصدر الوحيد للحقيقة لحالة المستخدمين على الفرونت إند
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { socketManager } from '../Socket/SocketManager';

// تعريف الواجهات والأنواع
export interface UserStatusState {
  isActive: boolean;
  timestamp?: string;
}

export interface UserStatusContextType {
  userStatus: UserStatusState;
  userStatuses: Record<string, UserStatusState>;
  getUserStatus: (userId?: string) => UserStatusState;
  isUserOnline: (userId: string) => boolean;
  getOnlineUsers: () => string[];
  joinRoom: (roomType: 'teachers' | 'students' | 'admin') => void;
  leaveRoom: (roomType: 'teachers' | 'students' | 'admin') => void;
}

// إنشاء السياق
/* eslint-disable react-refresh/only-export-components */
export const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  /**
   * خريطة حالات المستخدمين - المصدر الوحيد للحقيقة
   * يتم تحديثها فقط من Socket.io events
   */
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatusState>>({});

  // الحالة الافتراضية
  const defaultStatus: UserStatusState = React.useMemo(() => ({
    isActive: false,
  }), []);

  /**
   * ✅ معالج تحديث حالة المستخدم من Socket (user-status event)
   * هذا هو المصدر الوحيد لتحديث الحالات
   */
  const handleUserStatus = useCallback((data: any) => {
    if (!data?.userId) return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 [Presence] Status update received:', data);
    }
    
    setUserStatuses(prev => ({
      ...prev,
      [data.userId]: {
        isActive: data.isActive ?? false,
        timestamp: data.timestamp,
      },
    }));
  }, []);

  /**
   * ✅ معالج استقبال القائمة الأولية للمستخدمين المتصلين
   */
  const handleInitialOnlineUsers = useCallback((data: any) => {
    if (!data || typeof data !== 'object') return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 [Presence] Initial online users received:', Object.keys(data).length);
    }
    setUserStatuses(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  /**
   * ✅ الاستماع لتحديثات Socket
   */
  useEffect(() => {
    if (!user?._id) return;
    
    const userId = user._id;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('👂 [Presence] Setting up listeners for presence events');
    }
    
    const handleConnect = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 [Presence] Socket connected, setting self as online');
      }
      setUserStatuses(prev => ({
        ...prev,
        [userId]: {
          isActive: true,
          timestamp: new Date().toISOString()
        }
      }));
    };

    // الاشتراك في Events
    socketManager.on('user-status', handleUserStatus);
    socketManager.on('initial-online-users', handleInitialOnlineUsers);
    socketManager.on('connect', handleConnect);

    // إذا كان متصلاً بالفعل
    if (socketManager.isConnected()) {
      handleConnect();
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 [Presence] Cleaning up listeners');
      }
      socketManager.off('user-status', handleUserStatus);
      socketManager.off('initial-online-users', handleInitialOnlineUsers);
      socketManager.off('connect', handleConnect);
    };
  }, [handleUserStatus, handleInitialOnlineUsers, user?._id]);

  /**
   * الحصول على حالة مستخدم معين
   */
  const getUserStatus = useCallback((userId?: string): UserStatusState => {
    const targetUserId = userId || user?._id;
    if (!targetUserId) return defaultStatus;

    return userStatuses[targetUserId] || defaultStatus;
  }, [user?._id, userStatuses, defaultStatus]);

  /**
   * التحقق من حالة مستخدم معين (دالة مساعدة)
   */
  const isUserOnline = useCallback((userId: string): boolean => {
    return userStatuses[userId]?.isActive || false;
  }, [userStatuses]);

  /**
   * الحصول على قائمة المستخدمين Online
   */
  const getOnlineUsers = useCallback((): string[] => {
    return Object.entries(userStatuses)
      .filter(([_, status]) => status.isActive)
      .map(([userId, _]) => userId);
  }, [userStatuses]);

  /**
   * الانضمام لغرفة حسب نوع المستخدم
   */
  const joinRoom = useCallback((roomType: 'teachers' | 'students' | 'admin') => {
    if (!socketManager.isConnected()) return;
    
    const eventMap = {
      teachers: 'joinTeachers',
      students: 'joinStudents',
      admin: 'joinAdmin',
    };
    
    socketManager.emit(eventMap[roomType], {
      timestamp: Date.now(),
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Joined ${roomType} room`);
    }
  }, []);

  /**
   * مغادرة غرفة حسب نوع المستخدم
   */
  const leaveRoom = useCallback((roomType: 'teachers' | 'students' | 'admin') => {
    if (!socketManager.isConnected()) return;
    
    const eventMap = {
      teachers: 'leaveTeachers',
      students: 'leaveStudents',
      admin: 'leaveAdmin',
    };
    
    socketManager.emit(eventMap[roomType], {
      timestamp: Date.now(),
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`👋 Left ${roomType} room`);
    }
  }, []);

  // حالة المستخدم الحالي
  const userStatus = getUserStatus();

  const contextValue: UserStatusContextType = {
    userStatus,
    userStatuses,
    getUserStatus,
    isUserOnline,
    getOnlineUsers,
    joinRoom,
    leaveRoom,
  };

  return (
    <UserStatusContext.Provider value={contextValue}>
      {children}
    </UserStatusContext.Provider>
  );
};

export default UserStatusProvider;