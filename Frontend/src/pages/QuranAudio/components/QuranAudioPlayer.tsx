import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { API_URL } from '@/config/config';
import './QuranAudioPlayer.css';

interface Word {
  id: number;
  text: string;
  textUthmani: string;
  start: number;
  end: number;
  position: number;
}

interface VerseData {
  words: Word[];
  duration: number;
  audioUrl: string;
  isEstimated?: boolean;
}

interface QuranAudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  reciter?: string;
}

const QuranAudioPlayer: React.FC<QuranAudioPlayerProps> = ({
  surahNumber,
  ayahNumber,
  reciter = 'Abdul_Basit_Murattal_192kbps'
}) => {
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch verse data with timings
  useEffect(() => {
    const fetchVerseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_URL}/quran/verse-timing/${surahNumber}/${ayahNumber}?reciter=${reciter}`
        );
        
        if (!response.ok) {
          throw new Error('فشل في جلب بيانات الآية');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setVerseData(result.data);
        } else {
          throw new Error('بيانات غير صحيحة');
        }
      } catch (err) {
        console.error('Error fetching verse data:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    fetchVerseData();
  }, [surahNumber, ayahNumber, reciter]);

  // Track current word based on audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !verseData) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      
      const index = verseData.words.findIndex(
        (word) => currentTime >= word.start && currentTime < word.end
      );
      
      if (index !== -1 && index !== currentWordIndex) {
        setCurrentWordIndex(index);
        
        // Auto-scroll to current word
        const wordElement = document.getElementById(`word-${index}`);
        if (wordElement) {
          wordElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [verseData, currentWordIndex]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Handle word click - jump to that word
  const handleWordClick = (index: number) => {
    if (audioRef.current && verseData) {
      audioRef.current.currentTime = verseData.words[index].start;
      audioRef.current.play();
    }
  };

  // Reset to beginning
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentWordIndex(-1);
      audioRef.current.pause();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!verseData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-600">لا توجد بيانات للآية</p>
      </div>
    );
  }

  return (
    <div className="quran-audio-player bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={verseData.audioUrl}
        preload="auto"
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={handleReset}
          className="p-3 rounded-full bg-white hover:bg-gray-100 shadow-md transition-all"
          title="إعادة"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={togglePlayPause}
          className="p-4 rounded-full bg-green-600 hover:bg-green-700 shadow-lg transition-all transform hover:scale-105"
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Quran Text with Highlighting */}
      <div 
        className="quran-text-container bg-white rounded-lg p-6 shadow-inner overflow-x-auto"
        dir="rtl"
      >
        <div className="flex flex-wrap justify-center items-center gap-3">
          {verseData.words.map((word, index) => (
            <span
              key={word.id}
              id={`word-${index}`}
              onClick={() => handleWordClick(index)}
              className={`
                quran-word px-4 py-3 rounded-lg text-4xl cursor-pointer select-none 
                transition-all duration-300 transform
                ${currentWordIndex === index
                  ? 'bg-yellow-400 text-black font-bold scale-125 shadow-2xl -translate-y-2'
                  : 'bg-white hover:bg-gray-100 hover:scale-105 shadow-md'
                }
              `}
            >
              {word.textUthmani || word.text}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-lg">
          {currentWordIndex >= 0 
            ? `الكلمة ${currentWordIndex + 1} من ${verseData.words.length}` 
            : 'اضغط تشغيل لبدء التتبع'}
        </p>
        {verseData.isEstimated && (
          <p className="text-sm text-gray-500 mt-2">
            ⚠️ التوقيتات تقديرية
          </p>
        )}
      </div>
    </div>
  );
};

export default QuranAudioPlayer;
