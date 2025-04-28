import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RealtimeGaugeProps {
  value: number;
  maxValue: number;
  title: string;
  subtitle?: string;
  valueSuffix?: string;
}

const RealtimeGauge: React.FC<RealtimeGaugeProps> = ({ 
  value, 
  maxValue, 
  title,
  subtitle = 'Menoxi Mall',
  valueSuffix = 'VND'
}) => {
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    // Animate the value over time
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value]);

  const data = {
    datasets: [
      {
        data: [percentage, 1 - percentage],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',  // Blue for filled
          'rgba(229, 231, 235, 0.2)'  // Gray for empty
        ],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
      },
    ],
  };

  const options = {
    cutout: '85%',
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

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="relative h-72 flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h2 className="text-3xl font-bold mb-1">{formatNumber(animatedValue)}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
};

export default RealtimeGauge;
