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

const HourlyTrendChart: React.FC = () => {
  // Khung giờ trong ngày từ 00:00 đến 23:00
  const labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', 
                 '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', 
                 '19:00', '20:00', '21:00', '22:00', '23:00'];

  // Dữ liệu lượt xem hôm nay theo giờ
  const viewTodayData = [
    3500, 2800, 2500, 1800, 1500, 1900, 
    3200, 4800, 6200, 7800, 8500, 9200, 
    8800, 8200, 7500, 6900, 7300, 8100, 
    9500, 10500, 9800, 8500, 6800, 5200
  ].map(val => val * 10); // Nhân với 10 để có giá trị lớn hơn

  // Dữ liệu lượt xem hôm qua theo giờ
  const viewYesterdayData = [
    3200, 2600, 2300, 1900, 1400, 1700, 
    2900, 4400, 5800, 7200, 8200, 8800, 
    8500, 7900, 7100, 6600, 7000, 7700, 
    9000, 9800, 9200, 8100, 6400, 4900
  ].map(val => val * 10); // Nhân với 10 để có giá trị lớn hơn

  // Dữ liệu CTR hôm nay theo giờ (%)
  const ctrTodayData = [
    1.25, 1.22, 1.18, 1.15, 1.12, 1.20,
    1.35, 1.50, 1.65, 1.78, 1.85, 1.90,
    1.88, 1.85, 1.80, 1.78, 1.82, 1.87,
    1.95, 2.05, 2.00, 1.88, 1.75, 1.45
  ];
  
  // Dữ liệu CVR hôm nay theo giờ (%)
  const cvrTodayData = [
    2.10, 2.05, 2.00, 1.95, 1.90, 2.00,
    2.15, 2.25, 2.40, 2.55, 2.65, 2.70,
    2.65, 2.60, 2.55, 2.52, 2.58, 2.65,
    2.75, 2.85, 2.80, 2.65, 2.50, 2.30
  ];

  // Dữ liệu lượt xem giờ này hôm qua
  const yesterdaySameHourData: Array<number | null> = [
    null, null, null, null, null, null, 
    null, null, null, null, null, null, 
    null, null, null, null, null, null, 
    null, null, null, null, null, null
  ];

  // Cập nhật dữ liệu hôm qua giờ này dựa vào giờ hiện tại
  const currentHour = new Date().getHours();
  if (currentHour < labels.length) {
    yesterdaySameHourData[currentHour] = viewYesterdayData[currentHour];
  }

  // Dữ liệu cho biểu đồ kết hợp
  // Tính toán giá trị lớn nhất của view để căn chỉnh tỷ lệ trục y
  const maxView = Math.max(...viewTodayData);
  
  // Tỷ lệ điều chỉnh % để hiển thị trên cùng đồ thị với lượt xem
  const percentageScale = maxView / 3;
  
  const data: any = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'View hôm nay',
        data: viewTodayData,
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        borderRadius: 4,
        categoryPercentage: 0.5, 
        barPercentage: 0.8,
        yAxisID: 'y',
        order: 3,
      },
      {
        type: 'line' as const,
        label: 'View hôm qua',
        data: viewYesterdayData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
        order: 4,
      },
      {
        type: 'line' as const,
        label: 'CTR hôm nay',
        data: ctrTodayData.map(value => value * percentageScale),
        borderColor: 'rgba(79, 151, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'CVR hôm nay',
        data: cvrTodayData.map(value => value * percentageScale),
        borderColor: 'rgba(74, 233, 170, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
        order: 2,
      }
    ],
  };

  // Sử dụng type "any" để tránh các lỗi khi kết hợp các loại biểu đồ khác nhau
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
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Lượt xem',
          color: '#4F97FF',
          font: {
            size: 12,
          }
        },
        border: {
          display: false
        },
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
        position: 'left',
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
        ticks: {
          callback: function(value: any) {
            return (value / percentageScale).toFixed(1) + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false // Tắt hoàn toàn hiển thị legend
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        padding: 12,
        boxWidth: 10,
        usePointStyle: true,
        callbacks: {
          title: function(tooltipItems: any[]) {
            return `${tooltipItems[0]?.label || ''}`;
          },
          label: function(context: any) {
            let label = context.dataset?.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed?.y !== null) {
              // Hiển thị dưới dạng % nếu là CTR hoặc CVR
              if (label.includes('CTR') || label.includes('CVR')) {
                // Lấy giá trị gốc (chưa nhân với percentageScale)
                return `${label}${(context.parsed.y / percentageScale).toFixed(2)}%`;
              } else {
                // Hiển thị số lượng cho View
                return `${label}${new Intl.NumberFormat('vi-VN').format(context.parsed.y)}`;
              }
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Xu hướng lượng truy cập theo giờ</h2>
      <div className="h-80 p-2">
        <Chart type='bar' data={data} options={options} />
      </div>
    </div>
  );
};

export default HourlyTrendChart;
