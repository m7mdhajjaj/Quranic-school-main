import { BookOpen } from "lucide-react";

const PageHeader = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            📿 الأذكار
          </h1>
          <p className="text-white/70 text-sm mt-1">
            اختر نوع الأذكار التي تريد قراءتها
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
