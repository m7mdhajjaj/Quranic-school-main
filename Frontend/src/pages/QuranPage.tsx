import { useState, useEffect } from "react";
import {
  QuranPageSkeleton,
  QuranReadingSkeleton,
} from "../components/LoadingSkeleton";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(false);
  const [surahsLoading, setSurahsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSurahList, setShowSurahList] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  // Number of ayahs per page
  const ayahsPerPage = 10;

  // Fetch all surahs
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setSurahsLoading(true);
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        if (!response.ok) {
          throw new Error("فشل في تحميل قائمة السور");
        }
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        setError("خطأ في تحميل قائمة السور");
        console.error("Error fetching surahs:", error);
      } finally {
        setSurahsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // Fetch specific surah
  const fetchSurah = async (surahNumber: number) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      );

      if (!response.ok) {
        throw new Error("فشل في تحميل السورة");
      }

      const data = await response.json();
      setSelectedSurah(data.data);
      setCurrentPage(1);
      setShowSurahList(false);
    } catch (error) {
      setError("خطأ في تحميل السورة");
      console.error("Error fetching surah:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter surahs based on search
  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.includes(searchTerm) ||
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.number.toString().includes(searchTerm)
  );

  // Function to remove Bismillah from ayah text
  const removeBismillah = (text: string, isFirstAyah: boolean) => {
    if (!isFirstAyah) return text;

    console.log("Original text:", text); // Debug log

    let cleanedText = text;

    // Remove bismillah from anywhere in the text
    const bismillahPatterns = [
      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ",
      "بسم الله الرحمن الرحيم",
      "﷽",
    ];

    // Try exact string replacement anywhere in text
    for (const pattern of bismillahPatterns) {
      if (cleanedText.includes(pattern)) {
        cleanedText = cleanedText.replace(pattern, "").trim();
        // Clean up extra spaces
        cleanedText = cleanedText.replace(/\s+/g, " ").trim();
        console.log("Removed bismillah pattern, new text:", cleanedText);
        return cleanedText;
      }
    }

    // Try regex patterns to catch variations anywhere in text
    const regexPatterns = [
      /بِسْمِ\s+اللَّهِ\s+الرَّحْمَنِ\s+الرَّحِيمِ/g,
      /بسم\s+الله\s+الرحمن\s+الرحيم/g,
      /بِسْمِ\s*اللهِ\s*الرَّحْمَنِ\s*الرَّحِيمِ/g,
    ];

    for (const pattern of regexPatterns) {
      if (pattern.test(cleanedText)) {
        cleanedText = cleanedText.replace(pattern, "").trim();
        cleanedText = cleanedText.replace(/\s+/g, " ").trim();
        console.log("Removed bismillah with regex, new text:", cleanedText);
        return cleanedText;
      }
    }

    // If we still have bismillah words, try word-by-word removal
    if (cleanedText.includes("بسم") && cleanedText.includes("الرحيم")) {
      const words = cleanedText.split(/\s+/);
      const bismillahStart = words.findIndex((word) => word.includes("بسم"));
      const bismillahEnd = words.findIndex((word) => word.includes("الرحيم"));

      if (
        bismillahStart !== -1 &&
        bismillahEnd !== -1 &&
        bismillahEnd > bismillahStart
      ) {
        // Remove words from bismillah start to end
        const beforeBismillah = words.slice(0, bismillahStart);
        const afterBismillah = words.slice(bismillahEnd + 1);
        cleanedText = [...beforeBismillah, ...afterBismillah].join(" ").trim();
        console.log("Removed bismillah word by word, new text:", cleanedText);
        return cleanedText;
      }
    }

    console.log("No bismillah found to remove");
    return cleanedText;
  };

  // Get current page ayahs
  const getCurrentPageAyahs = () => {
    if (!selectedSurah) return [];
    const startIndex = (currentPage - 1) * ayahsPerPage;
    const endIndex = startIndex + ayahsPerPage;
    return selectedSurah.ayahs.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    if (!selectedSurah) return 0;
    return Math.ceil(selectedSurah.numberOfAyahs / ayahsPerPage);
  };

  const goToNextPage = () => {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to surah list
  const backToSurahList = () => {
    setSelectedSurah(null);
    setShowSurahList(true);
    setCurrentPage(1);
    setSearchTerm("");
  };

  if (surahsLoading) {
    return <QuranPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            القرآن الكريم
          </h1>
          <p className="text-green-600">
            اقرأ القرآن الكريم مع ترقيم الآيات والتنسيق المناسب
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showSurahList ? (
          // Surah List View
          <div className="max-w-4xl mx-auto">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="ابحث عن سورة بالاسم أو الرقم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                dir="rtl"
              />
            </div>

            {/* Surahs Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              dir="rtl">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => fetchSurah(surah.number)}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border-r-4 border-green-500">
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {surah.number}. {surah.name}
                    </h3>
                    <p className="text-green-600 text-sm mb-1">
                      {surah.englishName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {surah.numberOfAyahs} آية •{" "}
                      {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Surah Reading View
          <div className="max-w-4xl mx-auto">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={backToSurahList}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                  ← العودة للسور
                </button>

                {selectedSurah && (
                  <div className="text-center">
                    <div className="text-green-800 font-bold">
                      {selectedSurah.name}
                    </div>
                    <div className="text-sm text-green-600">
                      صفحة {currentPage} من {getTotalPages()}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="text-green-700">حجم الخط:</label>
                  <input
                    type="range"
                    min="16"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-green-700">{fontSize}px</span>
                </div>
              </div>
            </div>

            {loading ? (
              <QuranReadingSkeleton />
            ) : selectedSurah ? (
              <div className="space-y-6">
                {/* Bismillah */}
                {selectedSurah.number !== 1 &&
                  selectedSurah.number !== 9 &&
                  currentPage === 1 && (
                    <div className="text-center mb-6">
                      <div className="text-green-700 text-xl font-semibold">
                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                      </div>
                    </div>
                  )}

                {/* Ayahs */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="space-y-4">
                    {getCurrentPageAyahs().map((ayah) => (
                      <div
                        key={ayah.number}
                        className="border-b border-green-100 pb-4 last:border-b-0">
                        <div className="text-right mb-2">
                          <div className="flex items-end justify-between">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-700 rounded-full text-sm font-bold flex-shrink-0">
                              {ayah.numberInSurah}
                            </span>
                            <p
                              className="text-green-900 font-medium leading-relaxed flex-1 mr-2"
                              style={{ fontSize: fontSize, lineHeight: "2.2" }}>
                              {removeBismillah(
                                ayah.text,
                                ayah.numberInSurah === 1
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 bg-white rounded-lg shadow-md p-4">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-6 py-2 rounded transition-colors ${
                      currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}>
                    ← السابق
                  </button>

                  <span className="text-green-700 font-medium">
                    {currentPage} من {getTotalPages()}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === getTotalPages()}
                    className={`px-6 py-2 rounded transition-colors ${
                      currentPage === getTotalPages()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}>
                    التالي →
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranPage;
