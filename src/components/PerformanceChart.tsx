import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceChart: React.FC = () => {
  // Sample data for the chart - 24 giờ trong ngày
  const labels = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', 
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
  
  // Simulating View data trend theo giờ
  const viewData = [
    8200, 7500, 7000, 6800, 6500, 7000,
    7800, 9000, 10500, 11200, 11800, 12000,
    11500, 11000, 10800, 10500, 10800, 11200,
    11800, 12500, 12000, 11200, 10000, 9000
  ].map(val => val * 10); // Nhân với 10 để có giá trị lớn hơn
  
  // Simulating CTR data trend theo giờ (biểu thị dưới dạng %)
  const ctrData = [
    1.25, 1.22, 1.18, 1.15, 1.12, 1.20,
    1.35, 1.50, 1.65, 1.78, 1.85, 1.90,
    1.88, 1.85, 1.80, 1.78, 1.82, 1.87,
    1.95, 2.05, 2.00, 1.88, 1.75, 1.45
  ];
  
  // Simulating CVR data trend theo giờ (biểu thị dưới dạng %)
  const cvrData = [
    2.10, 2.05, 2.00, 1.95, 1.90, 2.00,
    2.15, 2.25, 2.40, 2.55, 2.65, 2.70,
    2.65, 2.60, 2.55, 2.52, 2.58, 2.65,
    2.75, 2.85, 2.80, 2.65, 2.50, 2.30
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'View',
        data: viewData,
        borderColor: 'rgba(255, 159, 64, 0.9)',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 3,
        yAxisID: 'y', // Trục Y bên trái cho giá trị số lượng
      },
      {
        label: 'CTR',
        data: ctrData,
        borderColor: '#4F97FF',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 3,
        yAxisID: 'y1', // Trục Y bên phải cho giá trị phần trăm
      },
      {
        label: 'CVR',
        data: cvrData,
        borderColor: '#4AE9AA',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 3,
        yAxisID: 'y1', // Trục Y bên phải cho giá trị phần trăm
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      // Trục Y bên trái cho giá trị số lượng (View)
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Lượt xem',
          color: '#4F97FF',
          font: {
            size: 12,
          }
        },
        grid: {
          color: '#e2e8f0',
          // TypeScript không nhận diện borderDash nhưng Chart.js hỗ trợ thuộc tính này
          // @ts-ignore
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'decimal',
              maximumFractionDigits: 1,
            }).format(Number(value) / 1000) + 'K';
          }
        }
      },
      // Trục Y bên phải cho giá trị phần trăm (CTR, CVR)
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tỷ lệ (%)',
          color: '#FF4B4B',
          font: {
            size: 12,
          }
        },
        // Cài đặt giá min, max và stepSize để trục Y bên phải hiển thị đẹp hơn
        min: 0,
        max: 5,
        grid: {
          drawOnChartArea: false, // chỉ hiển thị grid cho trục Y bên trái
        },
        ticks: {
          callback: function(value) {
            return value + '%';  // luôn hiển thị dưới dạng phần trăm
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            
            // Hiển thị dưới dạng % nếu là CTR hoặc CVR, số lượng nếu là View
            if (label.includes('CTR') || label.includes('CVR')) {
              return `${label}${value.toFixed(2)}%`;
            } else {
              return `${label}${new Intl.NumberFormat('vi-VN').format(value)}`;
            }
          },
          // Thêm tiêu đề cho tooltip để hiển thị giờ rõ ràng hơn
          title: (tooltipItems) => {
            const item = tooltipItems[0];
            if (!item) return '';
            return `Giờ: ${item.label}`;
          }
        }
      }
    }
  };

  // Metrics cards for View, CTR, CVR
  const metrics = [
    { label: 'View', value: '82.000', change: 3.48, color: 'rgba(255, 159, 64, 0.9)' },
    { label: 'CTR', value: '1.85%', change: 3.45, color: '#4F97FF' },
    { label: 'CVR', value: '2.60%', change: 3.48, color: '#4AE9AA' },
  ];

  const getChangeColorClass = (label: string, change: number) => {
    // Đối với tất cả các metrics hiển thị hiện tại (View, CTR, CVR), tăng là tốt (xanh), giảm là xấu (đỏ)
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4" 
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{metric.label}</h3>
                <p className="text-xl font-bold mt-1">{metric.value}</p>
              </div>
              <div className="flex items-center">
                <div className={`text-xs font-medium ${getChangeColorClass(metric.label, metric.change)}`}>
                  {metric.change < 0 ? '-' : '+'}{Math.abs(metric.change)}%
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${getChangeColorClass(metric.label, metric.change)}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">so với giờ trước</p>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Tổng quan theo giờ</h2>
        <div className="h-80 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
