import React from "react";
import { formatTime12Arabic as formatTime12 } from "@/utils/helpers/dateHelpers";

interface FormatTime12ArabicProps {
  time: string | Date;
  className?: string;
}

const FormatTime12Arabic: React.FC<FormatTime12ArabicProps> = ({ time, className }) => {
  // تحويل Date إلى string بصيغة HH:MM
  let timeStr: string;
  if (typeof time === 'string') {
    timeStr = time;
  } else {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    timeStr = `${hours}:${minutes}`;
  }
  return <span className={className}>{formatTime12(timeStr)}</span>;
};

export default FormatTime12Arabic;
