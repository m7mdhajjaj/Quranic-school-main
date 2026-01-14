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

// ✅ استخدام Cloudinary URLs - مستقرة ولا تحتاج cache busting
const SOUNDS = {
  ADHAN: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428195/quranic-school/sounds/Adhan.mp3',
  CLICK: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428196/quranic-school/sounds/click-409642.mp3',
  ERROR: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428197/quranic-school/sounds/error.wav',
  LOGIN: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428199/quranic-school/sounds/Login.mp3',
  NOTIFICATION: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428200/quranic-school/sounds/notification.mp3',
  REMOVE: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428201/quranic-school/sounds/remove.mp3',
  SUCCESSFUL: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428202/quranic-school/sounds/successful.mp3',
};

export const soundPlayer = {
  // عمليات CRUD
  playAdd: () => playSound(SOUNDS.SUCCESSFUL, 0.6),
  playUpdate: () => playSound(SOUNDS.SUCCESSFUL, 0.6),
  playDelete: () => playSound(SOUNDS.REMOVE, 0.5),
  
  // حالات النجاح والخطأ
  playError: () => playSound(SOUNDS.ERROR, 0.6),
  playSuccess: () => playSoundWithDuration(SOUNDS.SUCCESSFUL, 0.7),
  
  // إشعارات
  playNotification: () => playSound(SOUNDS.NOTIFICATION, 0.7),
  playAdhan: () => playSound(SOUNDS.ADHAN, 0.8),
  playClick: () => playSound(SOUNDS.CLICK, 0.4),
  
  // تسجيل الدخول/الخروج
  playLogin: () => playSound(SOUNDS.LOGIN, 0.6),
  playLogout: () => playSoundWithDuration(SOUNDS.LOGIN, 0.5),
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
  soundPath = SOUNDS.NOTIFICATION,
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
