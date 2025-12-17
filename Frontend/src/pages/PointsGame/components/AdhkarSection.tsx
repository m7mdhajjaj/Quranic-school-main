// components/AdhkarSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { AdhkarSectionProps, Adhkar } from "../types/pointsGame.types";
import { CircleDot, Sun, Sunset, Moon, Hand } from "lucide-react";

const ADHKAR_ITEMS: Array<{
  key: keyof Adhkar;
  IconComponent: typeof Sun;
  name: string;
  points: number;
}> = [
  { key: "morning", IconComponent: Sun, name: "أذكار الصباح", points: 5 },
  { key: "evening", IconComponent: Sunset, name: "أذكار المساء", points: 5 },
  { key: "sleep", IconComponent: Moon, name: "أذكار النوم", points: 3 },
  { key: "afterPrayer", IconComponent: Hand, name: "بعد الصلاة", points: 5 },
];

const ACTIVE_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-teal-500 to-cyan-600",
  "from-emerald-600 to-cyan-600",
  "from-teal-600 to-emerald-600",
] as const;

export const AdhkarSection = ({ adhkar, onToggle }: AdhkarSectionProps) => {
  const getGradientClass = (index: number, isActive: boolean) => {
    const gradients = ACTIVE_GRADIENTS;
    return isActive
      ? `bg-gradient-to-br ${gradients[index]} text-white`
      : "bg-gray-100 text-gray-600";
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <CircleDot className="w-10 h-10 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">الأذكار اليومية</h2>
        <span className="text-sm text-gray-500">(اضغط لتفعيل/إلغاء)</span>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {ADHKAR_ITEMS.map((item, index) => (
          <Button
            key={item.key}
            onClick={() => onToggle(item.key)}
            variant={adhkar[item.key] ? "success" : "ghost"}
            className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${getGradientClass(
              index,
              adhkar[item.key]
            )}`}>
            <div className="text-center">
              <item.IconComponent className="w-10 h-10 mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <div className="text-sm font-medium">
                {adhkar[item.key]
                  ? `✅ ${item.points} نقاط`
                  : "⚪ اضغط للتفعيل"}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
