import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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
        label: "العلامات",
        data,
        backgroundColor: "#10b981",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "مخطط العلامات",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default MarksBarChart;
