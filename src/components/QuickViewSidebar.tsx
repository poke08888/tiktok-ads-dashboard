// Component này đã bị loại bỏ khỏi dashboard theo yêu cầu
// Giữ lại để tham khảo nếu cần trong tương lai
import React, { useState } from 'react';

const QuickViewSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Sample data for a selected campaign
  const campaign = {
    id: '1',
    name: 'Summer Collection 2025',
    status: 'active',
    budget: 5000000,
    spend: 3250000,
    spendPercent: 65,
    impressions: 86452,
    clicks: 2432,
    ctr: 2.81,
    cvr: 3.7,
    cpc: 13365,
    cpa: 36111,
    conversions: 90,
    revenue: 5850000,
    orders: 90,
    cancelledOrders: 6,
    roas: 1.8,
    startDate: '2025-04-15',
    endDate: '2025-05-15',
    objective: 'conversions'
  };

  // Sample data for device breakdown
  const deviceData = [
    { name: 'Mobile', value: 68 },
    { name: 'Desktop', value: 24 },
    { name: 'Tablet', value: 8 }
  ];

  // Sample data for placement breakdown
  const placementData = [
    { name: 'In-Feed', value: 45 },
    { name: 'For You Page', value: 38 },
    { name: 'Search Results', value: 12 },
    { name: 'Others', value: 5 }
  ];

  // Sample data for top ad groups
  const adGroups = [
    { id: '1', name: 'Women\'s Collection', impressions: 42500, clicks: 1250, conversions: 48, ctr: 2.94 },
    { id: '2', name: 'Men\'s Collection', impressions: 28750, clicks: 820, conversions: 32, ctr: 2.85 },
    { id: '3', name: 'Accessories', impressions: 15202, clicks: 362, conversions: 10, ctr: 2.38 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Function to generate a color based on index
  const getChartColor = (index: number) => {
    const colors = ['#FE2C55', '#20AAFF', '#00BA88', '#8C5BFF', '#FF9431', '#FF5247'];
    return colors[index % colors.length];
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold">Campaign Details</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center mb-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${campaign.status === 'active' ? 'bg-green-500' : campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
            <h3 className="font-medium text-gray-800">{campaign.name}</h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(campaign.status)} mr-2`}>
              {getStatusLabel(campaign.status)}
            </span>
            <span>
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'summary' ? 'text-tiktok-blue border-b-2 border-tiktok-blue' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'creative' ? 'text-tiktok-blue border-b-2 border-tiktok-blue' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('creative')}
            >
              Creative
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'analytics' ? 'text-tiktok-blue border-b-2 border-tiktok-blue' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'summary' && (
          <div>
            {/* Budget Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Budget Usage</h4>
                <span className="text-sm font-semibold">{campaign.spendPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-tiktok-blue h-2 rounded-full"
                  style={{ width: `${campaign.spendPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>₫{campaign.spend.toLocaleString('vi-VN')}</span>
                <span>₫{campaign.budget.toLocaleString('vi-VN')}</span>
              </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Impressions</div>
                <div className="text-lg font-semibold">{campaign.impressions.toLocaleString('vi-VN')}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Clicks</div>
                <div className="text-lg font-semibold">{campaign.clicks.toLocaleString('vi-VN')}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">CTR</div>
                <div className="text-lg font-semibold">{campaign.ctr.toFixed(2)}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Avg. CPC</div>
                <div className="text-lg font-semibold">₫{campaign.cpc.toLocaleString('vi-VN')}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Conversions</div>
                <div className="text-lg font-semibold">{campaign.conversions}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">CVR</div>
                <div className="text-lg font-semibold">{campaign.cvr.toFixed(2)}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Revenue</div>
                <div className="text-lg font-semibold">₫{campaign.revenue.toLocaleString('vi-VN')}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">ROAS</div>
                <div className="text-lg font-semibold">{campaign.roas.toFixed(2)}x</div>
              </div>
            </div>

            {/* Top Ad Groups */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Ad Groups</h4>
              <div className="space-y-3">
                {adGroups.map((group) => (
                  <div key={group.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{group.name}</span>
                      <span className="text-xs text-gray-500">CTR: {group.ctr.toFixed(2)}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Impr.</div>
                        <div className="text-sm font-medium">{(group.impressions / 1000).toFixed(1)}K</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Clicks</div>
                        <div className="text-sm font-medium">{group.clicks}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Conv.</div>
                        <div className="text-sm font-medium">{group.conversions}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creative' && (
          <div>
            {/* Creative Preview */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Creative Preview</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                <div className="aspect-w-9 aspect-h-16 bg-gray-100 relative">
                  <img
                    src="https://via.placeholder.com/270x480/f3f4f6/a3a3a3?text=TikTok+Ad+Preview"
                    alt="Ad Preview"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <h5 className="font-medium text-sm">Summer Collection 2025</h5>
                  <p className="text-xs text-gray-500 mt-1">Discover our latest summer styles with great discounts!</p>
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex space-x-2 mb-4">
                <div className="w-1/4 aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden border-2 border-tiktok-blue">
                  <img
                    src="https://via.placeholder.com/80/f3f4f6/a3a3a3?text=Ad+1"
                    alt="Ad Thumbnail 1"
                    className="object-cover"
                  />
                </div>
                <div className="w-1/4 aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src="https://via.placeholder.com/80/f3f4f6/a3a3a3?text=Ad+2"
                    alt="Ad Thumbnail 2"
                    className="object-cover"
                  />
                </div>
                <div className="w-1/4 aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src="https://via.placeholder.com/80/f3f4f6/a3a3a3?text=Ad+3"
                    alt="Ad Thumbnail 3"
                    className="object-cover"
                  />
                </div>
                <div className="w-1/4 aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src="https://via.placeholder.com/80/f3f4f6/a3a3a3?text=Ad+4"
                    alt="Ad Thumbnail 4"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Creative Stats */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Watch Time</div>
                    <div className="text-sm font-medium">12.3s avg.</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Completion Rate</div>
                    <div className="text-sm font-medium">48.6%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Shares</div>
                    <div className="text-sm font-medium">423</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Comments</div>
                    <div className="text-sm font-medium">156</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            {/* Device Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Device Breakdown</h4>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex mb-4">
                  {deviceData.map((item, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div
                        className="mx-auto rounded-full"
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: getChartColor(index)
                        }}
                      ></div>
                      <div className="mt-1">
                        <div className="text-xs font-medium">{item.name}</div>
                        <div className="text-sm font-semibold">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-6 flex rounded-full overflow-hidden">
                  {deviceData.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: getChartColor(index)
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Placement Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Placement Breakdown</h4>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {placementData.map((item, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getChartColor(index) }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: getChartColor(index)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Insights */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Audience Insights</h4>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Age Distribution</h5>
                <div className="space-y-2">
                  {[
                    { label: '18-24', value: 42 },
                    { label: '25-34', value: 28 },
                    { label: '35-44', value: 18 },
                    { label: '45-54', value: 8 },
                    { label: '55+', value: 4 }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-tiktok-blue h-1.5 rounded-full"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Gender</h5>
                <div className="flex">
                  <div className="flex-1 text-center">
                    <div className="text-tiktok-red text-xl font-semibold">65%</div>
                    <div className="text-xs mt-1">Female</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-tiktok-blue text-xl font-semibold">35%</div>
                    <div className="text-xs mt-1">Male</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickViewSidebar;
