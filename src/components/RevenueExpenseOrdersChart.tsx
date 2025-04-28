import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueExpenseOrdersChart: React.FC = () => {
  // Tạo dữ liệu cho 24 giờ trong ngày
  const labels = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', 
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
  
  // Dữ liệu lượt xem theo giờ
  const viewData = [
    8500, 5200, 3200, 1800, 1200, 2000, 
    4500, 8200, 12500, 16800, 19200, 21500,
    19500, 18500, 17200, 16800, 18500, 22500, 
    24800, 25800, 21500, 18500, 14500, 10500
  ].map(val => val * 10); // Nhân với 10 để có giá trị lớn hơn
  
  // Dữ liệu CTR theo giờ (biểu thị dưới dạng %)
  const ctrData = [
    1.25, 1.22, 1.18, 1.15, 1.12, 1.20,
    1.35, 1.50, 1.65, 1.78, 1.85, 1.90,
    1.88, 1.85, 1.80, 1.78, 1.82, 1.87,
    1.95, 2.05, 2.00, 1.88, 1.75, 1.45
  ];
  
  // Dữ liệu CVR theo giờ (biểu thị dưới dạng %)
  const cvrData = [
    2.10, 2.05, 2.00, 1.95, 1.90, 2.00,
    2.15, 2.25, 2.40, 2.55, 2.65, 2.70,
    2.65, 2.60, 2.55, 2.52, 2.58, 2.65,
    2.75, 2.85, 2.80, 2.65, 2.50, 2.30
  ];

  // Tính toán giá trị lớn nhất của view để căn chỉnh tỷ lệ trục y
  const maxView = Math.max(...viewData);
  
  // Tỷ lệ điều chỉnh % để hiển thị trên cùng đồ thị với lượt xem
  const percentageScale = maxView / 3;

  const data = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'View',
        data: viewData,
        borderColor: 'rgba(255, 159, 64, 0.9)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
        pointHoverBorderColor: 'rgba(255, 159, 64, 1)',
        yAxisID: 'y',
        order: 1
      },
      {
        type: 'line' as const,
        label: 'CTR',
        data: ctrData.map(value => value * percentageScale), // Áp dụng tỷ lệ để hiển thị cùng đồ thị
        borderColor: 'rgba(100, 150, 220, 0.9)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgba(100, 150, 220, 1)',
        pointHoverBorderColor: 'rgba(100, 150, 220, 1)',
        yAxisID: 'y1',
        order: 2
      },
      {
        type: 'line' as const,
        label: 'CVR',
        data: cvrData.map(value => value * percentageScale), // Áp dụng tỷ lệ để hiển thị cùng đồ thị
        backgroundColor: 'rgba(100, 116, 228, 0.6)',
        borderColor: 'rgba(74, 233, 170, 0.9)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgba(74, 233, 170, 1)',
        pointHoverBorderColor: 'rgba(74, 233, 170, 1)',
        yAxisID: 'y1',
        order: 3
      }
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Tắt hiển thị legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            let value = context.raw as number;
            
            // Chuyển đổi lại giá trị % từ giá trị đã được điều chỉnh tỷ lệ
            if (context.dataset.label === 'CTR' || context.dataset.label === 'CVR') {
              value = value / percentageScale;
              return `${label}: ${value.toFixed(2)}%`;
            } else {
              return `${label}: ${new Intl.NumberFormat('vi-VN').format(value)}`;
            }
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: '#8e97a3',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
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
          color: 'rgba(200, 200, 200, 0.15)',
          drawOnChartArea: true,
          drawTicks: false
        },
        ticks: {
          color: '#8e97a3',
          font: {
            size: 12
          },
          // Định dạng số lượng
          callback: function(value) {
            return (Number(value) / 1000).toFixed(0) + 'K';
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tỷ lệ (%)',
          color: '#FF4B4B',
          font: {
            size: 12
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true,
        min: 0,
        max: Math.max(...ctrData) * percentageScale * 1.2,
        ticks: {
          callback: function(value: any) {
            return (value / percentageScale).toFixed(1) + '%';
          }
        }
      }
    }
  };

  return (
    <div className="card p-5 mb-8">
      <h2 className="text-lg font-semibold mb-4">Tổng quan theo giờ</h2>
      <div className="h-80 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
        <Chart type="bar" data={data as any} options={options} />
      </div>
    </div>
  );
};

export default RevenueExpenseOrdersChart;
