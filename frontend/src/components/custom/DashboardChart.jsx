import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Card } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        borderDash: [4, 4],
        color: '#E2E8F0'
      },
      beginAtZero: true
    }
  }
};

export const DashboardChart = ({ type = 'line', title, data, loading = false }) => {
  if (loading) {
    return (
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="h-64 bg-slate-100 rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={{ ...chartOptions, scales: undefined }} />;
      case 'line':
      default:
        return <Line data={data} options={chartOptions} />;
    }
  };

  return (
    <Card 
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid={`chart-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
      </div>
      <div className="p-6">
        <div className="h-64">
          {renderChart()}
        </div>
      </div>
    </Card>
  );
};