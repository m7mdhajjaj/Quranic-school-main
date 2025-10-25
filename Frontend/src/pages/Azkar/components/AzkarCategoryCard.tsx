import { Card, Badge } from "../../../components/shared/UI";
import { ProgressBar } from "../../../components/shared/Feedback";

interface AzkarCategoryCardProps {
  icon: string;
  title: string;
  completedCount: number;
  totalCount: number;
  isFullyCompleted: boolean;
  onClick: () => void;
}

const AzkarCategoryCard = ({
  icon,
  title,
  completedCount,
  totalCount,
  isFullyCompleted,
  onClick,
}: AzkarCategoryCardProps) => {
  return (
    <Card
      variant={isFullyCompleted ? "gradient" : "elevated"}
      padding="lg"
      hover
      onClick={onClick}
      className={`relative ${
        isFullyCompleted
          ? "bg-gradient-to-br from-green-400 to-green-600"
          : ""
      }`}>
      {/* Completion Badge */}
      {isFullyCompleted && (
        <div className="absolute top-4 left-4">
          <Badge variant="success" size="sm" className="bg-white text-green-600 border-0 font-bold">
            ✓ مكتمل
          </Badge>
        </div>
      )}

      {/* Icon */}
      <div className="text-6xl mb-4 text-center">{icon}</div>

      {/* Title */}
      <h2
        className={`text-2xl font-bold mb-4 text-center ${
          isFullyCompleted ? "text-white" : "text-gray-800"
        }`}>
        {title}
      </h2>

      {/* Progress */}
      <div className="mt-4">
        <ProgressBar
          value={completedCount}
          max={totalCount}
          showLabel={false}
          showPercentage={false}
          color={isFullyCompleted ? "emerald" : "purple"}
          size="md"
          className="mb-2"
        />
        <div
          className={`text-sm text-center ${
            isFullyCompleted ? "text-white" : "text-gray-600"
          }`}>
          التقدم: {completedCount} / {totalCount}
        </div>
      </div>
    </Card>
  );
};

export default AzkarCategoryCard;
