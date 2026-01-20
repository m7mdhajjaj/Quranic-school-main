const Soon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl p-8 max-w-md border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl text-red-500">🔒</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            التسجيل مغلق حالياً
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          سيتم فتح التسجيل قريباً، يرجى متابعة الموقع لمعرفة آخر المستجدات.
        </p>
        <div className="bg-red-100 text-red-700 px-6 py-3 rounded-full font-semibold shadow">
          شكراً لانتظارك!
        </div>
      </div>
    </div>
  );
};

export default Soon;
