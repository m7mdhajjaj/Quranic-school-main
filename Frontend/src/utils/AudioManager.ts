// ============================================================================
// Audio Manager - إدارة ملفات الصوت مع caching متقدم
// ============================================================================

class AudioManager {
  private static instance: AudioManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private lastPlayTime: Map<string, number> = new Map();
  private readonly DEBOUNCE_TIME = 2000; // 2 seconds

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * تحميل ملف صوتي مسبقاً (preload)
   */
  preload(soundFile: string): void {
    if (!this.audioCache.has(soundFile)) {
      const audio = new Audio(`/src/assets/sounds/${soundFile}`);
      audio.preload = 'auto';
      audio.volume = 0.5;
      this.audioCache.set(soundFile, audio);
    }
  }

  /**
   * تشغيل ملف صوتي مع debouncing
   */
  play(soundFile: string, volume: number = 0.5): void {
    try {
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(soundFile) || 0;

      // منع تشغيل نفس الصوت أكثر من مرة خلال DEBOUNCE_TIME
      if (now - lastPlay < this.DEBOUNCE_TIME) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔇 Sound blocked: ${soundFile} - played ${now - lastPlay}ms ago`);
        }
        return;
      }

      this.lastPlayTime.set(soundFile, now);

      // الحصول على الصوت من cache أو إنشاء جديد
      let audio = this.audioCache.get(soundFile);
      if (!audio) {
        audio = new Audio(`/src/assets/sounds/${soundFile}`);
        audio.volume = volume;
        audio.preload = 'auto';
        this.audioCache.set(soundFile, audio);
      } else {
        audio.volume = volume;
      }

      // إعادة التشغيل من البداية
      audio.currentTime = 0;
      audio.play().catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to play sound: ${soundFile}`, error);
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error in AudioManager.play:`, error);
      }
    }
  }

  /**
   * تنظيف الذاكرة - إزالة الصوتيات غير المستخدمة
   */
  clearCache(): void {
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
    this.lastPlayTime.clear();
  }

  /**
   * إزالة صوت محدد من cache
   */
  remove(soundFile: string): void {
    const audio = this.audioCache.get(soundFile);
    if (audio) {
      audio.pause();
      audio.src = '';
      this.audioCache.delete(soundFile);
      this.lastPlayTime.delete(soundFile);
    }
  }
}

// تصدير instance واحد فقط
export const audioManager = AudioManager.getInstance();

// تحميل الأصوات الشائعة مسبقاً
audioManager.preload('successful.mp3');
audioManager.preload('Adhan.mp3');
