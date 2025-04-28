import axios from 'axios';
import { SHOPEE_API_CONFIG } from '../config';

// For debugging - khi cần debug thì set thành true
const DEBUG = true;

/**
 * Tạo axios instance đã được cấu hình sẵn cho Shopee Open API
 * Sử dụng proxy server để tránh lỗi CORS
 */
const createShopeeApiClient = () => {
  const config = {
    baseURL: SHOPEE_API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds timeout
  };
  
  const instance = axios.create(config);
  
  // Middleware để debug request
  instance.interceptors.request.use(
    (config) => {
      if (DEBUG) {
        console.log('Shopee API Request:', {
          url: `${config.baseURL}${config.url}`,
          method: config.method,
          params: config.params
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Middleware để xử lý response
  instance.interceptors.response.use(
    (response) => {
      if (DEBUG) {
        console.log(`[Shopee API Response] ${response.config.url}:`, response.data);
      }
      return response;
    },
    (error) => {
      // Debug response errors
      if (error.response) {
        console.error('[Shopee API Error]:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Nhận diện lỗi liên quan đến xác thực
        const errorData = error.response.data as Record<string, any>;
        if (
          (errorData?.error === 'error_param' && 
          typeof errorData?.message === 'string' &&
          errorData.message.includes('access_token')) ||
          errorData?.error === 'invalid_access_token' ||
          errorData?.error === 'Authentication required'
        ) {
          // Nếu lỗi liên quan đến xác thực, thêm thông tin để frontend xử lý
          (error as any).isAuthError = true;
          console.warn('Shopee authentication error detected');
          
          // Nếu có URL xác thực trong response, lưu lại để redirect
          if (errorData.auth_url) {
            (error as any).authUrl = errorData.auth_url;
          }
        }
      } else if (error.request) {
        console.error('[Shopee API Request Error]:', error.request);
      } else {
        console.error('[Shopee API Error]:', error.message);
      }

      return Promise.reject(error);
    }
  );
  
  return instance;
};

export default createShopeeApiClient;
