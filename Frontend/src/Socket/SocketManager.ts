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
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
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
      console.log('✅ Socket connected successfully:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.notifyConnectionStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnecting = false;
      this.notifyConnectionStatus(false);
      
      if (reason === 'io server disconnect') {
        // الخادم قطع الاتصال، إعادة الاتصال يدوياً
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      this.isConnecting = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🔴 Max reconnection attempts reached');
        this.stopHeartbeat();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔴 Socket reconnection failed');
      this.stopHeartbeat();
    });

    // استقبال heartbeat من الخادم
    this.socket.on('pong', (data) => {
      console.log('💓 Heartbeat received from server:', data);
    });
  }

  /**
   * بدء إرسال Heartbeat كل 30 ثانية
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // إيقاف أي heartbeat سابق

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log('💓 Sending heartbeat...');
        this.socket.emit('ping', {
          timestamp: Date.now(),
          clientId: this.socket.id,
        });
      } else {
        console.warn('⚠️ Socket not connected, skipping heartbeat');
      }
    }, this.heartbeatIntervalTime);

    console.log(`💓 Heartbeat started (every ${this.heartbeatIntervalTime / 1000}s)`);
  }

  /**
   * إيقاف Heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💔 Heartbeat stopped');
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
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  /**
   * قطع الاتصال
   */
  disconnect(): void {
    console.log('🔌 Disconnecting socket...');
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
    } else {
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
