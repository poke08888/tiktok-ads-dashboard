// TikTok Business API configuration
export const TIKTOK_API_CONFIG = {
  // URL cho proxy server thay vì gọi trực tiếp đến TikTok API
  BASE_URL: 'http://localhost:4001/api/tiktok',
  DIRECT_API_URL: 'https://business-api.tiktok.com/open_api/v1.3',
  
  // Thông tin xác thực
  APP_ID: process.env.REACT_APP_TIKTOK_APP_ID || '',
  APP_SECRET: process.env.REACT_APP_TIKTOK_APP_SECRET || '',
  REDIRECT_URI: process.env.REACT_APP_TIKTOK_REDIRECT_URI || 'http://localhost:3000/tiktok/callback',
  API_VERSION: 'v1.3',
  
  // OAuth URLs - Bây giờ sử dụng qua proxy server
  AUTH_URL: 'http://localhost:4001/api/tiktok/auth',
  AUTH_STATUS_URL: 'http://localhost:4001/api/tiktok/auth/status',
  AUTH_REFRESH_URL: 'http://localhost:4001/api/tiktok/auth/refresh',
  AUTH_LOGOUT_URL: 'http://localhost:4001/api/tiktok/auth/logout',
  
  // OAuth URLs trực tiếp (legacy)
  DIRECT_AUTH_URL: 'https://ads.tiktok.com/marketing_api/auth',
  DIRECT_ACCESS_TOKEN_URL: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
  DIRECT_REFRESH_TOKEN_URL: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/',
  
  // Token management configuration
  TOKEN_REFRESH_THRESHOLD_SEC: 1800, // Làm mới token khi còn 30 phút trước khi hết hạn
  
  // Các endpoints
  REPORT_URL: '/report/integrated/get/',
  CAMPAIGN_LIST_URL: '/campaign/get/',
  AUDIENCE_INSIGHTS_URL: '/audience/analysis/',
  CREATIVE_LIST_URL: '/creative/ads/get/',
  
  // Scope yêu cầu - kết hợp cả hai loại scope cần thiết
  SCOPES: ['user_info', 'ad.read', 'ad.write', 'ads_read', 'campaign_list', 'report_read', 'audience_insights_read', 'creative_read'],
};

// Shopee API Config
export const SHOPEE_API_CONFIG = {
  // Sử dụng proxy server thật
  BASE_URL: 'http://localhost:4000/api/shopee',
  API_VERSION: 'v2',
  PARTNER_ID: process.env.REACT_APP_SHOPEE_PARTNER_ID || '',
  PARTNER_KEY: process.env.REACT_APP_SHOPEE_PARTNER_KEY || '',
  SHOP_ID: process.env.REACT_APP_SHOPEE_SHOP_ID || '',
  
  // Các endpoints - Đơn hàng
  ORDER_LIST_URL: '/order/get_order_list',
  ORDER_DETAIL_URL: '/order/get_order_detail',
  CANCEL_ORDER_URL: '/order/cancel_order',
  SHIP_ORDER_URL: '/order/ship_order',
  
  // Logistics & Vận chuyển
  SHIPPING_DOCUMENT_URL: '/logistics/get_shipping_document',
  TRACKING_INFO_URL: '/logistics/get_tracking_info',
  SHIPPING_PARAMETER_URL: '/logistics/get_shipping_parameter',
  
  // Sản phẩm
  PRODUCT_LIST_URL: '/product/get_item_list',
  PRODUCT_DETAIL_URL: '/product/get_item_base_info',
  PRODUCT_MODELS_URL: '/product/get_model_list',
  
  // Thống kê & Báo cáo
  SHOP_PERFORMANCE_URL: '/shop/get_shop_performance',
  ACCOUNT_HEALTH_URL: '/account_health/shop_performance',
  TRANSACTION_LIST_URL: '/payment/get_transaction_list',
  
  // Thời gian tối đa (tính bằng ngày) để truy vấn đơn hàng theo API Shopee
  MAX_ORDER_HISTORY_DAYS: 15,
  
  // Token management configuration
  TOKEN_REFRESH_THRESHOLD_SEC: 1800, // Làm mới token khi còn 30 phút trước khi hết hạn
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tiktok_access_token',
  REFRESH_TOKEN: 'tiktok_refresh_token',
  ADVERTISER_ID: 'tiktok_advertiser_id',
  TOKEN_EXPIRY: 'tiktok_token_expiry',
  SHOPEE_AUTH_DATA: 'shopee_auth_data',
};
