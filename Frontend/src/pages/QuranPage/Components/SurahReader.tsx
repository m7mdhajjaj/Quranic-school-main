import { memo, useMemo } from "react";
import { Card } from "@/components/UI";
import AyahCard from "../../QuranAudio/components/AyahCard";
import { getFontSizeClass } from "../utils/fontSizeMapper";
import { shouldShowBasmala } from "../utils/basmalaHelper";
import type { SurahReaderProps } from "@/types/surahReader";

const SurahReader = memo(({
  surah,
  ayahs,
  fontSize,
  currentPage,
}: SurahReaderProps) => {
  const showBasmala = useMemo(
    () => shouldShowBasmala(surah.number, currentPage),
    [surah.number, currentPage]
  );

  const fontSizeClass = useMemo(
    () => getFontSizeClass(fontSize),
    [fontSize]
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ✨ Enhanced Basmala */}
      {showBasmala && (
        <Card 
          padding="lg" 
          variant="default"
          className="text-center bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-lg"
        >
          <div className="text-emerald-700 text-3xl md:text-4xl font-bold animate-pulse">
            ﷽
          </div>
          <div className="text-emerald-600 text-lg mt-2">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>
        </Card>
      )}

      {/* ✨ استخدام AyahCard من QuranAudio */}
      <div className="space-y-4">
        {ayahs.map((ayah) => (
          <AyahCard 
            key={ayah.number} 
            ayah={ayah} 
            fontSize={fontSizeClass}
          />
        ))}
      </div>
    </div>
  );
});

SurahReader.displayName = 'SurahReader';

export default SurahReader;
