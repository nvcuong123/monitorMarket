import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  indexAxis: "y",
  plugins: {
    title: {
      display: true,
      text: "Chart.js Bar Chart - Stacked",
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
  labels,
  datasets: [
    {
      label: "Long",
      data: labels.map(() => faker.datatype.number({ min: 0, max: 50 })),
      backgroundColor: "rgb(75, 192, 192)",
    },
    {
      label: "Short",
      data: labels.map(() => faker.datatype.number({ min: 0, max: 50 })),
      backgroundColor: "rgb(255, 99, 132)",
    },
  ],
};

const StackBarChart = (props) => {
  return <Bar options={options} data={data} {...props} />;
};

export default StackBarChart;
