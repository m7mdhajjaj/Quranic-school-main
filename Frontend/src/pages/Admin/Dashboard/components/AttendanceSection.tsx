import React from "react";
import { Card } from "@/components/UI/Card";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

interface AttendanceData {
  present: number;
  absent: number;
  late: number;
}

interface AttendanceSectionProps {
  data: AttendanceData;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  data,
}) => {
  const total = data.present + data.absent + data.late;

  const stats = [
    {
      label: "حاضر",
      value: data.present,
      icon: FaCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "غائب",
      value: data.absent,
      icon: FaTimesCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      label: "متأخر",
      value: data.late,
      icon: FaClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaCheckCircle className="text-blue-600" />
        الحضور لهذا الشهر
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const percentage = total > 0 ? (stat.value / total) * 100 : 0;

          return (
            <div
              key={index}
              className={`
                ${stat.bgColor} ${stat.borderColor} border-2 rounded-xl p-5
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg
              `}>
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`text-3xl ${stat.color}`} />
                <span className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-700 mb-2">
                {stat.label}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${stat.bgColor.replace(
                    "50",
                    "500"
                  )} transition-all duration-1000`}
                  style={{ width: `${percentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-right">
                {percentage.toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
