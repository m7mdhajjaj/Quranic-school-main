/**
 * Utility functions لحسابات الرسوم البيانية
 * هذه حسابات عرض فقط (presentation logic) وليست business logic
 */

export interface ChartSegment {
  percentage: number;
  angle: number;
  startAngle: number;
  color: string;
}

/**
 * حساب segments للرسم البياني (Donut/Pie Chart)
 * @param data - البيانات (أرقام)
 * @param colors - الألوان
 * @param defaultColors - الألوان الافتراضية
 * @returns { total, segments }
 */
export const calculateChartSegments = (
  data: number[],
  colors: string[],
  defaultColors: string[]
): { total: number; segments: ChartSegment[] } => {
  const sum = data.reduce((acc, value) => acc + value, 0);
  
  // إذا لم تكن هناك بيانات، إرجاع قيم فارغة
  if (sum === 0 || data.length === 0) {
    return { total: 0, segments: [] };
  }
  
  // البدء من 0 لأن SVG يدور -90 درجة بالفعل
  let currentAngle = 0;
  
  const segments: ChartSegment[] = data.map((value, index) => {
    const percentage = (value / sum) * 100;
    const angle = (percentage / 100) * 360;
    const segment: ChartSegment = {
      percentage,
      angle,
      startAngle: currentAngle,
      color: colors?.[index] || defaultColors[index % defaultColors.length],
    };
    currentAngle += angle;
    return segment;
  });
  
  // تصحيح الزاوية الأخيرة للتأكد من اكتمال الدائرة (دقة عالية)
  const totalAngle = segments.reduce((acc, seg) => acc + seg.angle, 0);
  const angleDiff = 360 - totalAngle;
  
  // إذا كان الفرق صغير جداً (أقل من 0.01)، نصححه
  if (Math.abs(angleDiff) > 0.01 && segments.length > 0) {
    segments[segments.length - 1].angle += angleDiff;
    // تحديث النسبة المئوية للقطاع الأخير
    segments[segments.length - 1].percentage = (segments[segments.length - 1].angle / 360) * 100;
  }
  
  return { total: sum, segments };
};
