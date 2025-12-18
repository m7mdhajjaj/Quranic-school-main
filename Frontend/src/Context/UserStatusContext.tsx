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
  const handleUserStatus = useCallback((data: { 
    userId: string; 
    isActive: boolean; 
    timestamp: string;
  }) => {
    console.log('🟢 [Presence] Status update received:', data);
    
    setUserStatuses(prev => {
      const updated = {
        ...prev,
        [data.userId]: {
          isActive: data.isActive,
          timestamp: data.timestamp,
        },
      };
      console.log('📊 [Presence] Updated userStatuses:', updated);
      return updated;
    });
  }, []);

  /**
   * ✅ الاستماع لتحديثات Socket
   * Event: 'user-status' - يتم بثه من الباك إند عند connect/disconnect
   * 
   * ⚠️ Important: نضيف listener حتى لو Socket غير متصل لضمان استقبال جميع events
   */
  useEffect(() => {
    console.log('👂 [Presence] Setting up listener for user-status events');
    console.log('🔌 [Presence] Socket connected:', socketManager.isConnected());
    
    // الاشتراك في event واحد فقط: user-status
    socketManager.on('user-status', handleUserStatus);

    return () => {
      console.log('🧹 [Presence] Cleaning up listener');
      socketManager.off('user-status', handleUserStatus);
    };
  }, [handleUserStatus]);

  /**
   * ✅ تحديث حالة المستخدم الحالي عند الاتصال
   */
  useEffect(() => {
    if (user?._id && socketManager.isConnected()) {
      // تعيين المستخدم الحالي كـ Online محلياً (تحديث فوري)
      setUserStatuses(prev => ({
        ...prev,
        [user._id]: {
          isActive: true,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  }, [user?._id]);

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