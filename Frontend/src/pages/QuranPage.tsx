import { useState, useEffect, useCallback } from "react";
import {
  QuranPageSkeleton,
  QuranReadingSkeleton,
} from "../components/Loading/LoadingSkeleton";
import {
  getAllSurahs,
  getSurah,
  getReadingSettings,
  saveReadingSettings,
  saveReadingBookmark,
  type Surah as ApiSurah,
  type SurahData as ApiSurahData,
  type Ayah as ApiAyah,
} from "../Api/quranAudioApi";

// ✅ دالة إزالة التشكيل وتطبيع النص العربي
const normalizeArabic = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "") // إزالة كل الحركات
    .replace(/[إأآٱا]/g, "ا") // توحيد الألف
    .replace(/ى/g, "ي") // ألف مقصورة إلى ياء
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ۀ/g, "ه")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

// ✅ دالة البحث الذكية بدون تشكيل
const filterSurahs = (surahs: ApiSurah[], term: string): ApiSurah[] => {
  if (!term.trim()) return surahs;

  const normalizedTerm = normalizeArabic(term);
  return surahs.filter((surah) => {
    const normalizedName = normalizeArabic(surah.name);
    const normalizedEnglish = normalizeArabic(surah.englishName || "");
    const normalizedNumber = surah.number.toString();
    return (
      normalizedName.includes(normalizedTerm) ||
      normalizedEnglish.includes(normalizedTerm) ||
      normalizedNumber === normalizedTerm
    );
  });
};

type Surah = ApiSurah;
interface Ayah extends ApiAyah {
  juz?: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}
interface SurahData extends ApiSurahData {
  englishNameTranslation?: string;
  ayahs: Ayah[];
}

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filtered, setFiltered] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(false);
  const [surahsLoading, setSurahsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSurahList, setShowSurahList] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const ayahsPerPage = 10;

  const initializeComponent = useCallback(async () => {
    try {
      setSurahsLoading(true);
      const settings = await getReadingSettings();
      setFontSize(settings.fontSize);
      const surahsData = await getAllSurahs();
      setSurahs(surahsData);
      setFiltered(surahsData);
    } catch (error) {
      setError("خطأ في تحميل قائمة السور");
      console.error("Error initializing component:", error);
    } finally {
      setSurahsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  // 🔹 بحث لحظي مع تحسين الأداء (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      const result = filterSurahs(surahs, searchTerm);
      const sorted = sortOrder === "asc" ? result : [...result].reverse();
      setFiltered(sorted);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, surahs, sortOrder]);

  const fetchSurah = useCallback(async (surahNumber: number) => {
    try {
      setLoading(true);
      setError("");
      const surahData = await getSurah(surahNumber);
      setSelectedSurah(surahData as SurahData);
      setCurrentPage(1);
      setShowSurahList(false);
      await saveReadingBookmark(surahNumber, 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطأ في تحميل السورة");
      console.error("Error fetching surah:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentPageAyahs = () => {
    if (!selectedSurah) return [];
    const start = (currentPage - 1) * ayahsPerPage;
    return selectedSurah.ayahs.slice(start, start + ayahsPerPage);
  };

  const totalPages = selectedSurah
    ? Math.ceil((selectedSurah.numberOfAyahs || selectedSurah.ayahs?.length || 0) / ayahsPerPage)
    : 0;

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const backToSurahList = () => {
    setSelectedSurah(null);
    setShowSurahList(true);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const updateSettings = useCallback(async () => {
    try {
      await saveReadingSettings({
        fontSize,
        theme: "light",
        ayahsPerPage: 10,
      });
    } catch (error) {
      console.log("Could not save reading settings:", error);
    }
  }, [fontSize]);

  useEffect(() => {
    if (surahs.length > 0) updateSettings();
  }, [fontSize, updateSettings, surahs.length]);

  if (surahsLoading) return <QuranPageSkeleton />;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-emerald-100"
      dir="rtl">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm py-4 mb-6 transition">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-1">
            القرآن الكريم
          </h1>
          <p className="text-emerald-600">
            اقرأ واستمع وتدبر آيات الله في واجهة مريحة وجميلة
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-10">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 animate-fadeIn">
            {error}
          </div>
        )}

        {showSurahList ? (
          <div className="max-w-5xl mx-auto animate-slideUp">
            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-emerald-700 font-medium">
                  ترتيب السور:
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="border border-emerald-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="asc">من الأولى إلى الأخيرة</option>
                  <option value="desc">من الأخيرة إلى الأولى</option>
                </select>
              </div>

              <div className="w-full md:w-1/2 relative">
                <input
                  type="text"
                  placeholder="ابحث عن سورة بالاسم أو الرقم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                />
                <span className="absolute left-3 top-3 text-emerald-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="text-emerald-700 font-medium mb-2 text-center">
              عدد السور: {filtered.length}
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-100 rounded-xl">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-500 animate-fadeIn">
                  لم يتم العثور على سورة بهذا الاسم 😢
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((s, index) => (
                    <div
                      key={s.number}
                      onClick={() => fetchSurah(s.number)}
                      style={{ animationDelay: `${index * 0.03}s` }}
                      className="p-5 bg-white border border-emerald-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer animate-fadeSlide">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-emerald-700">
                          {s.name}
                        </h3>
                        <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          {s.number}
                        </span>
                      </div>
                      <p className="text-emerald-600 text-sm mb-1">
                        {s.englishName}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {s.numberOfAyahs} آية •{" "}
                        {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-emerald-100 flex flex-wrap justify-between items-center gap-4 animate-slideUp">
              <button
                onClick={backToSurahList}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                ← العودة إلى السور
              </button>

              {selectedSurah && (
                <div className="text-center">
                  <div className="text-emerald-700 font-bold">
                    {selectedSurah.name}
                  </div>
                  <div className="text-sm text-emerald-500">
                    صفحة {currentPage} من {totalPages}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-emerald-700">حجم الخط:</label>
                <input
                  type="range"
                  min="16"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-24 accent-emerald-600"
                />
                <span className="text-emerald-700">{fontSize}px</span>
              </div>
            </div>

            {loading ? (
              <QuranReadingSkeleton />
            ) : (
              selectedSurah && (
                <div className="space-y-6 animate-fadeIn">
                  {selectedSurah.number !== 1 &&
                    selectedSurah.number !== 9 &&
                    currentPage === 1 && (
                      <div className="text-center text-emerald-700 text-xl font-semibold animate-fadeIn">
                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                      </div>
                    )}

                  <div className="bg-white rounded-2xl shadow-md p-6 border border-emerald-100">
                    <div className="space-y-5">
                      {getCurrentPageAyahs().map((ayah) => (
                        <div
                          key={ayah.number}
                          className="flex items-start border-b border-emerald-100 pb-4 last:border-b-0 animate-fadeSlide">
                          <span className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-full text-sm font-semibold flex-shrink-0">
                            {ayah.numberInSurah}
                          </span>
                          <p
                            className={`mr-3 text-emerald-900 leading-relaxed ${
                              fontSize <= 18
                                ? "text-base"
                                : fontSize <= 22
                                ? "text-lg"
                                : fontSize <= 26
                                ? "text-xl"
                                : fontSize <= 30
                                ? "text-2xl"
                                : "text-3xl"
                            }`}>
                            {ayah.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-4 bg-white rounded-2xl shadow-md p-4 border border-emerald-100 animate-slideUp">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-6 py-2 rounded-lg transition ${
                        currentPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}>
                      ← السابق
                    </button>

                    <span className="text-emerald-700 font-medium">
                      {currentPage} من {totalPages}
                    </span>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-6 py-2 rounded-lg transition ${
                        currentPage === totalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}>
                      التالي →
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-in-out; }
        .animate-slideUp { animation: slideUp 0.7s ease-out; }
        .animate-fadeSlide { animation: slideUp 0.6s ease-out, fadeIn 0.6s ease-in-out; }
        .scrollbar-thin::-webkit-scrollbar { width: 8px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #6ee7b7; border-radius: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background-color: #ecfdf5; }
      `}</style>
    </div>
  );
};

export default QuranPage;
