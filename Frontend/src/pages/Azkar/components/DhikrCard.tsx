import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { ProgressBar } from "../../../components/shared/ProgressBar";
import Reveal from "../../../components/shared/Reveal";

interface DhikrCardProps {
  text: string;
  count: number;
  originalCount: number;
  isCompleted: boolean;
  onClick: () => void;
  index?: number;
}

const DhikrCard = ({
  text,
  count,
  originalCount,
  isCompleted,
  onClick,
  index = 0,
}: DhikrCardProps) => {
  return (
    <Reveal delay={index * 0.1} direction="up" duration={0.5}>
      <Card
        variant={isCompleted ? "gradient" : "elevated"}
        padding="lg"
        className={`${
          isCompleted
            ? "bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400"
            : ""
        }`}>
        <div className="flex flex-col gap-4">
          {/* Dhikr Text */}
          <div className="text-right">
            <p
              className={`text-lg md:text-xl leading-relaxed font-arabic ${
                isCompleted ? "text-green-800" : "text-gray-800"
              }`}>
              {text}
            </p>
          </div>

          {/* Counter Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={onClick}
              disabled={isCompleted}
              variant={isCompleted ? "success" : "primary"}
              size="lg"
              gradient={!isCompleted}
              className={`${
                isCompleted ? "cursor-default" : ""
              } shadow-lg hover:shadow-xl`}>
              {isCompleted ? (
                <>
                  <span>تم الإكمال</span>
                  <span>✓</span>
                </>
              ) : (
                <>
                  <span>{count}</span>
                  <span className="text-2xl">🤲</span>
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            value={originalCount - count}
            max={originalCount}
            showLabel={false}
            showPercentage={false}
            color={isCompleted ? "emerald" : "blue"}
            size="md"
          />
        </div>
      </Card>
    </Reveal>
  );
};

export default DhikrCard;
