// Socket Event Types - تعريف جميع أنواع الأحداث
export interface SocketEvents {
  // Student Events
  studentCreated: Student;
  studentUpdated: Student;
  studentDeleted: { studentId: string; student?: Student };
  
  // Teacher Events  
  teacherCreated: Teacher;
  teacherUpdated: Teacher;
  teacherDeleted: { teacherId: string; teacher?: Teacher };
  
  // Dashboard Events - جديد
  dashboardUpdate: DashboardUpdatePayload;
  dashboardStatsUpdate: any;
  dashboardGroupsUpdate: any;
  joinDashboard: void;
  leaveDashboard: void;
  requestDashboardUpdate: void;
  
  // User Status Events
  userStatusChange: {
    userId: string;
    isActive: boolean;
    lastSeen: string;
  };
  
  // Chat Events
  receiveMessage: Message;
  messageSent: Message;
  messageDelivered: { messageId: string; recipientOnline: boolean };
  messageRead: { messageId: string; readAt: string };
  userTyping: { sender: string; isTyping: boolean };
  
  // General Events
  connect: void;
  disconnect: string;
  connect_error: Error;
  error: SocketError;
}

// Dashboard Types
export interface DashboardUpdatePayload {
  type: 'stats' | 'groups' | 'full';
  data?: any;
  timestamp: string;
  action?: 'create' | 'update' | 'delete';
}

export interface SocketUser {
  userId: string;
  role: 'student' | 'teacher' | 'admin';
  firstName: string;
}

export interface SocketError {
  message: string;
  code?: string;
  timestamp: string;
}

export interface SocketConnection {
  isConnected: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
  error?: SocketError;
}

export type SocketCallback<T = any> = (data: T) => void;

export interface Student {
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

export interface Teacher {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  // Add other teacher properties as needed
}

export interface Message {
  _id: string;
  sender: string;
  recipient?: string;
  text: string;
  createdAt: string;
  delivered?: boolean;
  read?: boolean;
  // Add other message properties as needed
}

export interface OnlineUser {
  socketId: string;
  role: string;
  firstName: string;
  isActive: boolean;
  lastSeen?: string;
  loginTime?: string;
}

export type SocketEventCallback<T = unknown> = (data: T) => void;