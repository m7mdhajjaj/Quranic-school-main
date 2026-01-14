import { useRef } from "react";

export function useSound(url: string, volume: number = 0.25) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) {
    audioRef.current = new Audio(url);
    audioRef.current.volume = volume;
  }
  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };
  return play;
}
