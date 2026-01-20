import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import AyahCard from "./AyahCard";
import QuranAudioPlayer from "./QuranAudioPlayer";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import { Card, LoadingSpinner } from "@/components/UI";
import { Book } from "lucide-react";
import type { AyahsListProps } from "../types/ayahsList";

const AyahsList: React.FC<AyahsListProps> = ({ 
  ayahs, 
  loading, 
  isPlaying = false,
  currentAyahNumber,
  highlightWords = true,
  selectedSurah 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [selectedAyahForTracking, setSelectedAyahForTracking] = useState<{surah: number, ayah: number} | null>(null);
  const itemsPerPage = 10;

  // Calculate pagination using useMemo
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(ayahs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAyahs = ayahs.slice(startIndex, endIndex);

    return {
      currentAyahs,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      startIndex,
      endIndex: Math.min(endIndex, ayahs.length),
    };
  }, [ayahs, currentPage, itemsPerPage]);

  // Reset to page 1 when ayahs change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [ayahs]);

  // Auto-scroll to current ayah when it changes
  const prevAyahRef = useRef<number | undefined>();
  useEffect(() => {
    if (currentAyahNumber && isPlaying && prevAyahRef.current !== currentAyahNumber) {
      prevAyahRef.current = currentAyahNumber;
      
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        const ayahElement = document.getElementById(`ayah-${currentAyahNumber}`);
        if (ayahElement) {
          ayahElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      });
    }
  }, [currentAyahNumber, isPlaying]);

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (ayahs.length === 0) return null;

  return (
    <Card 
      variant="default" 
      padding="lg" 
      className="border border-emerald-100 animate-fadeIn">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-lg p-2.5 sm:p-3">
            <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">نص السورة</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {ayahs.length} آية • صفحة {currentPage} من {paginationData.totalPages}
            </p>
          </div>
        </div>
        
        {/* Word by Word Toggle Button */}
        <button
          onClick={() => setShowWordByWord(!showWordByWord)}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            showWordByWord 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showWordByWord ? '🎯 تتبع كلمة بكلمة مفعّل' : '🎯 تفعيل التتبع الدقيق'}
        </button>
      </div>
      
      {/* Word by Word Audio Player */}
      {showWordByWord && selectedAyahForTracking && (
        <div className="mb-6">
          <QuranAudioPlayer 
            surahNumber={selectedAyahForTracking.surah}
            ayahNumber={selectedAyahForTracking.ayah}
          />
        </div>
      )}

      {loading && ayahs.length === 0 ? (
        <LoadingSpinner 
          size="lg" 
          color="emerald" 
          text="جاري تحميل الآيات..." 
        />
      ) : (
        <>
          {/* Ayahs List */}
          <div className="space-y-3 sm:space-y-4 mb-6">
            {paginationData.currentAyahs.map((ayah) => (
              <div key={ayah.number} className="relative group">
                {showWordByWord && (
                  <button
                    onClick={() => {
                      setSelectedAyahForTracking({ 
                        surah: selectedSurah?.number || 1, 
                        ayah: ayah.numberInSurah 
                      });
                    }}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                    title="تتبع هذه الآية كلمة بكلمة"
                  >
                    🎯
                  </button>
                )}
                <AyahCard 
                  ayah={ayah}
                  isPlaying={isPlaying}
                  isCurrentAyah={ayah.number === currentAyahNumber}
                  highlightWords={highlightWords}
                />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {paginationData.totalPages > 1 && (
            <div className="border-t border-emerald-200 pt-6">
              <ResponsivePagination
                currentPage={currentPage}
                totalPages={paginationData.totalPages}
                totalItems={ayahs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageClick}
                itemName="آية"
                showQuickJump={true}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default AyahsList;
