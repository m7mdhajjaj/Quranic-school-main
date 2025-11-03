import React, { memo } from "react";
import type { Surah, Reciter } from "../../../Api/quranAudioApi";
import { Card, Button, Alert, Badge } from "../../../components/UI";
import { Book, Play, Pause, Mic } from "lucide-react";

interface AudioControlsProps {
  selectedSurah: Surah;
  isPlaying: boolean;
  loading: boolean;
  audioError: string | null;
  reciter: string;
  reciters: Reciter[];
  onPlay: () => void;
  onPause: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = memo(({
  selectedSurah,
  isPlaying,
  loading,
  audioError,
  reciter,
  reciters,
  onPlay,
  onPause,
}) => {
  const reciterName = reciters.find((r) => r.code === reciter)?.name || "غير معروف";

  return (
    <Card 
      variant="gradient" 
      padding="lg" 
      className="shadow-2xl border-2 border-emerald-200 backdrop-blur-sm animate-slideUp">
      {/* رأس البطاقة */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* أيقونة السورة */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
            <Book className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          
          {/* معلومات السورة */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {selectedSurah.name}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {selectedSurah.englishName} • {selectedSurah.revelationType === "Meccan" ? "مكية" : "مدنية"}
            </p>
          </div>
        </div>

        {/* عدد الآيات */}
        <Badge 
          variant="success" 
          size="lg"
          className="bg-gradient-to-br from-emerald-100 to-teal-100 px-4 py-2 border border-emerald-200">
          <div className="text-xs text-emerald-700 font-semibold">عدد الآيات</div>
          <div className="text-2xl font-bold text-emerald-800 text-center">{selectedSurah.numberOfAyahs}</div>
        </Badge>
      </div>

      {/* رسالة الخطأ */}
      {audioError && (
        <Alert 
          variant="danger"
          className="mb-4">
          {audioError}
        </Alert>
      )}

      {/* أزرار التحكم */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
        {!isPlaying ? (
          <Button
            onClick={onPlay}
            disabled={loading}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            leftIcon={<Play className="w-6 h-6 sm:w-7 sm:h-7" />}
            className="!py-4">
            تشغيل السورة كاملة
          </Button>
        ) : (
          <Button
            onClick={onPause}
            variant="danger"
            size="lg"
            fullWidth
            leftIcon={<Pause className="w-6 h-6 sm:w-7 sm:h-7" />}
            className="!py-4">
            إيقاف التشغيل
          </Button>
        )}
      </div>

      {/* معلومات القارئ وحالة التشغيل */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
        {/* معلومات القارئ */}
        <div className="flex items-center gap-3">
          <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          <div>
            <div className="text-xs text-gray-600">القارئ</div>
            <div className="text-sm sm:text-base font-bold text-emerald-700">{reciterName}</div>
          </div>
        </div>

        {/* حالة التشغيل */}
        {isPlaying && (
          <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce animate-delay-100"></div>
              <div className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce animate-delay-200"></div>
            </div>
            <span className="text-sm sm:text-base font-semibold">جاري التشغيل...</span>
          </div>
        )}
      </div>
    </Card>
  );
});

AudioControls.displayName = 'AudioControls';

export default AudioControls;
