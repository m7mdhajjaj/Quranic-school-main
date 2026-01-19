import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";

interface DonutChartProps {
  data: number[];
  labels: string[];
  colors: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_SIZE = Math.min(SCREEN_WIDTH - 80, 300);
const CENTER = CHART_SIZE / 2;
const OUTER_RADIUS = CHART_SIZE / 2 - 20;
const INNER_RADIUS = OUTER_RADIUS * 0.6;

const COLOR_MAP: Record<string, string> = {
  "green-500": "#10B981",
  "green-600": "#059669",
  "emerald-500": "#10B981",
  "emerald-600": "#059669",
  "teal-500": "#14B8A6",
  "teal-600": "#0D9488",
  "blue-500": "#3B82F6",
  "blue-600": "#2563EB",
  "purple-500": "#A855F7",
  "purple-600": "#9333EA",
};

const parseColor = (colorString: string): { from: string; to: string } => {
  const parts = colorString.split(" ");
  const fromPart = parts.find((p) => p.startsWith("from-"));
  const toPart = parts.find((p) => p.startsWith("to-"));
  
  const from = fromPart
    ? COLOR_MAP[fromPart.replace("from-", "")] || "#10B981"
    : "#10B981";
  const to = toPart
    ? COLOR_MAP[toPart.replace("to-", "")] || "#059669"
    : "#059669";
  
  return { from, to };
};

export const DonutChart: React.FC<DonutChartProps> = ({ data, labels, colors }) => {
  const total = useMemo(() => data.reduce((sum, val) => sum + val, 0), [data]);

  const segments = useMemo(() => {
    if (total === 0) return [];
    
    let currentAngle = -90; // Start from top
    return data.map((value, index) => {
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      
      const segment = {
        value,
        percentage,
        startAngle: currentAngle,
        angle,
        color: colors[index] || "from-green-500 to-green-600",
        label: labels[index] || "",
      };
      
      currentAngle += angle;
      return segment;
    });
  }, [data, labels, colors, total]);

  const createPath = (startAngle: number, angle: number, outerRadius: number, innerRadius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const x1 = CENTER + outerRadius * Math.cos(startRad);
    const y1 = CENTER + outerRadius * Math.sin(startRad);
    const x2 = CENTER + outerRadius * Math.cos(endRad);
    const y2 = CENTER + outerRadius * Math.sin(endRad);
    
    const x3 = CENTER + innerRadius * Math.cos(endRad);
    const y3 = CENTER + innerRadius * Math.sin(endRad);
    const x4 = CENTER + innerRadius * Math.cos(startRad);
    const y4 = CENTER + innerRadius * Math.sin(startRad);
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  if (total === 0 || segments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>لا توجد بيانات</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          <Defs>
            {segments.map((segment, index) => {
              const { from, to } = parseColor(segment.color);
              return (
                <LinearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={from} />
                  <Stop offset="100%" stopColor={to} />
                </LinearGradient>
              );
            })}
          </Defs>
          
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={createPath(segment.startAngle, segment.angle, OUTER_RADIUS, INNER_RADIUS)}
              fill={`url(#gradient-${index})`}
            />
          ))}
          
          {/* Center Circle */}
          <Circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="#FFFFFF" />
        </Svg>
        
        {/* Center Text */}
        <View style={styles.centerText}>
          <Text style={styles.totalValue}>{total.toLocaleString()}</Text>
          <Text style={styles.totalLabel}>إجمالي الطلاب</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((segment, index) => {
          const { from } = parseColor(segment.color);
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: from }]} />
              <View style={styles.legendText}>
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {segment.label}
                </Text>
                <Text style={styles.legendValue}>
                  {segment.value.toLocaleString()} طالب ({segment.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  totalLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  legend: {
    width: "100%",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendText: {
    flex: 1,
    minWidth: 0,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  legendValue: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});
