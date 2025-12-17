// components/NawafelSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { NawafelSectionProps, Nawafel } from "../types/pointsGame.types";
import { Sparkles, Sun, Moon, HandHeart, Star } from "lucide-react";

const NAWAFEL_ITEMS: Array<{
  key: keyof Nawafel;
  IconComponent: typeof Sun;
  name: string;
  points: number;
}> = [
  { key: "duha", IconComponent: Sun, name: "صلاة الضحى", points: 5 },
  { key: "qiyamAlayl", IconComponent: Moon, name: "قيام الليل", points: 10 },
  { key: "rawatib", IconComponent: HandHeart, name: "الرواتب", points: 5 },
  { key: "witr", IconComponent: Star, name: "الوتر", points: 5 },
];

const ACTIVE_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-emerald-600 to-cyan-600",
  "from-teal-500 to-emerald-600",
  "from-teal-600 to-cyan-600",
] as const;

export const NawafelSection = ({ nawafel, onToggle }: NawafelSectionProps) => {
  const getGradientClass = (index: number, isActive: boolean) => {
    const gradients = ACTIVE_GRADIENTS;
    return isActive
      ? `bg-gradient-to-br ${gradients[index]} text-white`
      : "bg-gray-100 text-gray-600";
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-10 h-10 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">الصلوات النوافل</h2>
        <span className="text-sm text-gray-500">(اضغط لتفعيل/إلغاء)</span>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {NAWAFEL_ITEMS.map((item, index) => (
          <Button
            key={item.key}
            onClick={() => onToggle(item.key)}
            variant={nawafel[item.key] ? "success" : "ghost"}
            className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${getGradientClass(
              index,
              nawafel[item.key]
            )}`}>
            <div className="text-center">
              <item.IconComponent className="w-10 h-10 mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <div className="text-sm font-medium">
                {nawafel[item.key]
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
