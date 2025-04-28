import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyTrendChart: React.FC = () => {
  // Ngày trong tuần
  const labels = ['18/04', '19/04', '20/04', '21/04', '22/04', '23/04', '24/04'];

  // Dữ liệu doanh thu theo ngày
  const revenueData = [
    3200000, 2950000, 3450000, 3100000, 3650000, 4100000, 3750000
  ];

  // Dữ liệu số đơn hàng theo ngày
  const orderData = [
    123, 118, 135, 120, 142, 158, 145
  ];

  // Dữ liệu đang giao hàng theo ngày
  const shippingData = [
    85, 78, 92, 82, 96, 105, 98
  ];

  // Sử dụng type any để tránh các lỗi khi kết hợp nhiều loại biểu đồ
  const data: any = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Tổng doanh thu',
        data: revenueData,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Tổng số đơn hàng',
        data: orderData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        fill: false,
        yAxisID: 'y1',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Đang giao hàng',
        data: shippingData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        fill: false,
        yAxisID: 'y1',
        order: 0,
      }
    ],
  };

  // Sử dụng type any cho options để tránh lỗi với các biểu đồ kết hợp
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(224, 224, 224, 0.5)',
        },
        ticks: {
          callback: function(value: any) {
            const num = Number(value);
            if (num >= 1000000) {
              return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
              return (num / 1000).toFixed(0) + 'K';
            }
            return num;
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 200,
        ticks: {
          stepSize: 50,
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        padding: 12,
        boxWidth: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset?.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset?.yAxisID === 'y') {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(context.parsed?.y);
            } else {
              label += context.parsed?.y;
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Xu hướng bán hàng 7 ngày qua</h2>
      <div className="h-80 p-2">
        <Chart type='bar' data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyTrendChart;
