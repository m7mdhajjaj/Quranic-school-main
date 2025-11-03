// components/MotivationalMessage.tsx
import { getMotivationalMessage } from "../utils/pointsCalculator";

interface MotivationalMessageProps {
  totalPoints: number;
}

export const MotivationalMessage = ({
  totalPoints,
}: MotivationalMessageProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white text-center">
      <div className="text-6xl mb-4">💪</div>
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
