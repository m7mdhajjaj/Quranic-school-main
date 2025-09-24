const Soon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-lg p-8 mt-8">
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
  );
};

export default Soon;
