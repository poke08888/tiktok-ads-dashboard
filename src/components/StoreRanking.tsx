import React from 'react';

interface StoreData {
  id: number;
  name: string;
  revenue: number;
  percentage: number;
  change: number;
}

const StoreRanking: React.FC = () => {
  // Mock data for store rankings
  const storeData: StoreData[] = [
    { id: 1, name: 'Meroxi Mall', revenue: 6119588, percentage: 58.87, change: 3.2 },
    { id: 2, name: 'MENGW Official', revenue: 2989094, percentage: 28.75, change: 2.1 },
    { id: 3, name: 'FunnyEyes', revenue: 635178, percentage: 6.11, change: -1.5 },
    { id: 4, name: 'FUNNY ELVES', revenue: 407300, percentage: 3.92, change: 0.8 },
    { id: 5, name: 'PUCO Global', revenue: 244600, percentage: 2.35, change: -0.5 },
    { id: 6, name: 'KOC', revenue: 0, percentage: 0.00, change: 0 }
  ];

  // Format currency as VND
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return value.toFixed(2) + '%';
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Xếp hạng cửa hàng</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">
            Tỷ lệ cửa hàng
          </button>
          <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            Kiểm ngạnh bán hàng
          </button>
          <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            Số lượng đơn hàng
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa hàng</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storeData.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{store.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-700 font-medium text-sm">{store.name.substring(0, 2)}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(store.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end">
                    <span className={`text-${store.change >= 0 ? 'green' : 'red'}-600 mr-2`}>
                      {store.change >= 0 ? '+' : ''}{store.change}%
                    </span>
                    <span className="font-medium">{formatPercentage(store.percentage)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreRanking;
