import { usePrayer } from '../contexts/PrayerContext';

const PrayerAlert = () => {
  const { currentPrayer, showPrayerAlert, dismissPrayerAlert } = usePrayer();

  if (!showPrayerAlert || !currentPrayer) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-fadeIn"
        onClick={dismissPrayerAlert}
      />

      {/* Alert Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in pointer-events-auto border-4 border-emerald-400"
          dir="rtl"
        >
          {/* Close Button */}
          <button
            onClick={dismissPrayerAlert}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            aria-label="إغلاق">
            ✕
          </button>

          {/* Prayer Icon */}
          <div className="text-center mb-6">
            <div className="text-8xl mb-4 animate-pulse">
              {currentPrayer.emoji}
            </div>
            <div className="text-7xl mb-2">🕌</div>
          </div>

          {/* Prayer Name */}
          <h2 className="text-4xl font-bold text-center mb-4 text-emerald-700">
            {currentPrayer.title}
          </h2>

          {/* Time */}
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold text-teal-600 mb-2">
              {currentPrayer.prayerTime}
            </p>
            <div className="text-lg text-gray-700 leading-relaxed">
              {currentPrayer.message}
            </div>
          </div>

          {/* Decorative Border */}
          <div className="border-t-2 border-b-2 border-emerald-300 py-4 my-6">
            <p className="text-center text-xl font-semibold text-emerald-800">
              🤲 توضأ وتوجه للصلاة 🤲
            </p>
          </div>

          {/* Hadith/Quote */}
          <div className="bg-emerald-100 rounded-xl p-4 mb-6">
            <p className="text-center text-sm text-emerald-900 leading-relaxed">
              "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا"
            </p>
            <p className="text-center text-xs text-emerald-700 mt-2">
              سورة النساء - آية 103
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={dismissPrayerAlert}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              حسناً
            </button>
            <button
              onClick={() => {
                dismissPrayerAlert();
                // فتح صفحة أوقات الصلاة
                window.location.href = '/prayer-times';
              }}
              className="flex-1 bg-white text-emerald-600 py-3 px-6 rounded-xl font-semibold border-2 border-emerald-500 hover:bg-emerald-50 transition-all duration-300">
              مواقيت الصلاة
            </button>
          </div>

          {/* Bottom Icon */}
          <div className="text-center mt-6 text-4xl animate-pulse">
            ☪️
          </div>
        </div>
      </div>
    </>
  );
};

export default PrayerAlert;
