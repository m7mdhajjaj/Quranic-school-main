import { memo, useCallback, startTransition } from "react";
import { Card, Badge } from "@/components/UI";
import { Book, MapPin } from "lucide-react";
import type { SurahCardProps } from "@/types/surahCard";

const SurahCard = memo(({ surah, onClick }: SurahCardProps) => {
  const handleClick = useCallback(() => {
    startTransition(() => {
      onClick();
    });
  }, [onClick]);

  return (
    <Card
      onClick={handleClick}
      padding="lg"
      variant="gradient"
      className="cursor-pointer !bg-gradient-to-br !from-white !to-emerald-50 !border-emerald-100 hover:!border-emerald-300 !transition-colors !duration-150"
    >
      {/* Header with Surah Number Badge */}
      <div className="flex justify-between items-start gap-3 mb-4 pointer-events-none">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-emerald-700 mb-1">
            {surah.name}
          </h3>
          <p className="text-emerald-600 text-sm font-medium">{surah.englishName}</p>
        </div>
        <Badge variant="primary" size="lg">
          {surah.number}
        </Badge>
      </div>

      {/* Details Section */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-emerald-100 pointer-events-none">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Book size={16} className="text-emerald-600" />
          <span className="text-sm font-medium">{surah.numberOfAyahs} آية</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin size={16} className="text-teal-600" />
          <span className="text-sm font-medium">
            {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
          </span>
        </div>
      </div>
    </Card>
  );
});

SurahCard.displayName = 'SurahCard';

export default SurahCard;
