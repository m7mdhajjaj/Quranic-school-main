export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  totalExams: number;
  averageExamMarks: number;
  activeStudents: number;
  attendanceRate: number;
}

export interface GroupDistribution {
  groupName: string;
  studentCount: number;
  percentage?: number;
}

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: string;
  onClick?: () => void;
  percentage?: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface BarChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
  maxValue?: number;
}

export interface PieChartProps {
  data: number[];
  labels: string[];
  colors: string[];
  onSegmentClick?: (
    label: string,
    value: number,
    percentage: number,
    color: string,
    index: number
  ) => void;
}

export interface SelectedGroup {
  name: string;
  count: number;
  percentage: number;
  color: string;
  index: number;
}
