// TikTok Business API configuration
export const TIKTOK_API_CONFIG = {
  // Thay YOUR_APP_ID và YOUR_APP_SECRET bằng giá trị thật từ TikTok Dev Portal
  APP_ID: process.env.REACT_APP_TIKTOK_APP_ID || 'YOUR_APP_ID',
  APP_SECRET: process.env.REACT_APP_TIKTOK_APP_SECRET || 'YOUR_APP_SECRET',
  
  // Base URLs - URLs chính xác từ TikTok Business API Documentation
  BASE_URL: 'https://business-api.tiktok.com/open_api/v1.2', 
  AUTH_URL: 'https://business-api.tiktok.com/portal/auth',
  ACCESS_TOKEN_URL: 'https://business-api.tiktok.com/open_api/v1.2/oauth2/access_token/',
  REFRESH_TOKEN_URL: 'https://business-api.tiktok.com/open_api/v1.2/oauth2/refresh_token/',
  
  // Các endpoints
  REPORT_URL: '/report/integrated/get/',
  CAMPAIGN_LIST_URL: '/campaign/get/',
  AUDIENCE_INSIGHTS_URL: '/audience/analysis/',
  CREATIVE_LIST_URL: '/creative/ads/get/',
  
  // Redirect URI - đổi thành domain thật khi deploy
  REDIRECT_URI: process.env.REACT_APP_TIKTOK_REDIRECT_URI || 'http://localhost:3002/auth/tiktok/callback',
  
  // Scope yêu cầu
  SCOPES: ['ads_read', 'campaign_list', 'report_read', 'audience_insights_read', 'creative_read'],
};

// Shopee API Config
export const SHOPEE_API_CONFIG = {
  // Sử dụng proxy server thật
  BASE_URL: 'http://localhost:4000/api/shopee',
  API_VERSION: 'v2',
  PARTNER_ID: process.env.REACT_APP_SHOPEE_PARTNER_ID || '',
  PARTNER_KEY: process.env.REACT_APP_SHOPEE_PARTNER_KEY || '',
  SHOP_ID: process.env.REACT_APP_SHOPEE_SHOP_ID || '',
  
  // Các endpoints
  ORDER_LIST_URL: '/order/get_order_list',
  ORDER_DETAIL_URL: '/order/get_order_detail',
  
  // Thời gian tối đa (tính bằng ngày) để truy vấn đơn hàng theo API Shopee
  MAX_ORDER_HISTORY_DAYS: 15,
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tiktok_access_token',
  REFRESH_TOKEN: 'tiktok_refresh_token',
  ADVERTISER_ID: 'tiktok_advertiser_id',
  TOKEN_EXPIRY: 'tiktok_token_expiry',
  SHOPEE_AUTH_DATA: 'shopee_auth_data',
};
