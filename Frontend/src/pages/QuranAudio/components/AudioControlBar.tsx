import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";

interface AudioControlBarProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  onPlayPause: () => void;
  surahName?: string;
  reciterName?: string;
}

const AudioControlBar: React.FC<AudioControlBarProps> = ({
  audioRef,
  isPlaying,
  onPlayPause,
  surahName = "",
  reciterName = "",
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time to MM:SS
  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update current time from audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);

    // Set initial duration if already loaded
    if (audio.duration) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [audioRef, isDragging]);

  // Skip forward 5 seconds
  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
    }
  }, [audioRef]);

  // Skip backward 5 seconds
  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
    }
  }, [audioRef]);

  // Reset to beginning
  const resetAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  }, [audioRef]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  }, [audioRef, isMuted]);

  // Handle volume change
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
        if (newVolume === 0) {
          setIsMuted(true);
          audioRef.current.muted = true;
        } else if (isMuted) {
          setIsMuted(false);
          audioRef.current.muted = false;
        }
      }
    },
    [audioRef, isMuted],
  );

  // Handle progress bar click/drag
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const progressBar = progressRef.current;
      const audio = audioRef.current;
      if (!progressBar || !audio || !duration) return;

      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [audioRef, duration],
  );

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Don't show if no audio source
  if (!duration && !isPlaying) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 border-t border-emerald-500/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative h-2 bg-slate-700 rounded-full cursor-pointer mb-3 group"
          onClick={handleProgressClick}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}>
          {/* Progress Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
          {/* Draggable Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Time Display - Left */}
          <div className="flex items-center gap-2 text-white/80 text-sm font-mono min-w-[100px]">
            <span className="text-emerald-400">{formatTime(currentTime)}</span>
            <span className="text-white/40">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls - Center */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Reset Button */}
            <button
              onClick={resetAudio}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              title="العودة للبداية">
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Skip Backward 5s */}
            <button
              onClick={skipBackward}
              className="p-2 sm:p-3 text-white hover:bg-white/10 rounded-full transition-all flex items-center gap-1"
              title="ترجيع 5 ثواني">
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs hidden sm:inline">5</span>
            </button>

            {/* Play/Pause */}
            <button
              onClick={onPlayPause}
              className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full shadow-lg transition-all transform hover:scale-105"
              title={isPlaying ? "إيقاف" : "تشغيل"}>
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 mr-0.5" />
              )}
            </button>

            {/* Skip Forward 5s */}
            <button
              onClick={skipForward}
              className="p-2 sm:p-3 text-white hover:bg-white/10 rounded-full transition-all flex items-center gap-1"
              title="تقديم 5 ثواني">
              <span className="text-xs hidden sm:inline">5</span>
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Volume & Info - Right */}
          <div className="flex items-center gap-3 min-w-[100px] justify-end">
            {/* Surah Name (hidden on mobile) */}
            {surahName && (
              <div className="hidden md:block text-right">
                <p className="text-white text-sm font-bold truncate max-w-[150px]">
                  {surahName}
                </p>
                {reciterName && (
                  <p className="text-white/60 text-xs truncate max-w-[150px]">
                    {reciterName}
                  </p>
                )}
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-white/70 hover:text-white transition-colors"
                title={isMuted ? "تفعيل الصوت" : "كتم الصوت"}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-emerald-400
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:bg-emerald-400
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AudioControlBar);
