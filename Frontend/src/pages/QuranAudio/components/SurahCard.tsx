import React, { memo, useCallback } from "react";
import { Card, Badge } from "@/components/UI";
import { Book, MapPin } from "lucide-react";
import type { SurahCardProps } from "../types/surahCard";

const SurahCard: React.FC<SurahCardProps> = memo(({
  surah,
  isSelected,
  isPlaying,
  onSelect,
  onPlayPause,
}) => {
  // Memoize click handler to prevent re-creating on each render
  const handleCardClick = useCallback(() => {
    if (!isPlaying) {
      onSelect(surah);
    }
  }, [onSelect, surah, isPlaying]);

  const handlePlayPauseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayPause(e);
  }, [onPlayPause]);

  return (
    <Card
      onClick={handleCardClick}
      hover={!isSelected}
      padding="md"
      className={`relative group text-right overflow-hidden h-full flex flex-col ${
        isSelected
          ? "border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl scale-105"
          : "border-2 border-gray-200 hover:border-emerald-300"
      }`}>
      {/* خلفية متحركة */}
      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isSelected ? "opacity-100" : ""
      }`}></div>

      {/* Play Button Overlay (shows on hover or when playing) */}
      {(isSelected || isPlaying) && (
        <div 
          onClick={handlePlayPauseClick}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center z-30 cursor-pointer ${
            isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
          <div className={`bg-white rounded-full p-4 transition-transform duration-300 pointer-events-none ${
            isPlaying ? "scale-100" : "scale-0 group-hover:scale-100"
          }`}>
            {isPlaying ? (
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="5" width="2" height="10" rx="1"/>
                <rect x="12" y="5" width="2" height="10" rx="1"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 4.1c-.5-.3-1.1.1-1.1.7v10.4c0 .6.6 1 1.1.7l8.5-5.2c.4-.3.4-1 0-1.3L6.3 4.1z"/>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* المحتوى */}
      <div className="relative z-10 pointer-events-none">
        {/* الرأس */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-1">
              {surah.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {surah.englishName}
            </p>
          </div>
          
          {/* رقم السورة باستخدام Badge */}
          <Badge 
            variant={isSelected ? "primary" : "success"} 
            size="lg"
            className="flex-shrink-0 ml-2">
            {surah.number}
          </Badge>
        </div>

        {/* المعلومات */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Book size={16} className="text-emerald-600" />
            <span>{surah.numberOfAyahs} آية</span>
          </div>
          
          <span className="text-gray-400">•</span>
          
          <div className="flex items-center gap-1">
            <MapPin size={16} className="text-teal-600" />
            <Badge 
              variant={surah.revelationType === "Meccan" ? "warning" : "info"}
              size="sm">
              {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
});

SurahCard.displayName = 'SurahCard';

export default SurahCard;
