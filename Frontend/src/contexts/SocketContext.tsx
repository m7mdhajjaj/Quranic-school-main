import React, { createContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface Student {
  _id?: string;
  id?: number;
  studentId: number;
  idNumber: string;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: 'ذكر' | 'انثى';
  residence: string;
  teacher: string;
  group: string;
  phoneNumber?: string;
  email?: string;
}

interface Teacher {
  _id?: string;
  teacherId: number;
  idNumber: string;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: 'ذكر' | 'انثى';
  residence: string;
  phoneNumber?: string;
  email?: string;
  groups: string[];
  isActive: boolean;
}

interface StudentUpdateEvent {
  type: 'created' | 'updated' | 'deleted';
  student: Student;
  studentId?: string;
}

interface TeacherUpdateEvent {
  type: 'created' | 'updated' | 'deleted';
  teacher: Teacher;
  teacherId?: string;
}

interface OnlineUser {
  socketId: string;
  role: string;
  firstName: string;
  isActive: boolean;
  lastSeen?: string;
  loginTime?: string;
}

interface SocketEventData {
  [key: string]: unknown;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Map<string, OnlineUser>;
  
  // Student-specific events
  onStudentUpdate: (callback: (event: StudentUpdateEvent) => void) => void;
  offStudentUpdate: (callback: (event: StudentUpdateEvent) => void) => void;
  
  // Teacher-specific events
  onTeacherUpdate: (callback: (event: TeacherUpdateEvent) => void) => void;
  offTeacherUpdate: (callback: (event: TeacherUpdateEvent) => void) => void;
  
  // General events
  emit: (eventName: string, data: SocketEventData) => void;
  on: (eventName: string, callback: (data: SocketEventData) => void) => void;
  off: (eventName: string, callback: (data: SocketEventData) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export { SocketContext };

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
  
  // Store event callbacks
  const studentUpdateCallbacks = useRef<Set<(event: StudentUpdateEvent) => void>>(new Set());
  const teacherUpdateCallbacks = useRef<Set<(event: TeacherUpdateEvent) => void>>(new Set());

  useEffect(() => {
    if (!user) {
      // Disconnect socket when user logs out
      if (socket) {
        console.log('🔌 Disconnecting socket - user logged out');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Map());
      }
      return;
    }

    // Create socket connection with improved settings
    const socketInstance = io('http://localhost:5005', {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      forceNew: false,
      autoConnect: true,
      upgrade: true,
    });

    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Send login data to server
      socketInstance.emit('login', {
        userId: user._id,
        role: user.role,
        firstName: user.firstName || user.name || 'مستخدم'
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', () => {
      console.warn('🚫 Socket connection failed - Backend server may not be running on port 5005');
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnect attempt #', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('🚫 Reconnection failed:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('🚫 Failed to reconnect after maximum attempts');
    });

    // Student management events
    socketInstance.on('studentCreated', (data: Student) => {
      console.log('👥 Student created:', data);
      const event: StudentUpdateEvent = { type: 'created', student: data };
      studentUpdateCallbacks.current.forEach(callback => callback(event));
    });

    socketInstance.on('studentUpdated', (data: Student) => {
      console.log('✏️ Student updated:', data);
      const event: StudentUpdateEvent = { type: 'updated', student: data };
      studentUpdateCallbacks.current.forEach(callback => callback(event));
    });

    socketInstance.on('studentDeleted', (data: { studentId: string, student?: Student }) => {
      console.log('🗑️ Student deleted:', data);
      const event: StudentUpdateEvent = { 
        type: 'deleted', 
        student: data.student || {} as Student,
        studentId: data.studentId 
      };
      studentUpdateCallbacks.current.forEach(callback => callback(event));
    });

    // Teacher management events
    socketInstance.on('teacherCreated', (data: Teacher) => {
      console.log('👨‍🏫 Teacher created:', data);
      const event: TeacherUpdateEvent = { type: 'created', teacher: data };
      teacherUpdateCallbacks.current.forEach(callback => callback(event));
    });

    socketInstance.on('teacherUpdated', (data: Teacher) => {
      console.log('✏️ Teacher updated:', data);
      const event: TeacherUpdateEvent = { type: 'updated', teacher: data };
      teacherUpdateCallbacks.current.forEach(callback => callback(event));
    });

    socketInstance.on('teacherDeleted', (data: { _id: string }) => {
      console.log('🗑️ Teacher deleted:', data);
      const event: TeacherUpdateEvent = { 
        type: 'deleted', 
        teacher: { _id: data._id } as Teacher,
        teacherId: data._id 
      };
      teacherUpdateCallbacks.current.forEach(callback => callback(event));
    });

    // User status events
    socketInstance.on('userStatusChange', (data: { userId: string; isActive: boolean; lastSeen: string }) => {
      console.log('🔄 User status changed:', data);
      setOnlineUsers(prev => {
        const updated = new Map(prev);
        const existingUser = updated.get(data.userId);
        if (existingUser) {
          updated.set(data.userId, {
            ...existingUser,
            isActive: data.isActive,
            lastSeen: data.lastSeen
          });
        }
        return updated;
      });
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (user) {
        socketInstance.emit('logout', {
          userId: user._id,
          role: user.role
        });
      }
      socketInstance.disconnect();
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Methods for student update events
  const onStudentUpdate = (callback: (event: StudentUpdateEvent) => void) => {
    studentUpdateCallbacks.current.add(callback);
  };

  const offStudentUpdate = (callback: (event: StudentUpdateEvent) => void) => {
    studentUpdateCallbacks.current.delete(callback);
  };

  const onTeacherUpdate = (callback: (event: TeacherUpdateEvent) => void) => {
    teacherUpdateCallbacks.current.add(callback);
  };

  const offTeacherUpdate = (callback: (event: TeacherUpdateEvent) => void) => {
    teacherUpdateCallbacks.current.delete(callback);
  };

  // Generic socket methods
  const emit = (eventName: string, data: SocketEventData) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    } else {
      console.warn('⚠️ Cannot emit event - socket not connected');
    }
  };

  const on = (eventName: string, callback: (data: SocketEventData) => void) => {
    if (socket) {
      socket.on(eventName, callback);
    }
  };

  const off = (eventName: string, callback: (data: SocketEventData) => void) => {
    if (socket) {
      socket.off(eventName, callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    onStudentUpdate,
    offStudentUpdate,
    onTeacherUpdate,
    offTeacherUpdate,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
