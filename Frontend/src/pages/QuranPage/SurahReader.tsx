import { memo, useMemo } from "react";
import { Card } from "@/components/UI";
import AyahCard from "../QuranAudio/components/AyahCard";
import type { SurahData, Ayah } from "./types/quran.types";

interface SurahReaderProps {
  surah: SurahData;
  ayahs: Ayah[];
  fontSize: number;
  currentPage: number;
}

const SurahReader = memo(({
  surah,
  ayahs,
  fontSize,
  currentPage,
}: SurahReaderProps) => {
  // ✅ عرض البسملة في الصفحة الأولى فقط، عدا التوبة (9) والفاتحة (1)
  const showBasmala = useMemo(
    () => surah.number !== 1 && surah.number !== 9 && currentPage === 1,
    [surah.number, currentPage]
  );

  const fontSizeClass = useMemo((): "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" => {
    if (fontSize <= 14) return "sm";
    if (fontSize <= 16) return "base";
    if (fontSize <= 18) return "lg";
    if (fontSize <= 22) return "xl";
    if (fontSize <= 26) return "2xl";
    return "3xl";
  }, [fontSize]);

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
