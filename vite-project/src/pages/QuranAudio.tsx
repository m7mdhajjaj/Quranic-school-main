import React, { useState, useEffect, useRef } from "react";

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
  audio: string;
}

const QuranAudio: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true); // Auto play enabled by default
  const [reciter, setReciter] = useState("ar.alafasy"); // Default reciter

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // List of available reciters with multiple API fallbacks
  const reciters = [
    {
      code: "ar.alafasy",
      name: "مشاري بن راشد العفاسي",
      backup: "mishary_rashid_alafasy",
    },
    {
      code: "ar.husary",
      name: "محمود خليل الحصري",
      backup: "mahmoud_khalil_al-hussary",
    },
    {
      code: "ar.minshawi",
      name: "محمد صديق المنشاوي",
      backup: "muhammad_siddeeq_al-minshawee",
    },
    {
      code: "ar.abdulbasitmurattal",
      name: "عبد الباسط عبد الصمد (مرتل)",
      backup: "abdul_basit_murattal",
    },
  ];

  useEffect(() => {
    fetchSurahs();
  }, []);

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
    try {
      // Fetch Arabic text
      const textResponse = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      );
      const textData = await textResponse.json();

      // Get selected reciter info
      const selectedReciter = reciters.find((r) => r.code === reciter);
      let audioData = null;

      // Try primary API first
      try {
        const audioResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`
        );
        audioData = await audioResponse.json();

        // Check if audio data is valid
        if (
          !audioData.data ||
          !audioData.data.ayahs ||
          audioData.data.ayahs.length === 0
        ) {
          throw new Error("Invalid audio data from primary API");
        }
      } catch (primaryError) {
        console.log("Primary API failed, trying backup...", primaryError);

        // Try backup API with different reciter codes
        try {
          let backupCodes = [
            selectedReciter?.backup,
            reciter.replace("ar.", ""),
            reciter,
          ].filter(Boolean);

          for (const backupCode of backupCodes) {
            try {
              const backupResponse = await fetch(
                `https://api.alquran.cloud/v1/surah/${surahNumber}/${backupCode}`
              );
              const backupData = await backupResponse.json();

              if (
                backupData.data &&
                backupData.data.ayahs &&
                backupData.data.ayahs.length > 0
              ) {
                audioData = backupData;
                console.log(`Success with backup code: ${backupCode}`);
                break;
              }
            } catch (backupError) {
              console.log(`Backup code ${backupCode} failed:`, backupError);
              continue;
            }
          }

          // If all APIs fail, create fallback audio URLs
          if (!audioData || !audioData.data) {
            console.log("All APIs failed, creating fallback URLs...");

            let fallbackReciter =
              selectedReciter?.backup || "mishary_rashid_alafasy";

            // Try different fallback URL patterns
            const fallbackAyahs = textData.data.ayahs.map((ayah: any) => ({
              ...ayah,
              audio: `https://cdn.islamic.network/quran/audio/128/${fallbackReciter}/${ayah.number}.mp3`,
            }));

            audioData = { data: { ayahs: fallbackAyahs } };
          }
        } catch (backupError) {
          console.error("Backup API also failed:", backupError);
          // Create empty audio as last resort
          audioData = {
            data: {
              ayahs: textData.data.ayahs.map((ayah: any) => ({
                ...ayah,
                audio: "",
              })),
            },
          };
        }
      }

      // Combine text and audio
      const combinedAyahs = textData.data.ayahs.map(
        (ayah: any, index: number) => ({
          ...ayah,
          audio: audioData.data.ayahs[index]?.audio || "",
        })
      );

      setAyahs(combinedAyahs);
    } catch (error) {
      console.error("Error fetching surah with audio:", error);
      // Set empty ayahs as fallback
      setAyahs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setCurrentAyah(null);
    setIsPlaying(false);
    fetchSurahWithAudio(surah.number);
  };

  const playAyah = (ayah: Ayah) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setCurrentAyah(ayah.numberInSurah);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = ayah.audio;
      audioRef.current.play().catch(console.error);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);

    if (autoPlay && currentAyah && ayahs.length > currentAyah) {
      // Play next ayah automatically
      const nextAyah = ayahs.find(
        (ayah) => ayah.numberInSurah === currentAyah + 1
      );
      if (nextAyah) {
        setTimeout(() => playAyah(nextAyah), 500);
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current && currentAyah) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">
            القرآن الكريم الصوتي
          </h1>
          <p className="text-gray-600">
            استمع إلى القرآن الكريم بأصوات أشهر القراء
          </p>
        </div>

        {/* Reciter Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            اختر القارئ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reciters.map((rec) => (
              <button
                key={rec.code}
                onClick={() => setReciter(rec.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  reciter === rec.code
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}>
                <div className="text-lg font-medium">{rec.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        {selectedSurah && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedSurah.name}
              </h3>

              {currentAyah && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">الآية {currentAyah}</span>
                  {isPlaying ? (
                    <button
                      onClick={pauseAudio}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={resumeAudio}
                      className="bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">تشغيل تلقائي</span>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Surah List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                قائمة السور
              </h2>
              {loading && !selectedSurah ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">جاري التحميل...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {surahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => handleSurahSelect(surah)}
                      className={`w-full text-right p-3 rounded-lg border transition-all duration-300 ${
                        selectedSurah?.number === surah.number
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{surah.name}</div>
                          <div className="text-sm text-gray-600">
                            {surah.numberOfAyahs} آية
                          </div>
                        </div>
                        <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-bold">
                          {surah.number}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ayahs */}
          <div className="lg:col-span-2">
            {!selectedSurah ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl text-gray-300 mb-4">🎵</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  اختر سورة للاستماع
                </h3>
                <p className="text-gray-600">
                  اختر سورة من القائمة للبدء في الاستماع إلى القرآن الكريم
                </p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل السورة...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ayahs.map((ayah) => (
                  <div
                    key={ayah.numberInSurah}
                    className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all duration-300 ${
                      currentAyah === ayah.numberInSurah
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200"
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <button
                        onClick={() => playAyah(ayah)}
                        disabled={!ayah.audio}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          ayah.audio
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        تشغيل
                      </button>

                      <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                        {ayah.numberInSurah}
                      </div>
                    </div>

                    <p className="text-xl leading-loose text-gray-800 font-arabic">
                      {ayah.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranAudio;
