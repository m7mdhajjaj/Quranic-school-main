import React, { useState } from "react";
import type { PieChartProps } from "../types";

export const PieChart: React.FC<PieChartProps> = ({ data, labels, colors }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, value) => sum + value, 0);
  const defaultColors = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
  ];

  let currentAngle = 0;
  const segments = data.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      percentage,
      angle,
      startAngle: currentAngle,
      color: colors?.[index] || defaultColors[index % defaultColors.length],
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
      {/* Pie Chart SVG */}
      <div className="relative" style={{ width: "280px", height: "280px" }}>
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const radius = isHovered ? 85 : 80;
            const x1 =
              100 + radius * Math.cos((segment.startAngle * Math.PI) / 180);
            const y1 =
              100 + radius * Math.sin((segment.startAngle * Math.PI) / 180);
            const x2 =
              100 +
              radius *
                Math.cos(
                  ((segment.startAngle + segment.angle) * Math.PI) / 180
                );
            const y2 =
              100 +
              radius *
                Math.sin(
                  ((segment.startAngle + segment.angle) * Math.PI) / 180
                );
            const largeArcFlag = segment.angle > 180 ? 1 : 0;

            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(" ");

            // استخراج الألوان بشكل آمن
            const colorParts = segment.color.split(" ");
            const fromColor = colorParts.find((c) => c.startsWith("from-"))?.replace("from-", "") || "#3b82f6";
            const toColor = colorParts.find((c) => c.startsWith("to-"))?.replace("to-", "") || "#2563eb";

            return (
              <g key={index}>
                <defs>
                  <linearGradient
                    id={`gradient-${index}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <stop offset="0%" stopColor={fromColor} />
                    <stop offset="100%" stopColor={toColor} />
                  </linearGradient>
                </defs>
                <path
                  d={pathData}
                  fill={`url(#gradient-${index})`}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  style={{
                    filter: isHovered
                      ? "drop-shadow(0 8px 16px rgba(0,0,0,0.2))"
                      : "none",
                    transformOrigin: "100px 100px",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* Center Circle */}
          <circle
            cx="100"
            cy="100"
            r="55"
            fill="white"
            className="drop-shadow-lg"
          />
          <circle cx="100" cy="100" r="50" fill="url(#centerGradient)" />

          <defs>
            <linearGradient
              id="centerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%">
              <stop offset="0%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>

          {/* Total Text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-3xl font-bold fill-gray-700"
            transform="rotate(90 100 100)">
            {total.toLocaleString()}
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="text-sm fill-gray-500"
            transform="rotate(90 100 100)">
            المجموع
          </text>
        </svg>

        {/* Hover Info */}
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-2xl border border-gray-200">
              <p className="text-center font-bold text-gray-700">
                {segments[hoveredIndex].percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {labels.map((label, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
              hoveredIndex === index
                ? "bg-gray-50 shadow-md transform scale-105"
                : "hover:bg-gray-50"
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}>
            <div
              className={`w-5 h-5 rounded-lg bg-gradient-to-br ${
                segments[index].color
              } shadow-md flex-shrink-0 transition-transform duration-300 ${
                hoveredIndex === index ? "scale-125" : ""
              }`}></div>
            <div className="flex-1">
              <p className="font-bold text-gray-700 text-sm">{label}</p>
              <p className="text-xs text-gray-500">
                {data[index].toLocaleString()} (
                {segments[index].percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
