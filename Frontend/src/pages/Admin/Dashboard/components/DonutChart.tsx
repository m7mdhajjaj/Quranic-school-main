import React, { useState, useMemo, useCallback } from "react";
import type { PieChartProps } from "../types";
import { COLOR_MAP, DEFAULT_DONUT_COLORS } from "../Types/constants";
import { calculateChartSegments } from "../utils/chartUtils";

export const DonutChart: React.FC<PieChartProps> = ({ data, labels, colors }) => {
  // useState للتفاعل مع UI فقط (hover state) - ليس منطق بيانات
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // استخدام utility function لحساب segments
  const { total, segments } = useMemo(
    () => calculateChartSegments(data, colors, DEFAULT_DONUT_COLORS),
    [data, colors]
  );

  const handleSegmentClick = useCallback((index: number) => {
    setHoveredIndex((prev) => prev === index ? null : index);
  }, []);

  const outerRadius = 95;
  const innerRadius = 60; // Donut hole
  const centerX = 100;
  const centerY = 100;

  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:gap-8 w-full">
      {/* Donut Chart SVG */}
      <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square">
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
                  id={`donut-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%">
                  <stop offset="0%" stopColor={fromColor} />
                  <stop offset="100%" stopColor={toColor} />
                </linearGradient>
              );
            })}
          </defs>
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const radius = isHovered ? outerRadius + 3 : outerRadius;

            // Calculate angles in radians
            const startRad = (segment.startAngle * Math.PI) / 180;
            const endRad = ((segment.startAngle + segment.angle) * Math.PI) / 180;

            // Calculate outer arc points
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            // Calculate inner arc points
            const x3 = centerX + innerRadius * Math.cos(endRad);
            const y3 = centerY + innerRadius * Math.sin(endRad);
            const x4 = centerX + innerRadius * Math.cos(startRad);
            const y4 = centerY + innerRadius * Math.sin(startRad);

            // Large arc flag: 1 if angle > 180 degrees, 0 otherwise
            const largeArcFlag = segment.angle > 180 ? 1 : 0;

            // Build path data - ensure proper connection
            // استخدام sweep-flag = 1 للقوس الخارجي (clockwise) و 0 للداخلي (counter-clockwise)
            const pathData = [
              `M ${x1} ${y1}`, // Move to outer start point
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc (clockwise, sweep=1)
              `L ${x3} ${y3}`, // Line to inner end point
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (counter-clockwise, sweep=0)
              `Z`, // Close path back to start
            ].join(" ");

            return (
              <path
                key={`segment-${index}`}
                d={pathData}
                fill={`url(#donut-gradient-${index})`}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isHovered
                    ? "drop-shadow(0 8px 16px rgba(0,0,0,0.2))"
                    : "none",
                  transformOrigin: "100px 100px",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  opacity: isHovered ? 0.9 : 1,
                }}
                onClick={() => handleSegmentClick(index)}
              />
            );
          })}
        </svg>

        {/* Center Circle with Total */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[130px] sm:w-[140px] aspect-square">
          <div className="bg-white rounded-full w-full h-full flex flex-col items-center justify-center shadow-lg border-2 border-gray-100">
            <p className="text-3xl sm:text-4xl font-bold text-gray-800">{total.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">إجمالي الطلاب</p>
            {hoveredIndex !== null && (
              <div className="mt-1 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-[10px] sm:text-xs font-bold text-green-700">
                  {segments[hoveredIndex].percentage.toFixed(1)}%
                </p>
                <p className="text-[9px] sm:text-xs text-gray-600 truncate max-w-[90px] sm:max-w-none">{labels[hoveredIndex]}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 sm:gap-3 max-h-80 overflow-y-auto pr-1 w-full max-w-md mx-auto">
        {labels.map((label, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-300 cursor-pointer ${
              hoveredIndex === index
                ? "bg-green-50 shadow-lg border-2 border-green-400"
                : "border border-gray-200"
            }`}
            onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}>
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br ${
                segments[index].color
              } shadow-md flex-shrink-0 transition-all duration-300 ${
                hoveredIndex === index ? "shadow-lg ring-2 ring-green-300" : ""
              }`}></div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-xs sm:text-sm transition-colors duration-300 truncate ${
                hoveredIndex === index ? "text-green-700" : "text-gray-700"
              }`} title={label}>{label}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {data[index].toLocaleString()} طالب ({segments[index].percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
