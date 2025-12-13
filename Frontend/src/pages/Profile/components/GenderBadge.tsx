// components/GenderBadge.tsx
import { toArabicGender } from "../utils/profileHelpers";

interface GenderBadgeProps {
  gender?: string;
}

export const GenderBadge = ({ gender }: GenderBadgeProps) => {
  const arabicGender = toArabicGender(gender);

  const getGenderStyle = () => {
    if (arabicGender === "ذكر") {
      return {
        bg: "bg-gradient-to-r from-teal-500 to-cyan-500",
        icon: "👨",
      };
    } else if (arabicGender === "أنثى") {
      return {
        bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
        icon: "👩",
      };
    } else {
      return {
        bg: "bg-gradient-to-r from-slate-400 to-slate-500",
        icon: "❓",
      };
    }
  };

  const style = getGenderStyle();

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${style.bg} text-white px-6 py-2.5 rounded-full font-bold text-base shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20`}
      dir="rtl">
      <span className="text-xl">{style.icon}</span>
      <span>{arabicGender}</span>
    </span>
  );
};
