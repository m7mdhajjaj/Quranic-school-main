import React, { useState, useMemo } from "react";
import type { PieChartProps } from "../types";
import { COLOR_MAP, DEFAULT_PIE_COLORS } from "../Types/constants";
import { calculateChartSegments } from "../utils/chartUtils";

export const PieChart: React.FC<PieChartProps> = ({ data, labels, colors }) => {
  // useState للتفاعل مع UI فقط (hover state) - ليس منطق بيانات
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // استخدام utility function لحساب segments
  const { total, segments } = useMemo(
    () => calculateChartSegments(data, colors, DEFAULT_PIE_COLORS),
    [data, colors]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:gap-8 w-full">
      {/* Pie Chart SVG */}
      <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] aspect-square">
        <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
          <defs>
            {segments.map((segment, index) => {
              const colorParts = segment.color.split(" ");
              const fromColorClass =
                colorParts.find((c) => c.startsWith("from-"))?.replace("from-", "") || "green-500";
              const toColorClass =
                colorParts.find((c) => c.startsWith("to-"))?.replace("to-", "") || "green-600";

              const fromColor = COLOR_MAP[fromColorClass] || "#22c55e";
              const toColor = COLOR_MAP[toColorClass] || "#16a34a";

              return (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`pie-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%">
                  <stop offset="0%" stopColor={fromColor} />
                  <stop offset="100%" stopColor={toColor} />
                </linearGradient>
              );
            })}
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
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const radius = isHovered ? 95 : 90;
            
            // Calculate angles in radians
            const startRad = (segment.startAngle * Math.PI) / 180;
            const endRad = ((segment.startAngle + segment.angle) * Math.PI) / 180;
            
            // Calculate arc points
            const x1 = 100 + radius * Math.cos(startRad);
            const y1 = 100 + radius * Math.sin(startRad);
            const x2 = 100 + radius * Math.cos(endRad);
            const y2 = 100 + radius * Math.sin(endRad);
            
            // Large arc flag: 1 if angle > 180 degrees, 0 otherwise
            const largeArcFlag = segment.angle > 180 ? 1 : 0;

            // Build path data - ensure proper connection
            // استخدام sweep-flag = 1 للقوس (clockwise)
            const pathData = [
              `M 100 100`, // Move to center
              `L ${x1} ${y1}`, // Line to start point
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc to end point (clockwise, sweep=1)
              `Z`, // Close path back to center
            ].join(" ");

            return (
              <path
                key={`segment-${index}`}
                d={pathData}
                fill={`url(#pie-gradient-${index})`}
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
            );
          })}

          {/* Center Circle */}
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="white"
            className="drop-shadow-lg"
          />
          <circle cx="100" cy="100" r="55" fill="url(#centerGradient)" />

          {/* Total Text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-3xl sm:text-4xl font-bold fill-gray-700"
            fontSize="28"
            transform="rotate(90 100 100)">
            {total.toLocaleString()}
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="text-sm sm:text-base fill-gray-500"
            fontSize="14"
            transform="rotate(90 100 100)">
            المجموع
          </text>
        </svg>

        {/* Hover Info */}
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div className="bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-2xl border border-gray-200">
              <p className="text-center font-bold text-xs sm:text-sm text-gray-700">
                {segments[hoveredIndex].percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-md mx-auto">
        {labels.map((label, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-300 cursor-pointer ${
              hoveredIndex === index
                ? "bg-gray-50 shadow-lg border-2 border-green-300"
                : "hover:bg-gray-50 border border-gray-200"
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}>
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br ${
                segments[index].color
              } shadow-md flex-shrink-0 transition-all duration-300 ${
                hoveredIndex === index ? "shadow-lg ring-2 ring-green-300" : ""
              }`}></div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-700 text-xs sm:text-sm truncate" title={label}>{label}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {data[index].toLocaleString()} ({segments[index].percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
