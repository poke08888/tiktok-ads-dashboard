import React from 'react';
import { Recommendation } from '../types';

const RecommendationsPanel: React.FC = () => {
  // Sample recommendations data
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Tăng ngân sách cho "Summer Collection 2025"',
      description: 'Chiến dịch có ROAS tốt (1.8x) và còn dư địa tăng trưởng. Bạn nên tăng ngân sách thêm 20% để tối ưu hiệu quả.',
      impact: 'high',
      type: 'budget',
      campaignId: '1'
    },
    {
      id: '2',
      title: 'Tối ưu giá thầu cho nhóm quảng cáo "Men\'s Collection"',
      description: 'CPC cao hơn trung bình 15%. Giảm giá thầu 10% sẽ giúp giảm chi phí mà vẫn duy trì hiệu suất.',
      impact: 'medium',
      type: 'bid',
      campaignId: '1'
    },
    {
      id: '3',
      title: 'Tạm dừng 2 quảng cáo hiệu suất thấp',
      description: 'Hai quảng cáo trong chiến dịch "Brand Awareness" có CTR < 0.8%, thấp hơn 60% so với trung bình.',
      impact: 'medium',
      type: 'creative',
      campaignId: '3'
    },
    {
      id: '4',
      title: 'Mở rộng đối tượng cho "App Install Campaign"',
      description: 'Hãy thêm nhóm tuổi 18-24 vào đối tượng mục tiêu. Nhóm tuổi này có tỷ lệ cài đặt cao hơn 25%.',
      impact: 'high',
      type: 'targeting',
      campaignId: '2'
    }
  ];

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">High Impact</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium Impact</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Low Impact</span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'bid':
        return (
          <div className="rounded-full bg-purple-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'creative':
        return (
          <div className="rounded-full bg-pink-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'targeting':
        return (
          <div className="rounded-full bg-green-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recommendations</h2>
        <div className="flex items-center text-sm">
          <span className="text-gray-500 mr-2">Sort by:</span>
          <select className="input-field py-1 text-sm pr-8">
            <option>Impact</option>
            <option>Date</option>
            <option>Type</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                {getTypeIcon(recommendation.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
                  {getImpactBadge(recommendation.impact)}
                </div>
                <p className="mt-1 text-sm text-gray-600">{recommendation.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs font-medium bg-tiktok-blue text-white rounded-md hover:bg-blue-600 transition-colors">
                      Apply
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      Dismiss
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-tiktok-blue font-medium hover:underline">
          View All Recommendations
        </button>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
