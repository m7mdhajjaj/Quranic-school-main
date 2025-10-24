import { memo } from "react";
import { Button, Card, RangeSlider } from "../../components/shared";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { SurahData } from "./types/quran.types";

interface ReaderControlsProps {
  selectedSurah: SurahData | null;
  currentPage: number;
  totalPages: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onBackToList: () => void;
}

const ReaderControls = memo(({
  selectedSurah,
  currentPage,
  totalPages,
  fontSize,
  onFontSizeChange,
  onBackToList,
}: ReaderControlsProps) => {
  return (
    <Card 
      padding="lg" 
      variant="default"
      className="mb-8 animate-slideUp shadow-lg bg-gradient-to-r from-white to-emerald-50 border-2 border-emerald-100"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        {/* Back Button */}
        <Button
          onClick={onBackToList}
          variant="primary"
          size="lg"
          leftIcon={<ArrowLeft size={20} />}
          className="w-full lg:w-auto shadow-md hover:shadow-xl transition-shadow"
        >
          العودة إلى السور
        </Button>

        {/* Surah Info */}
        {selectedSurah && (
          <div className="text-center bg-white px-6 py-3 rounded-xl shadow-sm border-2 border-emerald-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BookOpen size={20} className="text-emerald-600" />
              <div className="text-xl font-bold text-emerald-700">
                {selectedSurah.name}
              </div>
            </div>
            <div className="text-sm text-emerald-600 font-medium">
              الصفحة {currentPage} من {totalPages}
            </div>
          </div>
        )}

        {/* Font Size Control */}
        <div className="w-full lg:w-64 bg-white p-4 rounded-xl shadow-sm border-2 border-emerald-200">
          <RangeSlider
            min={16}
            max={32}
            value={fontSize}
            onChange={onFontSizeChange}
            label="حجم الخط"
            showValue={true}
            color="emerald"
          />
        </div>
      </div>
    </Card>
  );
});

ReaderControls.displayName = 'ReaderControls';

export default ReaderControls;
