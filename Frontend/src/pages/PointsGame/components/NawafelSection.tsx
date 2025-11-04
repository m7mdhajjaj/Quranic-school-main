// components/NawafelSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import type { Nawafel } from "../types/pointsGame.types";

interface NawafelSectionProps {
  nawafel: Nawafel;
  onToggle: (key: keyof Nawafel) => void;
}

export const NawafelSection = ({ nawafel, onToggle }: NawafelSectionProps) => {
  const nawafelItems = [
    { key: "duha" as keyof Nawafel, icon: "☀️", name: "صلاة الضحى", points: 5 },
    {
      key: "qiyamAlayl" as keyof Nawafel,
      icon: "🌙",
      name: "قيام الليل",
      points: 10,
    },
    { key: "rawatib" as keyof Nawafel, icon: "🙏", name: "الرواتب", points: 5 },
    { key: "witr" as keyof Nawafel, icon: "🌟", name: "الوتر", points: 5 },
  ];

  const getGradientClass = (index: number, isActive: boolean) => {
    const gradients = [
      "from-yellow-400 to-orange-400",
      "from-purple-500 to-indigo-600",
      "from-green-400 to-teal-500",
      "from-blue-400 to-cyan-500",
    ];
    return isActive
      ? `bg-gradient-to-br ${gradients[index]} text-white`
      : "bg-gray-100 text-gray-600";
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">✨</div>
        <h2 className="text-2xl font-bold text-gray-800">الصلوات النوافل</h2>
        <span className="text-sm text-gray-500">(اضغط لتفعيل/إلغاء)</span>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {nawafelItems.map((item, index) => (
          <Button
            key={item.key}
            onClick={() => onToggle(item.key)}
            variant={nawafel[item.key] ? "success" : "ghost"}
            className={`rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${getGradientClass(
              index,
              nawafel[item.key]
            )}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{item.icon}</div>
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
