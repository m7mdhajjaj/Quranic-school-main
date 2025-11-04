// components/HalaqahSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { Halaqah } from "../types/pointsGame.types";

interface HalaqahSectionProps {
  halaqah: Halaqah;
  onUpdate: (key: keyof Halaqah, value: number) => void;
}

export const HalaqahSection = ({ halaqah, onUpdate }: HalaqahSectionProps) => {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📖</div>
        <h2 className="text-2xl font-bold text-gray-800">المتابعة في الحلقة</h2>
        <span className="text-sm text-gray-500">(الحد الأدنى 10 دقائق)</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* حفظ من الموضع القادم */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border-2 border-green-200">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">📚</div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">
              حفظ من الموضع القادم
            </h3>
            <p className="text-sm text-gray-600 mb-4">كم دقيقة حفظت اليوم؟</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-5xl font-black text-green-600 mb-2">
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

            <div className="bg-green-100 rounded-lg p-3 text-center border-2 border-green-300">
              <div className="text-3xl font-bold text-green-700">
                +{Math.floor(halaqah.memorizedMinutes / 10) * 5} نقطة
              </div>
              <p className="text-xs text-gray-600 mt-1">كل 10 دقائق = 5 نقاط</p>
            </div>
          </div>
        </div>

        {/* مراجعة من الموضع القادم */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">🔄</div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">
              مراجعة من الموضع القادم
            </h3>
            <p className="text-sm text-gray-600 mb-4">كم دقيقة راجعت اليوم؟</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-5xl font-black text-blue-600 mb-2">
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

            <div className="bg-blue-100 rounded-lg p-3 text-center border-2 border-blue-300">
              <div className="text-3xl font-bold text-blue-700">
                +{Math.floor(halaqah.reviewedMinutes / 10) * 3} نقطة
              </div>
              <p className="text-xs text-gray-600 mt-1">كل 10 دقائق = 3 نقاط</p>
            </div>
          </div>
        </div>
      </div>

      {/* ملخص نقاط الحلقة */}
      <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center border-2 border-purple-300">
        <h4 className="font-bold text-gray-800 mb-2">
          إجمالي نقاط الحلقة اليوم
        </h4>
        <div className="text-4xl font-black text-purple-700">
          {Math.floor(halaqah.memorizedMinutes / 10) * 5 +
            Math.floor(halaqah.reviewedMinutes / 10) * 3}{" "}
          نقطة
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {halaqah.memorizedMinutes} دقيقة حفظ + {halaqah.reviewedMinutes} دقيقة
          مراجعة
        </p>
      </div>
    </Card>
  );
};
