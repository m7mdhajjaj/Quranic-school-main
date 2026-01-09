/**
 * Report Types
 * Type definitions for Reports functionality
 */

export interface Group {
  _id: string;
  name: string;
  totalStudents: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface MonthOption {
  value: string;
  label: string;
  month: number;
  year: number;
}

export interface ReportFiltersProps {
  selectedMonth: number | null;
  selectedYear: number | null;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
  userRole?: string;
  groups?: Group[];
  selectedGroupId?: string;
  onGroupChange?: (groupId: string) => void;
}

export interface ReportChartProps {
  labels: string[];
  data: number[];
  userRole: string;
  selectedMonth: number | null;
  selectedYear: number | null;
}

export interface UseReportDataReturn {
  loading: boolean;
  userRole: string;
  userId: string;
  chartData: ChartData;
  selectedMonth: number | null;
  selectedYear: number | null;
  setSelectedMonth: (month: number | null) => void;
  setSelectedYear: (year: number | null) => void;
  loadChartData: () => Promise<void>;
  groups: Group[];
  selectedGroupId: string;
  setSelectedGroupId: (groupId: string) => void;
}
