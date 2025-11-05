import React from "react";
import { FaUserPlus, FaChalkboardTeacher, FaUsers } from "react-icons/fa";

interface QuickActionsProps {
  onAddStudent: () => void;
  onAddTeacher: () => void;
  onAddGroup: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddStudent,
  onAddTeacher,
  onAddGroup,
}) => {
  const actions = [
    {
      icon: FaUserPlus,
      label: "إضافة طالب",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      onClick: onAddStudent,
    },
    {
      icon: FaChalkboardTeacher,
      label: "إضافة معلم",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      onClick: onAddTeacher,
    },
    {
      icon: FaUsers,
      label: "إضافة حلقة",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      onClick: onAddGroup,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            bg-gradient-to-br ${action.color} ${action.hoverColor}
            text-white p-6 rounded-2xl shadow-lg 
            transform transition-all duration-300 
            hover:scale-105 hover:shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400
            active:scale-95
            group
          `}>
          <action.icon className="text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
          <p className="font-bold text-sm">{action.label}</p>
        </button>
      ))}
    </div>
  );
};
