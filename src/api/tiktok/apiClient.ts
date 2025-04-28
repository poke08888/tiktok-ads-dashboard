import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TIKTOK_API_CONFIG } from '../config';
import { getValidAccessToken } from './auth';

/**
 * Tạo axios instance đã được cấu hình sẵn cho TikTok Business API
 */
const createTikTokApiClient = async (): Promise<AxiosInstance> => {
  // Lấy token hiện tại hoặc tự động refresh nếu hết hạn
  const accessToken = await getValidAccessToken();
  
  const config: AxiosRequestConfig = {
    baseURL: TIKTOK_API_CONFIG.BASE_URL,
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds timeout
  };
  
  const instance = axios.create(config);
  
  // Middleware để xử lý lỗi
  instance.interceptors.response.use(
    (response) => {
      // TikTok API trả về code = 0 khi thành công
      if (response.data && response.data.code !== 0) {
        return Promise.reject(new Error(`TikTok API Error: ${response.data.message}`));
      }
      return response;
    },
    async (error) => {
      // Có thể thêm logic retry hoặc handle token expired ở đây
      return Promise.reject(error);
    }
  );
  
  return instance;
};

export default createTikTokApiClient;
