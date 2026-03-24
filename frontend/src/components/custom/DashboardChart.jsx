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
        font: { family: "'Inter', sans-serif", size: 12 }
      }
    }
  },
  scales: {
    x: { 
      grid: { display: false },
      title: {
        display: true,
        text: 'Month',
        font: { size: 12 }
      }
    },
    y: { 
      grid: { borderDash: [4, 4], color: '#E2E8F0' }, 
      beginAtZero: true,
      title: {
        display: true,
        text: 'Value',
        font: { size: 12 }
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { family: "'Inter', sans-serif", size: 12 }
      }
    }
  }
};

// Month names mapping
const monthNames = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
};

export const DashboardChart = ({ 
  type = 'line', 
  title = 'Untitled', 
  data = [], 
  loading = false,
  color = '#6366F1'
}) => {
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

  // Validate and process data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
        </div>
        <div className="p-6 h-64 flex items-center justify-center">
          <p className="text-slate-400">No data available</p>
        </div>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.map(item => monthNames[item.month] || `Month ${item.month}`),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value || 0),
        fill: type === 'line',
        backgroundColor: type === 'doughnut' 
          ? ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981', '#F59E0B']
          : color,
        borderColor: color,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        ...(type === 'bar' && {
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        })
      }
    ]
  };

  const renderChart = () => {
    try {
      switch (type) {
        case 'bar':
          return <Bar data={chartData} options={chartOptions} />;
        case 'doughnut':
          return <Doughnut data={chartData} options={doughnutOptions} />;
        case 'line':
        default:
          return <Line data={chartData} options={chartOptions} />;
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          Error rendering chart
        </div>
      );
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