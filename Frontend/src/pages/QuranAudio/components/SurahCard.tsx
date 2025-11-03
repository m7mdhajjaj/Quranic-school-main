import React, { memo, useCallback } from "react";
import type { Surah } from "../../../Api/quranAudioApi";
import { Card, Badge } from "../../../components/UI";
import { Button } from "../../../components/UI";
import { Book, MapPin } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (surah: Surah) => void;
  onPlayPause: (e: React.MouseEvent) => void;
}

const SurahCard: React.FC<SurahCardProps> = memo(({
  surah,
  isSelected,
  isPlaying,
  onSelect,
  onPlayPause,
}) => {
  // Memoize click handler to prevent re-creating on each render
  const handleClick = useCallback(() => {
    onSelect(surah);
  }, [onSelect, surah]);

  const handlePlayPauseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayPause(e);
  }, [onPlayPause]);

  return (
    <Card
      onClick={handleClick}
      hover={!isSelected}
      padding="md"
      className={`relative text-right overflow-hidden ${
        isSelected
          ? "border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl scale-105"
          : "border-2 border-gray-200 hover:border-emerald-300"
      }`}>
      {/* خلفية متحركة */}
      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isSelected ? "opacity-100" : ""
      }`}></div>

      {/* المحتوى */}
      <div className="relative z-10">
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
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
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

        {/* شريط التقدم (إذا كانت مختارة) */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>سورة محددة</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* زر التشغيل باستخدام Button component */}
      {isSelected && (
        <Button
          onClick={handlePlayPauseClick}
          variant={isPlaying ? "danger" : "primary"}
          size="sm"
          className="absolute left-3 bottom-3 !rounded-full !p-2.5 sm:!p-3 shadow-lg z-20"
          title={isPlaying ? "إيقاف التشغيل" : "تشغيل السورة"}>
          {isPlaying ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="5" width="2" height="10" rx="1"/>
              <rect x="12" y="5" width="2" height="10" rx="1"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 4.1c-.5-.3-1.1.1-1.1.7v10.4c0 .6.6 1 1.1.7l8.5-5.2c.4-.3.4-1 0-1.3L6.3 4.1z"/>
            </svg>
          )}
        </Button>
      )}
    </Card>
  );
});

SurahCard.displayName = 'SurahCard';

export default SurahCard;
