import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/config';

interface PrayerNotification {
  type: 'prayer_time';
  title: string;
  message: string;
  prayerName: string;
  prayerTime: string;
  emoji: string;
  timestamp: Date;
}

interface PrayerContextType {
  currentPrayer: PrayerNotification | null;
  showPrayerAlert: boolean;
  dismissPrayerAlert: () => void;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within PrayerProvider');
  }
  return context;
};

interface PrayerProviderProps {
  children: ReactNode;
}

export const PrayerProvider = ({ children }: PrayerProviderProps) => {
  const [currentPrayer, setCurrentPrayer] = useState<PrayerNotification | null>(null);
  const [showPrayerAlert, setShowPrayerAlert] = useState(false);

  useEffect(() => {
    // إنشاء اتصال Socket.IO
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('🕌 Prayer notifications connected');
    });

    // استقبال إشعارات الصلاة
    newSocket.on('prayerNotification', (data: PrayerNotification) => {
      console.log('🕌 Prayer notification received:', data);
      setCurrentPrayer(data);
      setShowPrayerAlert(true);

      // تشغيل صوت الأذان (اختياري)
      playAdhanSound();

      // إخفاء التنبيه تلقائياً بعد دقيقة
      setTimeout(() => {
        setShowPrayerAlert(false);
      }, 60000);
    });

    newSocket.on('disconnect', () => {
      console.log('🕌 Prayer notifications disconnected');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const playAdhanSound = () => {
    // يمكن إضافة صوت الأذان هنا
    try {
      const audio = new Audio('/adhan-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Could not play adhan sound:', error);
    }
  };

  const dismissPrayerAlert = () => {
    setShowPrayerAlert(false);
  };

  return (
    <PrayerContext.Provider value={{ currentPrayer, showPrayerAlert, dismissPrayerAlert }}>
      {children}
    </PrayerContext.Provider>
  );
};
