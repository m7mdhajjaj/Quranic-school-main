export const useSounds = () => {
  const playAdd = () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  };

  const playUpdate = () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  };

  const playDelete = () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  };

  const playError = () => {
    try {
      const audio = new Audio('/sounds/error.wav');
      audio.volume = 0.6;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  };

  const playSuccess = () => {
    try {
      const audio = new Audio('/sounds/successful.mp3');
      audio.volume = 0.7;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  };

  const playNotification = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.7;
      audio.play().catch((err) => console.log('Sound error:', err));
    } catch (error) {
      console.log('Sound init error:', error);
    }
  };

  return {
    playAdd,
    playUpdate,
    playDelete,
    playError,
    playSuccess,
    playNotification,
  };
};
