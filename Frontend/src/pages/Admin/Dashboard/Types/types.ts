export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalAssistants: number;
  totalSecretaries: number;
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
  onClick?: () => void;
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

export interface ChartsData {
  groupDistribution: Array<{ _id: string; count: number }>;
  genderDistribution: Array<{ _id: string; count: number }>;
  marksDistribution: any[];
  attendanceByMonth: any[];
  topStudents?: Array<{
    name: string;
    value: number;
    avgMark?: number;
    attendanceRate?: number;
  }>;
  topTeachers?: Array<{
    name: string;
    value: number;
    studentCount?: number;
    marksCount?: number;
    attendanceCount?: number;
    memorizedCount?: number;
    reviewCount?: number;
  }>;
}

export interface ProcessedChartData {
  labels: string[];
  data: number[];
  colors: string[];
}
