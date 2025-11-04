import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Sound Utility Functions - دوال مركزية للأصوات
// ============================================================================

/**
 * تشغيل صوت مباشرة - دالة مركزية
 * @param soundPath - مسار ملف الصوت
 * @param volume - مستوى الصوت (0-1)
 */
const playSound = (soundPath: string, volume: number = 0.6): void => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch((err) => console.log('Sound error:', err));
  } catch (error) {
    console.log('Sound init error:', error);
  }
};

/**
 * تشغيل صوت مع Promise - يُرجع مدة الصوت
 * @param soundPath - مسار ملف الصوت
 * @param volume - مستوى الصوت (0-1)
 * @returns Promise<number> - مدة الصوت بالميلي ثانية
 */
const playSoundWithDuration = (soundPath: string, volume: number = 0.6): Promise<number> => {
  return new Promise<number>((resolve) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = Math.max(0, Math.min(1, volume));

      // حساب مدة الصوت عند التحميل
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.ceil(audio.duration * 1000);
        resolve(duration);
      });

      // في حالة الخطأ، استخدم قيمة افتراضية
      audio.addEventListener('error', () => {
        resolve(800);
      });

      audio.play().catch((err) => {
        console.log('Sound error:', err);
        resolve(800);
      });
    } catch (error) {
      console.log('Sound init error:', error);
      resolve(800);
    }
  });
};

// ============================================================================
// Sound Player - دوال الأصوات الجاهزة
// ============================================================================

export const soundPlayer = {
  // عمليات CRUD
  playAdd: () => playSound('/sounds/successful.mp3', 0.6),
  playUpdate: () => playSound('/sounds/successful.mp3', 0.6),
  playDelete: () => playSound('/sounds/successful.mp3', 0.5),
  
  // حالات النجاح والخطأ
  playError: () => playSound('/sounds/error.wav', 0.6),
  playSuccess: () => playSoundWithDuration('/sounds/successful.mp3', 0.7),
  
  // إشعارات
  playNotification: () => playSound('/sounds/notification.mp3', 0.7),
  
  // تسجيل الدخول/الخروج
  playLogin: () => playSound('/sounds/Login.mp3', 0.6),
  playLogout: () => playSoundWithDuration('/sounds/Login.mp3', 0.5),
};

// ============================================================================
// Advanced Sound Hook - React Hook متقدم مع إدارة الصوت
// ============================================================================

interface UseSoundOptions {
  soundPath?: string;
  volume?: number;
  preload?: boolean;
}

/**
 * Hook متقدم لإدارة الأصوات مع ميزات إضافية
 * @param options - خيارات الصوت (soundPath, volume, preload)
 * @returns { playSound, stopSound, setVolume }
 */
export const useSound = ({
  soundPath = '/sounds/notification.mp3',
  volume = 0.6,
  preload = true,
}: UseSoundOptions = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // إنشاء الصوت وتحميله مسبقاً
  useEffect(() => {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume));
    if (preload) {
      audio.preload = 'auto';
    }
    audioRef.current = audio;

    // معالجة الخطأ
    audio.addEventListener('error', () => {
      console.warn(`⚠️ لم يتم العثور على ملف ${soundPath}`);
      audioRef.current = null;
    });

    // Cleanup عند unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundPath, volume, preload]);

  // تشغيل الصوت
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log('Could not play sound:', e);
      });
    }
  }, []);

  // إيقاف الصوت
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // تغيير مستوى الصوت ديناميكياً
  const changeVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  return {
    playSound: play,
    stopSound: stop,
    setVolume: changeVolume,
  };
};

// Hook بسيط للاستخدام السريع - يُرجع soundPlayer
export const useSounds = () => {
  return soundPlayer;
};
