import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MetricsGaugeProps {
  percentage: number;
  title: string;
  metrics: {
    label: string;
    value: number;
    color: string;
  }[];
}

const MetricsGauge: React.FC<MetricsGaugeProps> = ({ percentage, title, metrics }) => {
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ['#5470ff', '#e6eaff'],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
        cutout: '75%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  return (
    <div className="card h-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold">{percentage}%</span>
            <div className="bg-gray-300 px-3 py-1 rounded-full text-sm font-medium text-gray-700 mt-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 w-full">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: metric.color }}></div>
              <div className="text-xs">
                <div className="font-medium">{metric.label}</div>
                <div className="text-gray-500">{formatValue(metric.value)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsGauge;
