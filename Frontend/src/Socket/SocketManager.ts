import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/config';

/**
 * Socket Manager - إدارة مركزية لاتصالات Socket
 * يوفر heartbeat تلقائي كل 30 ثانية
 */
class SocketManager {
  private socket: Socket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatIntervalTime = 30000; // 30 ثانية
  private isConnecting = false;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  /**
   * إنشاء اتصال Socket جديد
   */
  connect(userId?: string, userRole?: string): Socket {
    // If socket exists, update auth and ensure connection
    if (this.socket) {
      if (userId && this.socket.auth) {
        // Update auth data for reconnection
        (this.socket.auth as any).userId = userId;
        (this.socket.auth as any).userRole = userRole;
      }
      
      if (this.socket.connected) {
        console.log('✅ Socket already connected');
        return this.socket;
      }
    }

    if (this.isConnecting) {
      console.log('⏳ Connection in progress...');
      return this.socket!;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to Socket.IO server...', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      autoConnect: true,
      auth: {
        userId,
        userRole,
      },
    });

    this.setupEventHandlers();
    this.startHeartbeat();

    return this.socket;
  }

  /**
   * إعداد معالجات الأحداث الأساسية
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Socket connected:', this.socket?.id);
      }
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.notifyConnectionStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Socket disconnected:', reason);
      }
      this.isConnecting = false;
      this.notifyConnectionStatus(false);
      
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Socket connection error:', error.message);
      }
      this.reconnectAttempts++;
      this.isConnecting = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.stopHeartbeat();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      }
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Reconnection attempt #${attemptNumber}`);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Reconnection error:', error.message);
      }
    });

    this.socket.on('reconnect_failed', () => {
      if (process.env.NODE_ENV === 'development') {
        console.error('🔴 Socket reconnection failed');
      }
      this.stopHeartbeat();
    });

    // استقبال heartbeat من الخادم
    this.socket.on('pong', () => {
      // Heartbeat received - no logging needed in production
      if (process.env.NODE_ENV === 'development') {
        console.log('💓 Heartbeat OK');
      }
    });
  }

  /**
   * بدء إرسال Heartbeat كل 30 ثانية
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping', {
          timestamp: Date.now(),
          clientId: this.socket.id,
        });
      }
    }, this.heartbeatIntervalTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`💓 Heartbeat started (every ${this.heartbeatIntervalTime / 1000}s)`);
    }
  }

  /**
   * إيقاف Heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * الاشتراك في تحديثات حالة الاتصال
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  /**
   * إشعار جميع المشتركين بتغيير حالة الاتصال
   */
  private notifyConnectionStatus(connected: boolean): void {
    // استخدام requestAnimationFrame لتحسين الأداء
    requestAnimationFrame(() => {
      this.connectionCallbacks.forEach(callback => {
        try {
          callback(connected);
        } catch (error) {
          console.error('Error in connection callback:', error);
        }
      });
    });
  }

  /**
   * قطع الاتصال
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.socket?.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.notifyConnectionStatus(false);
  }

  /**
   * الحصول على Socket الحالي
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * التحقق من حالة الاتصال
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * الحصول على معرف Socket
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * إرسال حدث مخصص
   */
  emit(eventName: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Cannot emit '${eventName}': Socket not connected`);
    }
  }

  /**
   * الاستماع لحدث مخصص
   */
  on(eventName: string, callback: (...args: unknown[]) => void): void {
    this.socket?.on(eventName, callback);
  }

  /**
   * إزالة مستمع حدث
   */
  off(eventName: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      this.socket?.off(eventName, callback);
    } else {
      this.socket?.off(eventName);
    }
  }
}

// تصدير نسخة واحدة (Singleton)
export const socketManager = new SocketManager();
export default socketManager;
