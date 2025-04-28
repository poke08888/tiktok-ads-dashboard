import React, { useState } from 'react';
import { Campaign } from '../types';

const CampaignTable: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Campaign>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Sample campaign data
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Collection 2025',
      status: 'active',
      budget: 5000000,
      spend: 3250000,
      spendPercent: 65,
      impressions: 86452,
      traffic: 12689,
      clicks: 2432,
      ctr: 2.81,
      cvr: 3.21,
      cpc: 13365,
      cpa: 36111,
      conversions: 90,
      revenue: 5850000,
      orders: 90,
      aov: 65000,
      roas: 1.8,
      cancelledOrders: 6,
      cancelledRevenue: 390000,
      cancelledRevenuePercent: 6.67,
      startDate: '2025-04-15',
      endDate: '2025-05-15',
      objective: 'conversions'
    },
    {
      id: '2',
      name: 'App Install Campaign',
      status: 'active',
      budget: 8000000,
      spend: 2950000,
      spendPercent: 36.88,
      impressions: 62452,
      traffic: 8920,
      clicks: 2356,
      ctr: 3.77,
      cvr: 2.12,
      cpc: 12520,
      cpa: 59000,
      conversions: 50,
      revenue: 3750000,
      orders: 50,
      aov: 75000,
      roas: 1.27,
      cancelledOrders: 3,
      cancelledRevenue: 225000,
      cancelledRevenuePercent: 6,
      startDate: '2025-04-10',
      endDate: '2025-05-10',
      objective: 'app_install'
    },
    {
      id: '3',
      name: 'Brand Awareness',
      status: 'paused',
      budget: 3000000,
      spend: 1250000,
      spendPercent: 41.67,
      impressions: 37548,
      traffic: 5080,
      clicks: 644,
      ctr: 1.71,
      cvr: 2.48,
      cpc: 19410,
      cpa: 78125,
      conversions: 16,
      revenue: 1050000,
      orders: 16,
      aov: 65625,
      roas: 0.84,
      cancelledOrders: 1,
      cancelledRevenue: 65625,
      cancelledRevenuePercent: 6.25,
      startDate: '2025-04-05',
      endDate: '2025-05-05',
      objective: 'video_views'
    },
    {
      id: '4',
      name: 'Clearance Sale',
      status: 'completed',
      budget: 2000000,
      spend: 2000000,
      spendPercent: 100,
      impressions: 42542,
      traffic: 6240,
      clicks: 1250,
      ctr: 2.94,
      cvr: 4.8,
      cpc: 16000,
      cpa: 33333,
      conversions: 60,
      revenue: 3000000,
      orders: 60,
      aov: 50000,
      roas: 1.5,
      cancelledOrders: 4,
      cancelledRevenue: 200000,
      cancelledRevenuePercent: 6.67,
      startDate: '2025-03-25',
      endDate: '2025-04-15',
      objective: 'conversions'
    },
    {
      id: '5',
      name: 'New User Acquisition',
      status: 'active',
      budget: 10000000,
      spend: 5600000,
      spendPercent: 56,
      impressions: 102548,
      traffic: 15840,
      clicks: 3458,
      ctr: 3.37,
      cvr: 2.31,
      cpc: 16195,
      cpa: 70000,
      conversions: 80,
      revenue: 6800000,
      orders: 80,
      aov: 85000,
      roas: 1.21,
      cancelledOrders: 5,
      cancelledRevenue: 425000,
      cancelledRevenuePercent: 6.25,
      startDate: '2025-04-01',
      endDate: '2025-05-01',
      objective: 'traffic'
    }
  ];

  const handleSort = (field: keyof Campaign) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  const formatCurrency = (value: number) => {
    return `₫${value.toLocaleString('vi-VN')}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

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

  const getSortIcon = (field: keyof Campaign) => {
    if (field !== sortField) {
      return (
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="card mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Campaigns</h2>
        <div className="flex gap-2">
          <button className="text-xs text-tiktok-blue font-medium">Save View</button>
          <button className="text-xs text-tiktok-blue font-medium">Column Settings</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  Campaign Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th scope="col" className="table-th">Status</th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('budget')}>
                <div className="flex items-center">
                  Budget
                  {getSortIcon('budget')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('spend')}>
                <div className="flex items-center">
                  Chi phí
                  {getSortIcon('spend')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('spendPercent')}>
                <div className="flex items-center">
                  % Chi phí
                  {getSortIcon('spendPercent')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('impressions')}>
                <div className="flex items-center">
                  Impressions
                  {getSortIcon('impressions')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('traffic')}>
                <div className="flex items-center">
                  Traffic
                  {getSortIcon('traffic')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('clicks')}>
                <div className="flex items-center">
                  Clicks
                  {getSortIcon('clicks')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('ctr')}>
                <div className="flex items-center">
                  CTR (%)
                  {getSortIcon('ctr')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('cvr')}>
                <div className="flex items-center">
                  CVR (%)
                  {getSortIcon('cvr')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('cpc')}>
                <div className="flex items-center">
                  Avg. CPC
                  {getSortIcon('cpc')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('cpa')}>
                <div className="flex items-center">
                  CPA
                  {getSortIcon('cpa')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('conversions')}>
                <div className="flex items-center">
                  Conversions
                  {getSortIcon('conversions')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('revenue')}>
                <div className="flex items-center">
                  Revenue
                  {getSortIcon('revenue')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('orders')}>
                <div className="flex items-center">
                  Orders
                  {getSortIcon('orders')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('aov')}>
                <div className="flex items-center">
                  AOV
                  {getSortIcon('aov')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('roas')}>
                <div className="flex items-center">
                  ROAS
                  {getSortIcon('roas')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('cancelledOrders')}>
                <div className="flex items-center">
                  Đơn hủy
                  {getSortIcon('cancelledOrders')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('cancelledRevenue')}>
                <div className="flex items-center">
                  Doanh thu đơn hủy
                  {getSortIcon('cancelledRevenue')}
                </div>
              </th>
              <th scope="col" className="table-th cursor-pointer" onClick={() => handleSort('cancelledRevenuePercent')}>
                <div className="flex items-center">
                  Tỷ lệ doanh thu hủy (%)
                  {getSortIcon('cancelledRevenuePercent')}
                </div>
              </th>
              <th scope="col" className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCampaigns.map((campaign) => (
              <tr 
                key={campaign.id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="table-td font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${campaign.status === 'active' ? 'bg-green-500' : campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                    {campaign.name}
                  </div>
                </td>
                <td className="table-td">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </td>
                <td className="table-td">{formatCurrency(campaign.budget)}</td>
                <td className="table-td">{formatCurrency(campaign.spend)}</td>
                <td className="table-td">{formatPercent(campaign.spendPercent)}</td>
                <td className="table-td">{formatNumber(campaign.impressions)}</td>
                <td className="table-td">{formatNumber(campaign.traffic)}</td>
                <td className="table-td">{formatNumber(campaign.clicks)}</td>
                <td className="table-td">{formatPercent(campaign.ctr)}</td>
                <td className="table-td">{formatPercent(campaign.cvr)}</td>
                <td className="table-td">{formatCurrency(campaign.cpc)}</td>
                <td className="table-td">{formatCurrency(campaign.cpa)}</td>
                <td className="table-td">{formatNumber(campaign.conversions)}</td>
                <td className="table-td">{formatCurrency(campaign.revenue)}</td>
                <td className="table-td">{formatNumber(campaign.orders)}</td>
                <td className="table-td">{formatCurrency(campaign.aov)}</td>
                <td className="table-td">{campaign.roas.toFixed(2)}x</td>
                <td className="table-td">{formatNumber(campaign.cancelledOrders)}</td>
                <td className="table-td">{formatCurrency(campaign.cancelledRevenue)}</td>
                <td className="table-td">{formatPercent(campaign.cancelledRevenuePercent)}</td>
                <td className="table-td">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      {campaign.status === 'paused' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4 px-4 py-2 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{campaigns.length}</span> of <span className="font-medium">{campaigns.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-500">Previous</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-800 font-medium">1</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-500">Next</button>
        </div>
      </div>
    </div>
  );
};

export default CampaignTable;
