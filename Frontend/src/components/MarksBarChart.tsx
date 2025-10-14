import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarksBarChart = ({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "المعدل",
        data,
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 50, // عرض البار
        maxBarThickness: 60, // أقصى عرض
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "مخطط المعدلات",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#1f2937",
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `المعدل: ${context.parsed.y.toFixed(1)} من 100`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          font: {
            size: 11,
          },
          color: "#6b7280",
          callback: function (value) {
            return value;
          },
        },
        grid: {
          color: "#e5e7eb",
        },
        title: {
          display: true,
          text: "المعدل (من 100)",
          font: {
            size: 13,
            weight: "bold",
          },
          color: "#374151",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#374151",
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="w-full relative">
      <Bar data={chartData} options={options} />
      {/* Display values on top of bars */}
      <div className="flex justify-around mt-2 px-8">
        {data.map((value, index) => (
          <div key={index} className="text-center">
            <span className="text-sm font-bold text-emerald-600">
              {value ? value.toFixed(1) : "0"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarksBarChart;
