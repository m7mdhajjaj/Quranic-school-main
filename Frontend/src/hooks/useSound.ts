import { useRef } from "react";

export function useSound(url: string, volume: number = 0.25) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  if (!audioRef.current) {
    try {
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';
    } catch (error) {
      console.warn(`Failed to load audio: ${url}`, error);
    }
  }
  
  const play = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.warn(`Failed to play audio: ${url}`, error);
        });
      } catch (error) {
        console.warn(`Error playing audio: ${url}`, error);
      }
    }
  };
  
  return play;
}
