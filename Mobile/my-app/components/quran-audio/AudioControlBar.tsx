import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { Audio } from "expo-av";

interface AudioControlBarProps {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  surahName?: string;
  reciterName?: string;
}

const AudioControlBar: React.FC<AudioControlBarProps> = ({
  sound,
  isPlaying,
  onPlayPause,
  surahName = "",
  reciterName = "",
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Format time to MM:SS
  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Update playback status
  useEffect(() => {
    if (!sound) return;

    const updateStatus = async () => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
        }
      } catch (error) {
        console.error("Error getting playback status:", error);
      }
    };

    // Update every 500ms
    const interval = setInterval(updateStatus, 500);

    // Initial update
    updateStatus();

    return () => clearInterval(interval);
  }, [sound]);

  // Skip forward 5 seconds
  const skipForward = useCallback(async () => {
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.min(
            (status.positionMillis || 0) + 5000,
            status.durationMillis || 0,
          );
          await sound.setPositionAsync(newPosition);
        }
      } catch (error) {
        console.error("Error skipping forward:", error);
      }
    }
  }, [sound]);

  // Skip backward 5 seconds
  const skipBackward = useCallback(async () => {
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max((status.positionMillis || 0) - 5000, 0);
          await sound.setPositionAsync(newPosition);
        }
      } catch (error) {
        console.error("Error skipping backward:", error);
      }
    }
  }, [sound]);

  // Reset to beginning
  const resetAudio = useCallback(async () => {
    if (sound) {
      try {
        await sound.setPositionAsync(0);
        setCurrentTime(0);
      } catch (error) {
        console.error("Error resetting audio:", error);
      }
    }
  }, [sound]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (sound) {
      try {
        await sound.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }
  }, [sound, isMuted]);

  // Handle progress bar press (seeking)
  const handleProgressPress = useCallback(
    async (event: { nativeEvent: { locationX: number } }) => {
      if (sound && duration > 0 && progressBarWidth > 0) {
        try {
          const touchX = event.nativeEvent.locationX;
          const percentage = Math.max(
            0,
            Math.min(1, touchX / progressBarWidth),
          );
          const newPosition = percentage * duration;
          await sound.setPositionAsync(newPosition);
          setCurrentTime(newPosition);
        } catch (error) {
          console.error("Error seeking:", error);
        }
      }
    },
    [sound, duration, progressBarWidth],
  );

  // Handle progress bar layout to get width
  const handleProgressLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  // Don't show if no sound or no duration
  if (!sound || duration === 0) {
    return null;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <LinearGradient
      colors={["#0f172a", "#064e3b", "#0f172a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}>
      {/* Progress Bar */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleProgressPress}
        style={styles.progressContainer}
        onLayout={handleProgressLayout}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
          <View
            style={[styles.progressThumb, { left: `${progressPercentage}%` }]}
          />
        </View>
      </TouchableOpacity>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeSeparator}>/</Text>
        <Text style={styles.durationText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls Row */}
      <View style={styles.controlsRow}>
        {/* Left: Surah Info */}
        <View style={styles.infoContainer}>
          {surahName ? (
            <>
              <Text style={styles.surahName} numberOfLines={1}>
                {surahName}
              </Text>
              {reciterName && (
                <Text style={styles.reciterName} numberOfLines={1}>
                  {reciterName}
                </Text>
              )}
            </>
          ) : null}
        </View>

        {/* Center: Main Controls */}
        <View style={styles.mainControls}>
          {/* Reset */}
          <TouchableOpacity
            onPress={resetAudio}
            style={styles.secondaryButton}
            activeOpacity={0.7}>
            <RotateCcw size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Skip Backward 5s */}
          <TouchableOpacity
            onPress={skipBackward}
            style={styles.skipButton}
            activeOpacity={0.7}>
            <SkipBack size={24} color="#ffffff" />
            <Text style={styles.skipText}>5</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity onPress={onPlayPause} activeOpacity={0.7}>
            <LinearGradient
              colors={["#10b981", "#14b8a6"]}
              style={styles.playButton}>
              {isPlaying ? (
                <Pause size={28} color="#ffffff" />
              ) : (
                <Play size={28} color="#ffffff" style={{ marginLeft: 4 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Forward 5s */}
          <TouchableOpacity
            onPress={skipForward}
            style={styles.skipButton}
            activeOpacity={0.7}>
            <Text style={styles.skipText}>5</Text>
            <SkipForward size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Mute */}
          <TouchableOpacity
            onPress={toggleMute}
            style={styles.secondaryButton}
            activeOpacity={0.7}>
            {isMuted ? (
              <VolumeX size={20} color="#94a3b8" />
            ) : (
              <Volume2 size={20} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>

        {/* Right: Empty space for balance */}
        <View style={styles.infoContainer} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(52, 211, 153, 0.3)",
  },
  progressContainer: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#475569",
    borderRadius: 3,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34d399",
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    marginLeft: -8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  timeText: {
    color: "#34d399",
    fontSize: 14,
    fontFamily: "monospace",
  },
  timeSeparator: {
    color: "#64748b",
    fontSize: 14,
    marginHorizontal: 6,
  },
  durationText: {
    color: "#94a3b8",
    fontSize: 14,
    fontFamily: "monospace",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  surahName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    maxWidth: 100,
  },
  reciterName: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
    maxWidth: 100,
  },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    padding: 8,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 2,
  },
  skipText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AudioControlBar;
