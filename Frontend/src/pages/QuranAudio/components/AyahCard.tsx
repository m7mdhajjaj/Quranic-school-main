import React, { memo } from "react";
import type { Ayah } from "../../../Api/quranAudioApi";
import { Card, Badge } from "../../../components/shared";

interface AyahCardProps {
  ayah: Ayah;
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
}

const AyahCard: React.FC<AyahCardProps> = memo(({ 
  ayah, 
  fontSize = "lg"
}) => {
  const fontSizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  }[fontSize];

  return (
    <Card 
      variant="default" 
      padding="md"
      hover={true}
      className="border-2 border-gray-200 hover:border-emerald-300">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* رقم الآية */}
        <Badge 
          variant="primary" 
          size="lg"
          className="flex-shrink-0 !w-9 !h-9 sm:!w-10 sm:!h-10 !rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          {ayah.numberInSurah}
        </Badge>
        
        {/* نص الآية */}
        <p className={`leading-loose sm:leading-relaxed text-gray-800 font-amiri ${fontSizeClass} flex-1`}>
          {ayah.text}
        </p>
      </div>
    </Card>
  );
});

AyahCard.displayName = 'AyahCard';

export default AyahCard;
