// ============================================================================
// WarningBadge Component - شارة الإنذار
// ============================================================================

import type { WarningBadgeProps } from "../types/warnings";
import { getWarningLabel, getWarningIcon } from "../utils/warningHelpers";
import { Badge } from "../../../components/UI/Badge";

export const WarningBadge: React.FC<WarningBadgeProps> = ({
  type,
  count = 1,
  onDelete,
  showDelete = false,
}) => {
  const getVariant = () => {
    switch (type) {
      case "warning":
        return "warning" as const;
      case "expulsion":
        return "gray" as const;
      default:
        return "danger" as const;
    }
  };

  const badgeContent = (
    <div className="flex items-center gap-1">
      <span>{getWarningIcon(type)}</span>
      <span>{getWarningLabel(type)}</span>
      {count > 1 && type === "warning" && (
        <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-xs">
          {count}
        </span>
      )}
    </div>
  );

  if (showDelete && onDelete) {
    return (
      <div className="inline-flex items-center gap-1">
        <Badge variant={getVariant()} size="sm">
          {badgeContent}
        </Badge>
        <button
          onClick={onDelete}
          className="hover:bg-red-100 rounded-full p-1 transition-colors text-red-600"
          title="حذف الإنذار"
          aria-label="حذف الإنذار">
          ✕
        </button>
      </div>
    );
  }

  return (
    <Badge variant={getVariant()} size="sm">
      {badgeContent}
    </Badge>
  );
};
