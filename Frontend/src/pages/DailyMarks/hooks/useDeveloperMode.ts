import { useState, useEffect } from "react";

/**
 * Custom hook for developer mode
 * Activates by pressing 'd' key three times within 2 seconds
 * Plays sound on toggle
 */
export const useDeveloperMode = () => {
  const [developerMode, setDeveloperMode] = useState<boolean>(false);
  const [dKeyPressCount, setDKeyPressCount] = useState<number>(0);
  const [lastDKeyPress, setLastDKeyPress] = useState<number>(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        const now = Date.now();
        
        // Reset count if more than 2 seconds have passed
        if (now - lastDKeyPress > 2000) {
          setDKeyPressCount(1);
        } else {
          setDKeyPressCount(prev => prev + 1);
        }
        
        setLastDKeyPress(now);
        
        // Activate developer mode on 3rd press within 2 seconds
        if (dKeyPressCount + 1 >= 3 && now - lastDKeyPress <= 2000) {
          setDeveloperMode(prev => !prev);
          setDKeyPressCount(0);
          
          // Play activation/deactivation sound
          const audio = new Audio(developerMode ? '/sounds/error.wav' : '/sounds/successful.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
          
          console.log(developerMode ? '🔧 Developer Mode: OFF' : '🔧 Developer Mode: ON');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dKeyPressCount, lastDKeyPress, developerMode]);

  return { developerMode };
};
