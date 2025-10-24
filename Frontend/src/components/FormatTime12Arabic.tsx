import React from "react";

interface FormatTime12ArabicProps {
  time: string | Date;
  className?: string;
}

const formatTime12Arabic = (timeInput: string | Date): string => {
  try {
    const date = new Date(timeInput);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Time formatting error:", error);
    return new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
};

const FormatTime12Arabic: React.FC<FormatTime12ArabicProps> = ({ time, className }) => {
  return <span className={className}>{formatTime12Arabic(time)}</span>;
};

export default FormatTime12Arabic;
