// دوال الأصوات التي يمكن استخدامها في أي مكان (خارج React components)
export const soundPlayer = {
  playAdd: () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  },

  playUpdate: () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  },

  playDelete: () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  },

  playError: () => {
    try {
      const audio = new Audio('/sounds/error.wav');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  },

  playSuccess: () => {
    return new Promise<number>((resolve) => {
      try {
        const audio = new Audio('/sounds/successful.mp3');
        audio.volume = 0.7;
        
        // حساب مدة الصوت عند التحميل
        audio.addEventListener('loadedmetadata', () => {
          const duration = Math.ceil(audio.duration * 1000); // تحويل إلى ميلي ثانية
          resolve(duration);
        });
        
        // في حالة عدم القدرة على تحميل البيانات، استخدم قيمة افتراضية
        audio.addEventListener('error', () => {
          resolve(800); // القيمة الافتراضية
        });
        
        audio.play().catch((err) => {
          console.log('Sound error:', err);
          resolve(800); // القيمة الافتراضية
        });
      } catch (error) {
        console.log('Sound init error:', error);
        resolve(800); // القيمة الافتراضية
      }
    });
  },

  playNotification: () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.7;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  },

  playLogout: () => {
    return new Promise<number>((resolve) => {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        
        // حساب مدة الصوت عند التحميل
        audio.addEventListener('loadedmetadata', () => {
          const duration = Math.ceil(audio.duration * 1000); // تحويل إلى ميلي ثانية
          resolve(duration);
        });
        
        // في حالة عدم القدرة على تحميل البيانات، استخدم قيمة افتراضية
        audio.addEventListener('error', () => {
          resolve(800); // القيمة الافتراضية
        });
        
        audio.play().catch((err) => {
          console.log('Sound error:', err);
          resolve(800); // القيمة الافتراضية
        });
      } catch (error) {
        console.log('Sound init error:', error);
        resolve(800); // القيمة الافتراضية
      }
    });
  },

  playLogin: () => {
    try {
      const audio = new Audio('/sounds/Login.mp3');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  },
};

// Hook للاستخدام في React components
export const useSounds = () => {
  return soundPlayer;
};
