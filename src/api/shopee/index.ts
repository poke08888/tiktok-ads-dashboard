import createShopeeApiClient from './apiClient';

/**
 * Interface cho tham số của hàm getOrderList
 */
export interface OrderListParams {
  time_range_field?: 'create_time' | 'update_time';
  time_from?: number; // Unix timestamp in seconds
  time_to?: number; // Unix timestamp in seconds
  page_size?: number;
  cursor?: string;
  order_status?: 'UNPAID' | 'READY_TO_SHIP' | 'PROCESSED' | 'SHIPPED' | 'COMPLETED' | 'IN_CANCEL' | 'CANCELLED' | 'INVOICE_PENDING';
  response_optional_fields?: string[];
}

/**
 * Interface cho đơn hàng từ Shopee API
 */
export interface ShopeeOrder {
  order_sn: string;
  order_status: string;
  total_amount: number;
  currency: string;
  create_time: number;
  update_time: number;
  days_to_ship: number;
  ship_by_date: number;
  buyer_user_id: number;
  buyer_username: string;
  estimated_shipping_fee: number;
  payment_method: string;
  item_count: number;
  // Có thể mở rộng thêm các trường khác nếu cần
}

/**
 * Interface cho response của API get_order_list
 */
export interface OrderListResponse {
  error: string;
  message: string;
  response: {
    more: boolean;
    next_cursor: string;
    order_list: ShopeeOrder[];
  };
  request_id: string;
}

/**
 * Lấy danh sách đơn hàng từ Shopee API
 * @param params Tham số để lọc đơn hàng
 * @returns Promise với danh sách đơn hàng
 */
export const getOrderList = async (params: OrderListParams = {}) => {
  try {
    const apiClient = createShopeeApiClient();
    const { SHOPEE_API_CONFIG } = await import('../config');
    
    // Thiết lập tham số mặc định nếu không được cung cấp
    const defaultParams: OrderListParams = {
      time_range_field: 'create_time',
      time_from: Math.floor(Date.now() / 1000) - (86400 * 3), // 3 ngày trước
      time_to: Math.floor(Date.now() / 1000), // hiện tại
      page_size: 20,
      response_optional_fields: [
        'order_status',
        'total_amount',
        'currency',
        'buyer_username',
        'payment_method',
        'estimated_shipping_fee',
        'item_count'
      ]
    };
    
    // Merge params được truyền vào với params mặc định
    const mergedParams = { ...defaultParams, ...params };
    
    // Gọi API get_order_list qua proxy server - đảm bảo endpoint và tham số đúng
    // Lưu ý: proxy server đã cấu hình cụ thể đường dẫn /api/shopee/order/get_order_list
    const response = await apiClient.get('/order/get_order_list', {
      params: mergedParams
    });
    
    return response.data as OrderListResponse;
  } catch (error) {
    console.error('Error fetching Shopee orders:', error);
    throw error;
  }
};

/**
 * Hook sử dụng React Query để lấy danh sách đơn hàng
 * @param params Tham số để lọc đơn hàng
 * @returns Object chứa data, status, error và các hàm refetch
 */
import { useQuery } from '@tanstack/react-query';

export const useOrderList = (params: OrderListParams = {}) => {
  return useQuery({
    queryKey: ['shopeeOrders', params],
    queryFn: () => getOrderList(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    enabled: true // Tự động fetch khi component mount
  });
};

export default {
  getOrderList,
  useOrderList
};
