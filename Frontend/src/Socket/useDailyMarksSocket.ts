import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة العلامات اليومية (DailyMarks) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث العلامات لتحديث البيانات تلقائياً
 */
export const useDailyMarksSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) return;

    console.log('🔌 Initializing DailyMarks Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 DailyMarks socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinDailyMarksRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة العلامات
    const joinDailyMarksRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📝 Joining marks room for DailyMarks...');
        
        socketManager.emit('joinMarks', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinDailyMarksRoom();
    }

    return () => {
      console.log('🧹 Cleaning up DailyMarks Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveMarks', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث العلامات
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up DailyMarks event listeners...');

    // Debounce timer
    let updateTimer: NodeJS.Timeout | null = null;

    const debouncedUpdate = () => {
      if (updateTimer) clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        setLastUpdate(new Date());
      }, 300); // تأخير 300ms
    };

    const handleMarkCreated = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('➕ Mark created');
      }
      debouncedUpdate();
    };

    const handleMarkUpdated = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✏️ Mark updated');
      }
      debouncedUpdate();
    };

    const handleMarkDeleted = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Mark deleted');
      }
      debouncedUpdate();
    };

    // الاشتراك في الأحداث
    socketManager.on('markCreated', handleMarkCreated);
    socketManager.on('markUpdated', handleMarkUpdated);
    socketManager.on('markDeleted', handleMarkDeleted);

    // التنظيف
    return () => {
      if (updateTimer) clearTimeout(updateTimer);
      console.log('🧹 Removing DailyMarks event listeners...');
      socketManager.off('markCreated', handleMarkCreated);
      socketManager.off('markUpdated', handleMarkUpdated);
      socketManager.off('markDeleted', handleMarkDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};

// ============================================================================
// Socket Effects Hook
// ============================================================================

interface UseDailyMarksSocketEffectsProps {
  socketLastUpdate: unknown;
  lastNotification: { type: string } | null;
  currentUser: { role: string; _id: string } | null;
  selectedStudentId: string | null;
  refetchMarks: (studentId?: string) => Promise<void>;
  refetchSections: () => Promise<void>;
}

/**
 * Hook لإدارة التأثيرات الجانبية للـ Socket في صفحة العلامات اليومية
 * يدير التحديثات المباشرة وجلب البيانات عند حدوث تغييرات
 */
export const useDailyMarksSocketEffects = ({
  socketLastUpdate,
  lastNotification,
  currentUser,
  selectedStudentId,
  refetchMarks,
  refetchSections,
}: UseDailyMarksSocketEffectsProps) => {
  
  // Initial marks fetch when student is selected
  useEffect(() => {
    if (!currentUser) return;
    refetchMarks(selectedStudentId || undefined);
  }, [selectedStudentId, currentUser, refetchMarks]);

  // Refetch marks on socket updates
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;
    refetchMarks(selectedStudentId || undefined);
  }, [socketLastUpdate, currentUser, selectedStudentId, refetchMarks]);

  // Listen to notifications and refetch sections when assignment notification received
  useEffect(() => {
    if (!lastNotification || !currentUser) return;
    
    // Only refetch for assignment notifications (sections related)
    if (lastNotification.type === "assignment") {
      console.log("📚 Section notification received, refetching sections...");
      refetchSections();
    }
  }, [lastNotification, currentUser, refetchSections]);
};
