import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useOrderList } from '../api/shopee';
import ShopeeAuthButton from './ShopeeAuthButton';
import { OrderListParams } from '../api/shopee';

interface TimeRangeOption {
  label: string;
  days: number;
}

const ShopeeOrdersTable: React.FC = () => {
  const timeRangeOptions: TimeRangeOption[] = [
    { label: '24 giờ qua', days: 1 },
    { label: '3 ngày qua', days: 3 },
    { label: '7 ngày qua', days: 7 },
    { label: '15 ngày qua', days: 15 }
  ];

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>(timeRangeOptions[1]);
  const [params, setParams] = useState<OrderListParams>({
    time_range_field: 'create_time',
    time_from: Math.floor(Date.now() / 1000) - (86400 * selectedTimeRange.days),
    time_to: Math.floor(Date.now() / 1000),
    page_size: 20
  });

  // Update params when time range changes
  useEffect(() => {
    setParams({
      ...params,
      time_from: Math.floor(Date.now() / 1000) - (86400 * selectedTimeRange.days),
      time_to: Math.floor(Date.now() / 1000)
    });
  }, [selectedTimeRange]);

  const { data, isLoading, isError, error, refetch } = useOrderList(params);

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    // Nếu là VND, không hiển thị số thập phân (phù hợp với tiền tệ VN)
    const currencyCode = currency || 'VND';
    
    // Chuyển đổi amount từ cent sang đơn vị tiền tệ chính
    // Shopee API thường trả về số tiền dạng cent, cần chia cho 100
    const normalizedAmount = amount / 100;
    
    try {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: currencyCode,
        minimumFractionDigits: currencyCode === 'VND' ? 0 : 2,
        maximumFractionDigits: currencyCode === 'VND' ? 0 : 2
      }).format(normalizedAmount);
    } catch (error) {
      console.error('Lỗi định dạng tiền tệ:', error);
      return `${normalizedAmount.toLocaleString()} ${currencyCode}`;
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'dd/MM/yyyy HH:mm');
  };

  // Map status code to Vietnamese text
  const mapOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'UNPAID': 'Chưa thanh toán',
      'READY_TO_SHIP': 'Chờ giao hàng',
      'PROCESSED': 'Đang xử lý',
      'SHIPPED': 'Đang giao hàng',
      'COMPLETED': 'Hoàn thành',
      'IN_CANCEL': 'Đang hủy',
      'CANCELLED': 'Đã hủy',
      'INVOICE_PENDING': 'Chờ hóa đơn'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Đơn hàng Shopee</h2>
        <div className="flex space-x-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.days}
              onClick={() => setSelectedTimeRange(option)}
              className={`px-3 py-1 text-sm rounded-md ${selectedTimeRange === option ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Hiển thị nút xác thực Shopee */}
      <ShopeeAuthButton />

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {isError && (
        // Kiểm tra nếu lỗi là do authentication
        <div>
          {error instanceof Error && (error.message.includes('Authentication required') || 
            error.message.includes('access_token') || 
            error.message.includes('invalid_acceess_token')) ? null : (
            <div className="bg-red-50 p-4 rounded-md mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu: {error.message}</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Vui lòng kiểm tra kết nối API Shopee trong phần Cài đặt.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && data && data.response?.order_list?.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>Không có đơn hàng nào trong khoảng thời gian này</p>
        </div>
      )}

      {!isLoading && !isError && data && data.response?.order_list?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người mua</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.response.order_list.map((order) => (
                <tr key={order.order_sn} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{order.order_sn}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(order.create_time)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.order_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.order_status === 'READY_TO_SHIP' ? 'bg-yellow-100 text-yellow-800' :
                      order.order_status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mapOrderStatus(order.order_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{order.buyer_username}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">{order.item_count}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right font-medium">
                    {formatCurrency(order.total_amount, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.response.more && (
            <div className="flex justify-center mt-4">
              <button
                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  if (data.response.next_cursor) {
                    setParams({
                      ...params,
                      cursor: data.response.next_cursor
                    });
                  }
                }}
                disabled={!data.response.next_cursor}
              >
                Tải thêm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopeeOrdersTable;
