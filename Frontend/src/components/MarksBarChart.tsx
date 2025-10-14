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
        barThickness: window.innerWidth < 640 ? 40 : 50, // عرض البار responsive
        maxBarThickness: window.innerWidth < 640 ? 50 : 60, // أقصى عرض
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "مخطط المعدلات",
        font: {
          size: window.innerWidth < 640 ? 14 : 16,
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
          stepSize: 20,
          font: {
            size: window.innerWidth < 640 ? 9 : 11,
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
          display: window.innerWidth >= 640,
          text: "المعدل (من 100)",
          font: {
            size: 12,
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
            size: window.innerWidth < 640 ? 10 : 12,
          },
          color: "#374151",
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="w-full">
      {/* Chart Container with responsive height */}
      <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
        <Bar data={chartData} options={options} />
      </div>

      {/* Display values below chart - bigger and more visible */}
      <div className="flex flex-wrap justify-center items-center mt-4 sm:mt-6 px-1 sm:px-2 gap-2 sm:gap-3">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm p-3 sm:p-4 min-w-[70px] sm:min-w-[90px] md:min-w-[110px] border-2 border-emerald-200 hover:shadow-md transition-shadow">
            <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
              {labels[index]}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-600 tracking-tight">
                {value ? value.toFixed(1) : "0"}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-emerald-700 mt-1 font-medium">
              من 100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarksBarChart;
