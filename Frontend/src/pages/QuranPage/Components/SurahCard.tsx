import { memo, useCallback, startTransition } from "react";
import { Book, MapPin, Play } from "lucide-react";
import type { SurahCardProps } from "../types/surahCard";

const SurahCard = memo(({ surah, onClick }: SurahCardProps) => {
  const handleClick = useCallback(() => {
    startTransition(() => {
      onClick();
    });
  }, [onClick]);

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50"
    >
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      {/* Play Button Overlay (shows on hover) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
          <Play size={32} className="text-emerald-600 fill-emerald-600" />
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 pointer-events-none">
        {/* Surah Number Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center border-2 border-white/50">
            <span className="text-white font-bold text-lg">{surah.number}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-16">
          <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {surah.name}
          </h3>
          <p className="text-white/90 text-base font-medium mb-4">{surah.englishName}</p>

          {/* Details */}
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Book size={16} />
              <span className="text-sm font-medium">{surah.numberOfAyahs} آية</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <MapPin size={16} />
              <span className="text-sm font-medium">
                {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
    </div>
  );
});

SurahCard.displayName = 'SurahCard';

export default SurahCard;
