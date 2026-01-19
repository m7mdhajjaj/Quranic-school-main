import React from "react";
import { FaUserPlus, FaChalkboardTeacher, FaUsers, FaUserTie, FaClipboardList } from "react-icons/fa";

interface QuickActionsProps {
  onAddStudent: () => void;
  onAddTeacher: () => void;
  onAddGroup: () => void;
  onAddAssistant: () => void;
  onAddSecretary: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddStudent,
  onAddTeacher,
  onAddGroup,
  onAddAssistant,
  onAddSecretary,
}) => {
  const actions = [
    {
      icon: FaUserPlus,
      label: "إضافة طالب",
      color: "from-emerald-500 to-green-600",
      hoverColor: "hover:from-emerald-600 hover:to-green-700",
      onClick: onAddStudent,
    },
    {
      icon: FaChalkboardTeacher,
      label: "إضافة معلم",
      color: "from-teal-500 to-emerald-600",
      hoverColor: "hover:from-teal-600 hover:to-emerald-700",
      onClick: onAddTeacher,
    },
    {
      icon: FaUserTie,
      label: "إضافة مساعد",
      color: "from-cyan-500 to-teal-600",
      hoverColor: "hover:from-cyan-600 hover:to-teal-700",
      onClick: onAddAssistant,
    },
    {
      icon: FaClipboardList,
      label: "إضافة سكرتير",
      color: "from-sky-500 to-cyan-600",
      hoverColor: "hover:from-sky-600 hover:to-cyan-700",
      onClick: onAddSecretary,
    },
    {
      icon: FaUsers,
      label: "إضافة حلقة",
      color: "from-green-600 to-teal-600",
      hoverColor: "hover:from-green-700 hover:to-teal-700",
      onClick: onAddGroup,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            bg-gradient-to-br ${action.color} ${action.hoverColor}
            text-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg 
            transform transition-all duration-300 
            hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-400
            active:scale-95
            group
          `}>
          <action.icon className="text-3xl sm:text-4xl mb-2 sm:mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
          <p className="font-bold text-xs sm:text-sm">{action.label}</p>
        </button>
      ))}
    </div>
  );
};
