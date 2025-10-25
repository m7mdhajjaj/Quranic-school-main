// ============================================================================
// Timer Component - مؤقت السؤال
// ============================================================================

import type { TimerProps } from "../types/test";
import { getTimerClasses, getTimerMessage } from "../utils/testHelpers";

export const Timer: React.FC<TimerProps> = ({ timer, isActive }) => {
  if (!isActive) return null;

  return (
    <div className="text-center mb-6">
      <div className="inline-block">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full text-3xl md:text-4xl font-bold shadow-xl transition-all duration-300 ${getTimerClasses(
            timer
          )}`}>
          {timer}
        </div>
        <div className="text-gray-600 text-sm mt-2 font-medium">
          {getTimerMessage(timer)}
        </div>
      </div>
    </div>
  );
};
