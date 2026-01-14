import { useRef } from "react";

export function useSound(url: string, volume: number = 0.25) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  if (!audioRef.current) {
    try {
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';
    } catch {
      // Silent fail - audio not supported
    }
  }
  
  const play = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Silent fail - autoplay policy or user hasn't interacted yet
        });
      } catch {
        // Silent fail
      }
    }
  };
  
  return play;
}
