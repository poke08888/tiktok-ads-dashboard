import React from 'react';
import { KPI } from '../types';

const KPIOverview: React.FC = () => {
  const kpiData: KPI[] = [
    { label: 'Revenue', value: '₫12,650,000', change: 23.4 },
    { label: 'Chi phí', value: '₫2,450,000', change: 12.5 },
    { label: '% Chi phí', value: '65%', change: -2.8 },
    { label: 'Orders', value: 156, change: 18.9 }
  ];

  const getChangeColorClass = (label: string, change: number | undefined) => {
    if (change === undefined) return 'text-gray-500';
    
    // Dành cho doanh thu và đơn hàng: tăng = tốt (xanh), giảm = xấu (đỏ)
    if (label === 'Revenue' || label === 'Orders') {
      return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
    }
    // Dành cho chi phí và % chi phí: tăng = xấu (đỏ), giảm = tốt (xanh)
    else if (label === 'Chi phí' || label === '% Chi phí') {
      return change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-gray-500';
    }
    // Trường hợp mặc định cho các KPI khác
    else {
      return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
    }
  };

  const getChangeIcon = (change: number | undefined) => {
    if (change === undefined) return null;
    if (change > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    if (change < 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {kpiData.map((kpi, index) => (
        <div key={index} className="card hover:shadow-md transition-shadow">
          <h3 className="text-sm text-gray-500 font-medium">{kpi.label}</h3>
          <div className="mt-2 flex items-baseline">
            <div className="text-2xl font-semibold">{kpi.value}</div>
            <div className={`ml-2 flex items-center ${getChangeColorClass(kpi.label, kpi.change)}`}>
              {getChangeIcon(kpi.change)}
              <span className="text-xs font-medium ml-0.5">{kpi.change !== undefined ? Math.abs(kpi.change) : 0}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1">vs. previous period</div>
        </div>
      ))}
    </div>
  );
};

export default KPIOverview;
