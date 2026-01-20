// components/MotivationalMessage.tsx
import { getMotivationalMessage } from "../utils/pointsCalculator";
import { Sparkles } from "lucide-react";
import type { MotivationalMessageProps } from "../types/pointsGame.types";

export const MotivationalMessage = ({
  totalPoints,
}: MotivationalMessageProps) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-8 text-white text-center border border-white/10">
      <Sparkles className="w-16 h-16 mx-auto mb-4" />
      <h2 className="text-3xl font-bold mb-4">واصل التميز!</h2>
      <p className="text-xl opacity-90 mb-4">
        {getMotivationalMessage(totalPoints)}
      </p>
      <div className="text-sm opacity-75">
        "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا" ✨
      </div>
    </div>
  );
};
