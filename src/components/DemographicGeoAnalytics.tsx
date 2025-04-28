import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DemographicGeoAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demographic' | 'geographic'>('demographic');

  // Demographic data - age and gender
  const genderData = {
    labels: ['Nam', 'Nữ'],
    datasets: [
      {
        data: [58, 42],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ageData = {
    labels: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'],
    datasets: [
      {
        label: 'Phân bố độ tuổi',
        data: [5, 38, 30, 15, 8, 4],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const ageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Phân bố theo độ tuổi (%)',
      },
    },
  };
  
  const genderOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Phân bố theo giới tính (%)',
      },
    },
  };

  // Geographic data - city/region
  const locationData = {
    labels: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác'],
    datasets: [
      {
        label: 'Phân bố theo vị trí',
        data: [32, 41, 8, 6, 5, 8],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const locationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Phân bố theo vị trí địa lý (%)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  // Device data
  const deviceData = {
    labels: ['iOS', 'Android', 'Web', 'Khác'],
    datasets: [
      {
        data: [45, 48, 6, 1],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(201, 203, 207, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const deviceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Phân bố theo thiết bị (%)',
      },
    },
  };

  return (
    <div className="card mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Phân tích người dùng</h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeTab === 'demographic' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('demographic')}
          >
            Nhân khẩu học
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeTab === 'geographic' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('geographic')}
          >
            Địa lý &amp; thiết bị
          </button>
        </div>
      </div>

      {activeTab === 'demographic' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-base font-medium text-gray-700 mb-2">Phân bố theo độ tuổi</h3>
            <div className="h-64">
              <Bar data={ageData} options={ageOptions} />
            </div>
          </div>
          
          {/* Gender Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-base font-medium text-gray-700 mb-2">Phân bố theo giới tính</h3>
            <div className="h-64 flex justify-center">
              <div style={{width: '70%', height: '100%'}}>
                <Pie data={genderData} options={genderOptions} />
              </div>
            </div>
          </div>
          
          {/* Demographic Insights */}
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-base font-medium text-blue-700 mb-2">Thông tin chi tiết</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Nhóm đối tượng chính: <strong>18-34 tuổi (chiếm 68%)</strong></span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Nam giới có tỷ lệ tương tác cao hơn <strong>12%</strong> so với nữ giới</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Nhóm 25-34 tuổi có tỷ lệ chuyển đổi cao nhất: <strong>3.2%</strong></span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>So với tuần trước: Tăng <strong>5%</strong> người dùng trong nhóm 18-24 tuổi</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Geographic Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-base font-medium text-gray-700 mb-2">Phân bố theo vị trí</h3>
            <div className="h-64">
              <Bar data={locationData} options={locationOptions} />
            </div>
          </div>
          
          {/* Device Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-base font-medium text-gray-700 mb-2">Phân bố theo thiết bị</h3>
            <div className="h-64 flex justify-center">
              <div style={{width: '70%', height: '100%'}}>
                <Pie data={deviceData} options={deviceOptions} />
              </div>
            </div>
          </div>
          
          {/* Geographic Insights */}
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-base font-medium text-blue-700 mb-2">Thông tin chi tiết</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Khu vực chính: <strong>TP. HCM và Hà Nội (73%)</strong></span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Đà Nẵng có tăng trưởng mạnh nhất: <strong>+18%</strong> so với tuần trước</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Người dùng Android có tỷ lệ chuyển đổi cao hơn iOS: <strong>+0.8%</strong></span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Gợi ý: Tăng ngân sách quảng cáo cho khu vực Đà Nẵng và thiết bị Android</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicGeoAnalytics;
