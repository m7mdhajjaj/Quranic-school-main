// components/HalaqahSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { HalaqahSectionProps } from "../types/pointsGame.types";
import { BookOpen, Book, RefreshCw } from "lucide-react";

export const HalaqahSection = ({ halaqah, onUpdate }: HalaqahSectionProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">📖 المتابعة في الحلقة</h2>
            <span className="text-white/70 text-xs">(الحد الأدنى 10 دقائق)</span>
          </div>
        </div>
      </div>
      <div className="p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <div className="grid md:grid-cols-2 gap-6">
        {/* حفظ من الموضع القادم */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg border-2 border-emerald-200">
          <div className="text-center mb-4">
            <Book className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
            <h3 className="font-bold text-xl text-gray-800 mb-2">
              حفظ من الموضع القادم
            </h3>
            <p className="text-sm text-gray-600 mb-4">كم دقيقة حفظت اليوم؟</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-5xl font-black text-emerald-600 mb-2">
                {halaqah.memorizedMinutes}
              </div>
              <p className="text-gray-600 text-sm">دقيقة</p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={() =>
                  onUpdate(
                    "memorizedMinutes",
                    Math.max(0, halaqah.memorizedMinutes - 10)
                  )
                }
                variant="danger"
                className="px-6 py-3 rounded-lg font-bold shadow-lg">
                - 10
              </Button>
              <Button
                onClick={() =>
                  onUpdate("memorizedMinutes", halaqah.memorizedMinutes + 10)
                }
                variant="success"
                className="px-6 py-3 rounded-lg font-bold shadow-lg">
                + 10
              </Button>
            </div>

            <div className="bg-emerald-100 rounded-lg p-3 text-center border-2 border-emerald-300">
              <div className="text-3xl font-bold text-emerald-700">
                +{Math.floor(halaqah.memorizedMinutes / 10) * 5} نقطة
              </div>
              <p className="text-xs text-gray-600 mt-1">كل 10 دقائق = 5 نقاط</p>
            </div>
          </div>
        </div>

        {/* مراجعة من الموضع القادم */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 shadow-lg border-2 border-teal-200">
          <div className="text-center mb-4">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 text-teal-600" />
            <h3 className="font-bold text-xl text-gray-800 mb-2">
              مراجعة من الموضع القادم
            </h3>
            <p className="text-sm text-gray-600 mb-4">كم دقيقة راجعت اليوم؟</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-5xl font-black text-teal-600 mb-2">
                {halaqah.reviewedMinutes}
              </div>
              <p className="text-gray-600 text-sm">دقيقة</p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={() =>
                  onUpdate(
                    "reviewedMinutes",
                    Math.max(0, halaqah.reviewedMinutes - 10)
                  )
                }
                variant="danger"
                className="px-6 py-3 rounded-lg font-bold shadow-lg">
                - 10
              </Button>
              <Button
                onClick={() =>
                  onUpdate("reviewedMinutes", halaqah.reviewedMinutes + 10)
                }
                variant="primary"
                className="px-6 py-3 rounded-lg font-bold shadow-lg">
                + 10
              </Button>
            </div>

            <div className="bg-teal-100 rounded-lg p-3 text-center border-2 border-teal-300">
              <div className="text-3xl font-bold text-teal-700">
                +{Math.floor(halaqah.reviewedMinutes / 10) * 3} نقطة
              </div>
              <p className="text-xs text-gray-600 mt-1">كل 10 دقائق = 3 نقاط</p>
            </div>
          </div>
        </div>
      </div>

      {/* ملخص نقاط الحلقة */}
      <div className="mt-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-4 text-center border-2 border-emerald-300">
        <h4 className="font-bold text-gray-800 mb-2">
          إجمالي نقاط الحلقة اليوم
        </h4>
        <div className="text-4xl font-black text-emerald-700">
          {Math.floor(halaqah.memorizedMinutes / 10) * 5 +
            Math.floor(halaqah.reviewedMinutes / 10) * 3}{" "}
          نقطة
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {halaqah.memorizedMinutes} دقيقة حفظ + {halaqah.reviewedMinutes} دقيقة
          مراجعة
        </p>
      </div>
      </div>
    </div>
  );
};
