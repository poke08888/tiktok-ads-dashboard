import React, { useState } from 'react';
import { useTopPerformingContent } from '../hooks/useTikTokApi';
import { format, subDays } from 'date-fns';

const TopPerformingContent: React.FC = () => {
  // Thiết lập mặc định để hiển thị 5 nội dung có hiệu suất cao nhất trong 7 ngày qua
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  
  // State để sắp xếp bảng
  const [sortBy, setSortBy] = useState<string>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Lấy dữ liệu từ TikTok API
  const { data, creatives, isLoading, error } = useTopPerformingContent(startDate, endDate, 5);
  
  // Hàm format tiền tệ
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  // Hàm format phần trăm
  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };
  
  // Biến đổi dữ liệu API thành dữ liệu bảng
  const transformData = () => {
    if (!data || data.length === 0) {
      // Trả về dữ liệu mẫu nếu không có dữ liệu thật
      return getDummyData();
    }
    
    return data.map(item => {
      const adId = item.dimensions.ad_id || '';
      const creative = creatives[adId];
      
      return {
        id: adId,
        title: creative?.ad_name || 'Nội dung TikTok',
        thumbnailUrl: creative?.thumbnail_url || 'https://placehold.co/100x60?text=Video',
        revenue: item.metrics.total_revenue || 0,
        cost: item.metrics.spend || 0,
        costPercent: (item.metrics.spend || 0) / (item.metrics.total_revenue || 1) * 100,
        cpm: item.metrics.cost_per_1000_reached || 0,
        ctr: item.metrics.click_through_rate || 0,
        cvr: item.metrics.conversion_rate || 0
      };
    });
  };
  
  // Tạo dữ liệu mẫu
  const getDummyData = () => {
    return [
      {
        id: '1',
        title: 'Bộ sưu tập mùa hè mới nhất',
        thumbnailUrl: 'https://placehold.co/100x60?text=Summer',
        revenue: 3250000,
        cost: 780000,
        costPercent: 24,
        cpm: 42000,
        ctr: 2.8,
        cvr: 3.5
      },
      {
        id: '2',
        title: 'Khuyến mãi cuối tuần - Giảm 30%',
        thumbnailUrl: 'https://placehold.co/100x60?text=Sale',
        revenue: 2800000,
        cost: 560000,
        costPercent: 20,
        cpm: 38000,
        ctr: 3.2,
        cvr: 2.9
      },
      {
        id: '3',
        title: 'Hướng dẫn phối đồ cùng influencer',
        thumbnailUrl: 'https://placehold.co/100x60?text=Tips',
        revenue: 1950000,
        cost: 430000,
        costPercent: 22,
        cpm: 35000,
        ctr: 2.5,
        cvr: 2.3
      },
      {
        id: '4',
        title: 'Sản phẩm best-seller tháng này',
        thumbnailUrl: 'https://placehold.co/100x60?text=Best',
        revenue: 1725000,
        cost: 395000,
        costPercent: 23,
        cpm: 36000,
        ctr: 2.3,
        cvr: 2.1
      },
      {
        id: '5',
        title: 'Bộ sưu tập giới hạn - Coming soon',
        thumbnailUrl: 'https://placehold.co/100x60?text=Limited',
        revenue: 1340000,
        cost: 375000,
        costPercent: 28,
        cpm: 40000,
        ctr: 1.9,
        cvr: 1.8
      }
    ];
  };
  
  // Dữ liệu bảng đã biến đổi
  const tableData = transformData();
  
  // Hàm sắp xếp
  const handleSort = (column: string) => {
    // Nếu nhấp vào cùng một cột, đảo ngược thứ tự sắp xếp
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu nhấp vào cột khác, đặt cột mới và mặc định giảm dần
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // Sắp xếp dữ liệu theo trường đã chọn
  const sortedData = [...tableData].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy as keyof typeof a] > b[sortBy as keyof typeof b] ? 1 : -1;
    } else {
      return a[sortBy as keyof typeof a] < b[sortBy as keyof typeof b] ? 1 : -1;
    }
  });
  
  // Render arrow indicator for sort
  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };
  
  return (
    <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Top 5 nội dung hiệu suất cao nhất</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nội dung
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('revenue')}
              >
                Doanh thu{renderSortArrow('revenue')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('cost')}
              >
                Chi phí{renderSortArrow('cost')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('costPercent')}
              >
                % Chi phí{renderSortArrow('costPercent')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('cpm')}
              >
                CPM{renderSortArrow('cpm')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('ctr')}
              >
                CTR{renderSortArrow('ctr')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('cvr')}
              >
                CVR{renderSortArrow('cvr')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-15 w-25 mr-4">
                      <img className="h-15 w-25 rounded" src={item.thumbnailUrl} alt="" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(item.revenue)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(item.cost)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPercent(item.costPercent)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(item.cpm)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPercent(item.ctr)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPercent(item.cvr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-t">
          <p>Đã xảy ra lỗi khi tải dữ liệu.</p>
        </div>
      )}
      
      <div className="p-3 bg-gray-50 text-xs text-gray-500">
        <p>Dữ liệu từ {startDate} đến {endDate}, sắp xếp theo {sortBy} {sortOrder === 'desc' ? 'giảm dần' : 'tăng dần'}</p>
      </div>
    </div>
  );
};

export default TopPerformingContent;
