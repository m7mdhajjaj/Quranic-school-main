import React, { memo, useMemo } from "react";
import { Card, Badge } from "@/components/UI";
import type { AyahCardProps } from "../types/ayahCard";

const AyahCard: React.FC<AyahCardProps> = memo(
  ({
    ayah,
    fontSize = "lg",
    isPlaying = false,
    isCurrentAyah = false,
    highlightWords = false,
  }) => {
    const fontSizeClass = {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      
    }[fontSize];

    // تقسيم النص إلى كلمات
    const words = useMemo(() => {
      return ayah.text.split(/\s+/).filter((word) => word.trim());
    }, [ayah.text]);

    return (
      <Card
        variant="default"
        padding="md"
        hover={true}
        className={`border-2 transition-all duration-300 ${
          isCurrentAyah && isPlaying
            ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl scale-[1.02]"
            : "border-gray-200 hover:border-emerald-300"
        }`}
        id={`ayah-${ayah.number}`}>
        <div className="flex items-start gap-3 sm:gap-4">
          {/* رقم الآية */}
          <Badge
            variant={isCurrentAyah && isPlaying ? "success" : "primary"}
            size="lg"
            className={`flex-shrink-0 !w-9 !h-9 sm:!w-10 sm:!h-10 !rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
              isCurrentAyah && isPlaying
                ? "scale-110 ring-2 ring-emerald-400 ring-offset-2"
                : "group-hover:scale-110"
            }`}>
            {ayah.numberInSurah}
          </Badge>

          {/* نص الآية */}
          <div
            className={`leading-loose sm:leading-relaxed font-amiri ${fontSizeClass} flex-1`}>
            {highlightWords && isCurrentAyah && isPlaying ? (
              <p className="inline">
                {words.map((word, index) => (
                  <span
                    key={`${ayah.number}-word-${index}`}
                    className="inline-block mx-1 transition-all duration-300 "
                    data-word-index={index}>
                    {word}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-gray-800">{ayah.text}</p>
            )}
          </div>
        </div>
      </Card>
    );
  },
);

AyahCard.displayName = "AyahCard";

export default AyahCard;
