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
  "from-emerald-600 via-teal-700 to-slate-700",
  "from-emerald-700 via-slate-600 to-teal-700",
  "from-teal-600 via-emerald-700 to-slate-700",
  "from-slate-600 via-teal-700 to-emerald-700",
] as const;

export const NawafelSection = ({ nawafel, onToggle }: NawafelSectionProps) => {
  const getGradientClass = (index: number, isActive: boolean) => {
    const gradients = ACTIVE_GRADIENTS;
    return isActive
      ? `bg-gradient-to-br ${gradients[index]} text-white`
      : "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">✨ الصلوات النوافل</h2>
            <span className="text-white/70 text-xs">(اضغط لتفعيل/إلغاء)</span>
          </div>
        </div>
      </div>
      <div className="p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
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
      </div>
    </div>
  );
};
