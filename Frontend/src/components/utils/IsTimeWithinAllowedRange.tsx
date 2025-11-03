import React from "react";

interface IsTimeWithinAllowedRangeProps {
  time: string | Date;
  start: string | Date;
  end: string | Date;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const isTimeWithinAllowedRange = (
  timeInput: string | Date,
  startInput: string | Date,
  endInput: string | Date
): boolean => {
  const time = new Date(timeInput).getTime();
  const start = new Date(startInput).getTime();
  const end = new Date(endInput).getTime();
  return time >= start && time <= end;
};

const IsTimeWithinAllowedRange: React.FC<IsTimeWithinAllowedRangeProps> = ({
  time,
  start,
  end,
  children,
  fallback = null,
}) => {
  return isTimeWithinAllowedRange(time, start, end) ? <>{children}</> : <>{fallback}</>;
};

export default IsTimeWithinAllowedRange;
