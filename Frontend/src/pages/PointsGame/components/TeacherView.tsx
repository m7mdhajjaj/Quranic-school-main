// components/TeacherView.tsx
interface TeacherViewProps {
  onShowRankings: () => void;
  loading: boolean;
}

export const TeacherView = ({ onShowRankings, loading }: TeacherViewProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 mb-8 text-white text-center">
      <div className="text-7xl mb-4">🏆</div>
      <h2 className="text-3xl font-bold mb-4">لوحة ترتيب الطلاب</h2>
      <p className="text-lg opacity-90 mb-6">
        اضغط على الزر لمشاهدة ترتيب طلابك حسب النقاط والشارات
      </p>
      <button
        onClick={onShowRankings}
        disabled={loading}
        className={`bg-white text-purple-600 px-10 py-5 rounded-full font-bold text-xl hover:scale-110 transition-transform shadow-2xl flex items-center gap-3 mx-auto ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}>
        {loading ? (
          <>
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>جاري التحميل...</span>
          </>
        ) : (
          <>
            <span className="text-3xl">🏅</span>
            <span>عرض لوحة الترتيب</span>
          </>
        )}
      </button>
    </div>
  );
};
