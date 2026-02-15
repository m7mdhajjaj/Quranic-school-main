// components/RamadanSection.tsx
import { Button } from "@/components/UI/Button";
import { Moon, BookOpen, UtensilsCrossed, Check, X } from "lucide-react";
import type { RamadanSectionProps } from "../types/pointsGame.types";

export const RamadanSection = ({ ramadan, onUpdate }: RamadanSectionProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-700 to-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">🌙 أنشطة رمضان</h2>
            <p className="text-white/70 text-xs mt-0.5">
              سجّل عباداتك الرمضانية واجمع النقاط
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30">
        <div className="grid md:grid-cols-3 gap-6">
          {/* صلاة التراويح */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 mb-3">
              <div className="text-4xl mb-2">🕌</div>
              <h3 className="font-bold text-purple-800 text-sm mb-1">
                صلاة التراويح
              </h3>
              <p className="text-xs text-purple-600 mb-3">
                كل ركعة = نقطة واحدة
              </p>
              <div className="text-5xl font-black text-purple-600 mb-3">
                {ramadan.taraweehRakaat}
              </div>
              <p className="text-gray-600 text-sm mb-3">ركعة</p>
              <div className="flex justify-center gap-2 mb-3">
                <Button
                  onClick={() =>
                    onUpdate(
                      "taraweehRakaat",
                      Math.max(0, ramadan.taraweehRakaat - 2),
                    )
                  }
                  variant="danger"
                  className="px-4 py-2 rounded-lg font-bold">
                  -2
                </Button>
                <Button
                  onClick={() =>
                    onUpdate(
                      "taraweehRakaat",
                      Math.min(20, ramadan.taraweehRakaat + 2),
                    )
                  }
                  variant="success"
                  className="px-4 py-2 rounded-lg font-bold">
                  +2
                </Button>
              </div>
              {/* أزرار سريعة */}
              <div className="flex flex-wrap justify-center gap-1">
                {[8, 12, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdate("taraweehRakaat", num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      ramadan.taraweehRakaat === num
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}>
                    {num} ركعة
                  </button>
                ))}
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              +{ramadan.taraweehRakaat} نقطة
            </div>
          </div>

          {/* قراءة القرآن */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-4 mb-3">
              <div className="flex justify-center mb-2">
                <BookOpen className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-bold text-emerald-800 text-sm mb-1">
                قراءة القرآن
              </h3>
              <p className="text-xs text-emerald-600 mb-3">
                كل صفحة = نقطة واحدة
              </p>
              <div className="text-5xl font-black text-emerald-600 mb-3">
                {ramadan.quranPages}
              </div>
              <p className="text-gray-600 text-sm mb-3">صفحة</p>
              <div className="flex justify-center gap-2 mb-3">
                <Button
                  onClick={() =>
                    onUpdate("quranPages", Math.max(0, ramadan.quranPages - 1))
                  }
                  variant="danger"
                  className="px-4 py-2 rounded-lg font-bold">
                  -
                </Button>
                <Button
                  onClick={() => onUpdate("quranPages", ramadan.quranPages + 1)}
                  variant="success"
                  className="px-4 py-2 rounded-lg font-bold">
                  +
                </Button>
              </div>
              {/* أزرار سريعة */}
              <div className="flex flex-wrap justify-center gap-1">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdate("quranPages", num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      ramadan.quranPages === num
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}>
                    {num} صفحة
                  </button>
                ))}
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              +{ramadan.quranPages} نقطة
            </div>
          </div>

          {/* الصيام */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 mb-3">
              <div className="flex justify-center mb-2">
                <UtensilsCrossed className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="font-bold text-amber-800 text-sm mb-1">الصيام</h3>
              <p className="text-xs text-amber-600 mb-3">الصيام = 5 نقاط</p>
              <button
                onClick={() => onUpdate("fpiasting", !ramadan.fpiasting)}
                className={`w-full py-6 rounded-xl transition-all shadow-lg ${
                  ramadan.fpiasting
                    ? "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600"
                    : "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500"
                }`}>
                <div
                  className={`mb-2 transition-all flex justify-center ${
                    ramadan.fpiasting ? "animate-bounce" : ""
                  }`}>
                  {ramadan.fpiasting ? (
                    <Check className="w-14 h-14 text-white" />
                  ) : (
                    <X className="w-14 h-14 text-white" />
                  )}
                </div>
                <p className="text-lg font-bold text-white">
                  {ramadan.fpiasting ? "صائم اليوم ✨" : "لم أصم"}
                </p>
              </button>
            </div>
            <div
              className={`text-2xl font-bold ${
                ramadan.fpiasting ? "text-amber-600" : "text-gray-400"
              }`}>
              {ramadan.fpiasting ? "+5 نقاط" : "0 نقطة"}
            </div>
          </div>
        </div>

        {/* ملخص نقاط رمضان */}
        <div className="mt-5 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 rounded-xl p-4 text-center text-white">
          <p className="text-sm opacity-90 mb-1">إجمالي نقاط أنشطة رمضان</p>
          <p className="text-3xl font-black">
            {ramadan.taraweehRakaat +
              ramadan.quranPages +
              (ramadan.fpiasting ? 5 : 0)}{" "}
            نقطة
          </p>
        </div>
      </div>
    </div>
  );
};
