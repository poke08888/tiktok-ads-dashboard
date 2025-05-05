import axios from 'axios';
import { TIKTOK_API_CONFIG, STORAGE_KEYS } from '../config';

interface AuthTokenResponse {
  code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    advertiser_id: string;
    scope: string[];
    token_type: string;
    expires_in: number;
  };
}

/**
 * Tạo một chuỗi ngẫu nhiên dùng cho code_verifier
 */
function generateCodeVerifier(length: number = 64): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Tạo code_challenge từ code_verifier dùng cho PKCE
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Base64Url encode SHA256 hash của code_verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  // Chuyển ArrayBuffer sang Uint8Array
  const hashArray = Array.from(new Uint8Array(digest));
  
  // Chuyển bytes sang chuỗi hex
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  // Base64Url encoding
  const base64 = btoa(String.fromCharCode.apply(null, hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return base64;
}

/**
 * Tạo URL để redirect user đến trang OAuth của TikTok
 * @returns URL để redirect
 */
export const getAuthorizationUrl = async (): Promise<string> => {
  // Tạo code_verifier và lưu trong localStorage
  const codeVerifier = generateCodeVerifier();
  localStorage.setItem('tiktok_code_verifier', codeVerifier);
  
  // Tạo code_challenge từ code_verifier
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Cấu trúc tham số cho TikTok Portal API qua proxy
  const params = new URLSearchParams({
    app_id: TIKTOK_API_CONFIG.APP_ID,
    redirect_uri: TIKTOK_API_CONFIG.REDIRECT_URI,
    state: Math.random().toString(36).substring(2, 15),
    scope: TIKTOK_API_CONFIG.SCOPES.join(','),
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  // Sử dụng endpoint proxy thay vì trực tiếp đến TikTok
  console.log(`${TIKTOK_API_CONFIG.AUTH_URL}?${params.toString()}`);
  return `${TIKTOK_API_CONFIG.AUTH_URL}?${params.toString()}`;
};

/**
 * Trao đổi authorization code để lấy access token
 * @param code Code nhận được từ TikTok OAuth redirect
 * @returns Token response
 */
export const exchangeCodeForToken = async (code: string): Promise<AuthTokenResponse['data']> => {
  try {
    // Lấy code_verifier đã lưu trong bước trước
    const codeVerifier = localStorage.getItem('tiktok_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found. Please try the authorization process again.');
    }
    
    const response = await axios.post<AuthTokenResponse>(
      TIKTOK_API_CONFIG.DIRECT_ACCESS_TOKEN_URL,
      {
        app_id: TIKTOK_API_CONFIG.APP_ID,
        secret: TIKTOK_API_CONFIG.APP_SECRET,
        auth_code: code,
        // TikTok Business API không yêu cầu grant_type và có tham số auth_code thay vì code
        redirect_uri: TIKTOK_API_CONFIG.REDIRECT_URI,
        code_verifier: codeVerifier
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`TikTok API Error: ${response.data.message}`);
    }

    // Lưu token vào localStorage (trong ứng dụng thực, nên lưu server-side)
    const tokenData = response.data.data;
    const expiryTime = new Date().getTime() + tokenData.expires_in * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenData.refresh_token);
    localStorage.setItem(STORAGE_KEYS.ADVERTISER_ID, tokenData.advertiser_id);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Refresh access token khi hết hạn
 * @returns Token mới
 */
export const refreshAccessToken = async (): Promise<AuthTokenResponse['data']> => {
  try {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<AuthTokenResponse>(
      TIKTOK_API_CONFIG.DIRECT_REFRESH_TOKEN_URL,
      {
        app_id: TIKTOK_API_CONFIG.APP_ID,
        secret: TIKTOK_API_CONFIG.APP_SECRET,
        refresh_token: refreshToken
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`TikTok API Error: ${response.data.message}`);
    }

    // Cập nhật token trong localStorage
    const tokenData = response.data.data;
    const expiryTime = new Date().getTime() + tokenData.expires_in * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenData.refresh_token);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

    return tokenData;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem token hiện tại còn hạn hay không
 * @returns true nếu token vẫn còn hiệu lực
 */
export const isTokenValid = (): boolean => {
  const expiryTimeStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  
  if (!expiryTimeStr) {
    return false;
  }

  const expiryTime = parseInt(expiryTimeStr, 10);
  const currentTime = new Date().getTime();
  
  // Cho phép refresh trước khi hết hạn 5 phút
  return expiryTime > currentTime + 5 * 60 * 1000;
};

/**
 * Kiểm tra và tự động refresh token nếu cần
 * @returns Token hiện tại hoặc mới
 */
export const getValidAccessToken = async (): Promise<string> => {
  if (!isTokenValid()) {
    try {
      const newToken = await refreshAccessToken();
      return newToken.access_token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      throw error;
    }
  }
  
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '';
};

/**
 * Đăng xuất - xóa tất cả token
 */
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADVERTISER_ID);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
};
