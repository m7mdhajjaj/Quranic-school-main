import React, { useState, useEffect, useRef } from "react";
import { QuranAudioSkeleton } from "../components/LoadingSkeleton";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}

const QuranAudio: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState("ar.alafasy");
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // List of available reciters with multiple server options
  const reciters = [
    {
      code: "ar.alafasy",
      name: "مشاري بن راشد العفاسي",
      baseUrls: [
        "https://download.quranicaudio.com/quran/mishary_rashid_alafasy/",
        "https://server8.mp3quran.net/afs/",
      ],
    },
    {
      code: "ar.abdulbasit",
      name: "عبد الباسط عبد الصمد",
      baseUrls: [
        "https://download.quranicaudio.com/quran/abdul_basit_murattal/",
        "https://server8.mp3quran.net/basit/",
      ],
    },
    {
      code: "ar.sudais",
      name: "عبد الرحمن السديس",
      baseUrls: [
        "https://server7.mp3quran.net/sudais/",
        "https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/",
      ],
    },
    {
      code: "ar.ajmi",
      name: "أحمد العجمي",
      baseUrls: [
        "https://server10.mp3quran.net/ajm/",
        "https://download.quranicaudio.com/quran/ahmed_ibn_ali_al-ajamy/",
      ],
    },
    {
      code: "ar.ghamdi",
      name: "سعد الغامدي",
      baseUrls: [
        "https://server7.mp3quran.net/s_gmd/",
        "https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/",
      ],
    },
    {
      code: "ar.muaiqly",
      name: "ماهر المعيقلي",
      baseUrls: [
        "https://server12.mp3quran.net/maher/",
        "https://download.quranicaudio.com/quran/maher_al_meaqli/",
      ],
    },
    {
      code: "ar.dossari",
      name: "ياسر الدوسري",
      baseUrls: [
        "https://server11.mp3quran.net/yasser/",
        "https://download.quranicaudio.com/quran/yasser_ad-dussary/",
      ],
    },
  ];

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    if (selectedSurah) {
      fetchSurahWithAudio(selectedSurah.number);
    }
  }, [reciter, selectedSurah]);

  const fetchSurahs = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.alquran.cloud/v1/surah");
      const data = await response.json();
      setSurahs(data.data);
    } catch (error) {
      console.error("Error fetching surahs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurahWithAudio = async (surahNumber: number) => {
    setLoading(true);
    setAudioError(null);
    try {
      // Fetch Arabic text for display
      const textResponse = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`,
      );
      const textData = await textResponse.json();

      // Get selected reciter info
      const selectedReciter = reciters.find((r) => r.code === reciter);

      if (selectedReciter) {
        // Format surah number with leading zeros (001, 002, etc.)
        const surahNumberFormatted = surahNumber.toString().padStart(3, "0");

        // Try multiple servers until one works
        let workingAudioUrl = null;

        for (const baseUrl of selectedReciter.baseUrls) {
          const testUrl = `${baseUrl}${surahNumberFormatted}.mp3`;
          workingAudioUrl = testUrl;
          console.log(`Setting audio URL: ${testUrl}`);
          break; // Use first URL for now, fallback will happen in playFullSurah if needed
        }

        if (workingAudioUrl) {
          setAudioError(null);
        } else {
          console.error("No audio URL available for this reciter");
          setAudioError(
            `لا يمكن العثور على تسجيل صوتي للقارئ ${selectedReciter.name}`,
          );
        }
      }

      // Set the ayahs for text display (without individual audio)
      const processedAyahs = textData.data.ayahs.map((ayah: any) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text.replace(
          /^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ\s*/,
          "",
        ), // Remove bismillah
      }));

      setAyahs(processedAyahs);
    } catch (error) {
      console.error("Error fetching surah:", error);
      setAyahs([]);
      setAudioError("حدث خطأ في تحميل السورة");
    } finally {
      setLoading(false);
    }
  };

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    fetchSurahWithAudio(surah.number);
  };

  const playFullSurah = async () => {
    if (!selectedSurah || !audioRef.current) return;

    const selectedReciterObj = reciters.find((r) => r.code === reciter);
    if (!selectedReciterObj) return;

    const surahNumberFormatted = selectedSurah.number
      .toString()
      .padStart(3, "0");

    // Try each URL until one works
    for (const baseUrl of selectedReciterObj.baseUrls) {
      const audioUrl = `${baseUrl}${surahNumberFormatted}.mp3`;

      try {
        console.log(`Trying to play: ${audioUrl}`);
        audioRef.current.src = audioUrl;

        await audioRef.current.play();
        setIsPlaying(true);
        setAudioError(null);
        console.log(`Successfully playing: ${audioUrl}`);
        return; // Exit if successful
      } catch (error) {
        console.log(`Failed to play ${audioUrl}:`, error);
        continue; // Try next URL
      }
    }

    // If all URLs fail
    setAudioError(`لا يمكن تشغيل هذه السورة للقارئ ${selectedReciterObj.name}`);
    console.error("All audio URLs failed for this reciter");
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleReciterChange = (newReciter: string) => {
    setReciter(newReciter);
    setIsPlaying(false);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-600 mb-4">
            القرآن الكريم - صوتي
          </h1>
          <p className="text-gray-600 text-lg">
            استمع إلى القرآن الكريم بأصوات القراء المشهورين
          </p>
        </div>

        {/* Reciter Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            اختر القارئ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reciters.map((r) => (
              <button
                key={r.code}
                onClick={() => handleReciterChange(r.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  reciter === r.code
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-300"
                }`}
              >
                <div className="text-lg font-semibold">{r.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Surah Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            اختر السورة
          </h2>
          {loading && surahs.length === 0 ? (
            <QuranAudioSkeleton />
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">جاري التحميل...</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto"
              dir="rtl"
            >
              {surahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => handleSurahSelect(surah)}
                  className={`p-4 rounded-lg border text-right transition-all duration-200 ${
                    selectedSurah?.number === surah.number
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">{surah.name}</div>
                      <div className="text-sm text-gray-500">
                        {surah.numberOfAyahs} آية
                      </div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {surah.number}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Controls */}
        {selectedSurah && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedSurah.name}
              </h3>
              <p className="text-gray-600">
                {selectedSurah.numberOfAyahs} آية -{" "}
                {selectedSurah.revelationType === "Meccan" ? "مكية" : "مدنية"}
              </p>
            </div>

            <div className="flex flex-col justify-center items-center gap-4">
              {audioError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="text-center">{audioError}</p>
                </div>
              )}

              {!isPlaying ? (
                <button
                  onClick={playFullSurah}
                  disabled={!selectedSurah}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  تشغيل السورة كاملة
                </button>
              ) : (
                <button
                  onClick={pauseAudio}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إيقاف التشغيل
                </button>
              )}
            </div>
          </div>
        )}

        {/* Ayahs Display */}
        {ayahs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              نص السورة
            </h3>
            <div className="space-y-4">
              {ayahs.map((ayah) => (
                <div
                  key={ayah.number}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 text-emerald-600 rounded-full min-w-[40px] h-10 flex items-center justify-center font-bold text-sm">
                      {ayah.numberInSurah}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 text-lg leading-relaxed text-right font-arabic">
                        {ayah.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranAudio;
