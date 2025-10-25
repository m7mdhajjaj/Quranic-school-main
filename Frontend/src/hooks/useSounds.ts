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
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.7;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
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
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
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
