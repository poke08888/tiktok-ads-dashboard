/**
 * Proxy server cho TikTok API
 * Cung cấp các chức năng:
 * - Xử lý OAuth flow
 * - Lưu trữ token an toàn trong database
 * - Auto refresh token tự động
 * - Các API endpoint cho TikTok
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import Token Storage module
const TokenStorage = require('./token-storage');

// Khởi tạo Token Storage
TokenStorage.initialize();

const app = express();

// Cho phép CORS từ frontend
app.use(cors());
app.use(express.json());

// TikTok API URLs
const TIKTOK_API_BASE_URL = 'https://business-api.tiktok.com';
const TIKTOK_AUTH_URL = 'https://ads.tiktok.com/marketing_api/auth';

// Lấy thông tin từ .env
const APP_ID = process.env.REACT_APP_TIKTOK_APP_ID || '7299591519273682950';
const APP_SECRET = process.env.REACT_APP_TIKTOK_APP_SECRET || 'TAyxhxzm2NMdbH3rtdqbMJD2KsiSQUyU';
const REDIRECT_URI = process.env.REACT_APP_TIKTOK_REDIRECT_URI || 'http://localhost:3000/tiktok/callback';
const API_VERSION = process.env.REACT_APP_TIKTOK_API_VERSION || 'v1.3';

// Kiểm tra thông tin cấu hình
if (!APP_ID || !APP_SECRET) {
  console.error('Missing TikTok API credentials in .env file');
  console.error('Please set REACT_APP_TIKTOK_APP_ID and REACT_APP_TIKTOK_APP_SECRET');
  process.exit(1);
}

console.log(`TikTok API configuration: App ID: ${APP_ID}, Redirect URI: ${REDIRECT_URI}`);

// Cấu hình OAuth
const OAUTH_CONFIG = {
  // Đường dẫn callback khi người dùng hoàn tất xác thực
  REDIRECT_URI: REDIRECT_URI,
  
  // Config cho auto-refresh
  TOKEN_REFRESH_THRESHOLD_SEC: 1800, // Làm mới token khi còn 30 phút
  PLATFORM_NAME: 'tiktok'           // Tên platform trong TokenStorage
};

// Hàm lưu token vào storage
const saveTokens = (tokens) => {
  return TokenStorage.saveToken(OAUTH_CONFIG.PLATFORM_NAME, tokens);
};

// Hàm đọc token từ storage
const getTokens = () => {
  return TokenStorage.getToken(OAUTH_CONFIG.PLATFORM_NAME);
};

// Hàm tạo code verifier cho PKCE
function generateCodeVerifier(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Hàm tạo code challenge từ code verifier
async function generateCodeChallenge(codeVerifier) {
  // SHA-256 hash của code_verifier
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  
  // Base64Url encoding
  const base64 = Buffer.from(hash).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return base64;
}

// Hàm kiểm tra và tự động làm mới token khi cần
const checkAndRefreshToken = async () => {
  try {
    const status = TokenStorage.checkTokenStatus(OAUTH_CONFIG.PLATFORM_NAME);
    
    // Nếu không có token hoặc đã hết hạn, không thể làm mới tự động
    if (!status.exists || status.expired) {
      console.log('Token not found or expired, cannot auto-refresh');
      return false;
    }
    
    // Nếu sắp hết hạn (dưới ngưỡng cấu hình), làm mới token
    if (status.remainingSeconds < OAUTH_CONFIG.TOKEN_REFRESH_THRESHOLD_SEC) {
      console.log(`Token expires in ${status.remainingSeconds}s, auto-refreshing...`);
      const tokens = getTokens();
      if (tokens && tokens.refresh_token) {
        await refreshAccessToken(tokens.refresh_token);
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkAndRefreshToken:', error);
    return false;
  }
};

// Hàm làm mới access token
const refreshAccessToken = async (refresh_token) => {
  try {
    const response = await axios.post(`${TIKTOK_API_BASE_URL}/open_api/v1.3/oauth2/refresh_token/`, {
      app_id: APP_ID,
      app_secret: APP_SECRET,
      refresh_token: refresh_token
    });
    
    if (response.data && response.data.code === 0 && response.data.data) {
      // Lưu token mới
      const timestamp = Math.floor(Date.now() / 1000);
      const tokenData = response.data.data;
      
      const newTokens = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        advertiser_id: tokenData.advertiser_id,
        scope: tokenData.scope,
        created_at: timestamp,
        expire_in: tokenData.expires_in
      };
      
      saveTokens(newTokens);
      console.log('TikTok token refreshed automatically');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in auto refreshing TikTok token:', error);
    return false;
  }
};

// Debug mode
const DEBUG = process.env.DEBUG === 'true' || false;

// Chuyển đổi từ file JSON cũ sang database mới
try {
  const oldTokenPath = path.join(__dirname, 'tiktok_tokens.json');
  if (fs.existsSync(oldTokenPath)) {
    TokenStorage.migrateFromJson(oldTokenPath, OAUTH_CONFIG.PLATFORM_NAME);
  }
} catch (error) {
  console.warn('Migration warning:', error.message);
}

// Endpoint để redirect user đến trang OAuth của TikTok
app.get('/api/tiktok/auth', async (req, res) => {
  try {
    // Sử dụng domain từ biến môi trường hoặc mặc định
    const DOMAIN = process.env.DOMAIN || 'localhost';
    const customRedirectUri = req.query.redirect_uri || `http://${DOMAIN}/tiktok/callback`;
    
    console.log(`OAuth flow starting with redirect URI: ${customRedirectUri}`);
    
    // Tạo và lưu code_verifier
    const codeVerifier = generateCodeVerifier();
    // Lưu code_verifier trong database để sử dụng khi callback
    saveTokens({ code_verifier: codeVerifier, created_at: Math.floor(Date.now() / 1000) });
    
    // Tạo code_challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Tạo state để bảo vệ khỏi CSRF
    const state = crypto.randomBytes(16).toString('hex');
    
    // Tạo URL redirect với custom redirect URI
    const scope = req.query.scope || 'user_info,ad.read,ad.write,ads_read,campaign_list,report_read,audience_insights_read,creative_read';
    
    console.log('TikTok OAuth parameters:');
    console.log('- app_id:', APP_ID);
    console.log('- redirect_uri:', customRedirectUri);
    console.log('- scope:', scope);
    console.log('- state:', state);
    console.log('- code_challenge:', codeChallenge);
    
    const authUrl = `${TIKTOK_AUTH_URL}?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(customRedirectUri)}&response_type=code&state=${state}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    
    // Redirect user đến trang đăng nhập của TikTok
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message
    });
  }
});

// Endpoint để xử lý callback từ TikTok sau khi user đăng nhập
app.get('/api/tiktok/auth/callback', async (req, res) => {
  try {
    const { code, state, redirect_uri } = req.query;
    
    console.log(`Callback received with redirect_uri: ${redirect_uri}`);
    
    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'The callback from TikTok did not include an authorization code'
      });
    }
    
    // Lấy code_verifier đã lưu
    const storedData = getTokens();
    if (!storedData || !storedData.code_verifier) {
      return res.status(400).json({
        error: 'Code verifier not found',
        message: 'The code verifier was not found. Please try the authorization process again.'
      });
    }
    
    // Exchange code lấy token
    const tokenResponse = await axios.post(`${TIKTOK_API_BASE_URL}/open_api/v1.3/oauth2/access_token/`, {
      app_id: APP_ID,
      app_secret: APP_SECRET,
      auth_code: code,
      code_verifier: storedData.code_verifier,
      redirect_uri: redirect_uri || OAUTH_CONFIG.REDIRECT_URI
    });
    
    if (tokenResponse.data.code !== 0 || !tokenResponse.data.data) {
      return res.status(400).json({
        error: 'Failed to exchange code for token',
        message: tokenResponse.data.message || 'Unknown error'
      });
    }
    
    // Lưu token
    const timestamp = Math.floor(Date.now() / 1000);
    const tokenData = tokenResponse.data.data;
    
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      advertiser_id: tokenData.advertiser_id,
      scope: tokenData.scope,
      created_at: timestamp,
      expire_in: tokenData.expires_in
    };
    
    saveTokens(tokens);
    
    // Sử dụng custom redirect URI nếu có hoặc fallback về default
    const DOMAIN = process.env.DOMAIN || 'localhost';
    const returnUrl = redirect_uri || `http://${DOMAIN}/tiktok/callback`;
    
    // Redirect về frontend với query param để hiển thị thông báo
    res.redirect(`${returnUrl}?tiktok_auth=success`);
  } catch (error) {
    console.error('Error in auth callback:', error);
    
    // Sử dụng custom redirect URI nếu có hoặc fallback về default
    const DOMAIN = process.env.DOMAIN || 'localhost';
    const returnUrl = req.query.redirect_uri || `http://${DOMAIN}/tiktok/callback`;
    
    res.redirect(`${returnUrl}?tiktok_auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Kiểm tra trạng thái xác thực TikTok
app.get('/api/tiktok/auth/status', (req, res) => {
  const status = TokenStorage.checkTokenStatus(OAUTH_CONFIG.PLATFORM_NAME);
  const tokens = getTokens();
  
  if (status.exists && tokens && tokens.access_token) {
    res.json({
      authenticated: true,
      expired: status.expired,
      advertiser_id: tokens.advertiser_id,
      expires_at: status.expiresAt,
      expires_in_minutes: Math.floor(status.remainingSeconds / 60),
      auto_refresh_enabled: true,
      scope: tokens.scope
    });
  } else {
    res.json({
      authenticated: false,
      auto_refresh_enabled: true
    });
  }
});

// Endpoint để làm mới token thủ công
app.post('/api/tiktok/auth/refresh', async (req, res) => {
  try {
    const tokens = getTokens();
    
    if (!tokens || !tokens.refresh_token) {
      return res.status(400).json({
        error: 'No refresh token available'
      });
    }
    
    const result = await refreshAccessToken(tokens.refresh_token);
    
    if (result) {
      res.json({
        success: true,
        message: 'Tokens refreshed successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to refresh token',
        message: 'Could not obtain a new access token from TikTok API'
      });
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      error: 'Error refreshing token',
      message: error.message
    });
  }
});

// Endpoint để đăng xuất
app.post('/api/tiktok/auth/logout', (req, res) => {
  try {
    TokenStorage.deleteToken(OAUTH_CONFIG.PLATFORM_NAME);
    res.json({
      success: true,
      message: 'Successfully logged out from TikTok'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      error: 'Error logging out',
      message: error.message
    });
  }
});

// Middleware để kiểm tra và làm mới token trước mỗi request đến TikTok API
const tokenMiddleware = async (req, res, next) => {
  try {
    // Kiểm tra và làm mới token nếu cần
    await checkAndRefreshToken();
    
    // Lấy token từ storage
    const tokens = getTokens();
    if (!tokens || !tokens.access_token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate with TikTok first',
        auth_url: 'http://localhost:4001/api/tiktok/auth'
      });
    }
    
    // Kiểm tra xem token có hết hạn không
    const status = TokenStorage.checkTokenStatus(OAUTH_CONFIG.PLATFORM_NAME);
    if (status.expired) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your TikTok access token has expired. Please refresh token or authenticate again.',
        auth_url: 'http://localhost:4001/api/tiktok/auth'
      });
    }
    
    // Lưu token vào request để sử dụng trong các route
    req.tiktokToken = tokens.access_token;
    req.tiktokAdvertiserId = tokens.advertiser_id;
    next();
  } catch (error) {
    console.error('Token middleware error:', error);
    return res.status(500).json({
      error: 'Token middleware error',
      message: error.message
    });
  }
};

// Tạo router riêng cho các endpoint API của TikTok
const tiktokApiRouter = express.Router();

// Áp dụng middleware kiểm tra token cho tất cả các endpoint API
tiktokApiRouter.use(tokenMiddleware);

// Hàm tạo proxy handler cho TikTok API endpoints
function createTikTokProxyHandler(apiPath, method = 'GET') {
  return async (req, res) => {
    try {
      // Build full URL
      const tiktokUrl = `${TIKTOK_API_BASE_URL}/open_api/${API_VERSION}${apiPath}`;
      
      // Build params with authentication
      const params = {
        ...req.query,
        access_token: req.tiktokToken,
        advertiser_id: req.tiktokAdvertiserId
      };
      
      if (DEBUG) {
        console.log(`>>> ${method} REQUEST to TikTok ${apiPath}:`);
        console.log('Params:', params);
        if (method === 'POST') console.log('Body:', req.body);
      }
      
      // Make request to TikTok API
      let response;
      if (method === 'GET') {
        response = await axios.get(tiktokUrl, { 
          params,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = await axios.post(tiktokUrl, req.body, { 
          params,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (DEBUG) {
        console.log(`>>> RESPONSE from TikTok ${apiPath}:`);
        console.log('Status:', response.status);
        console.log('Data preview:', JSON.stringify(response.data).substring(0, 300) + '...');
      }
      
      res.json(response.data);
    } catch (error) {
      console.error(`>>> ERROR calling TikTok ${apiPath}:`, error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: `TikTok API Error (${apiPath})`,
          status: error.response.status,
          message: error.response.data,
          timestamp: new Date()
        });
      } else {
        res.status(500).json({
          error: `Request Error (${apiPath})`,
          message: error.message,
          timestamp: new Date()
        });
      }
    }
  };
}

// Đăng ký các endpoints cho TikTok API
const registerTikTokEndpoints = () => {
  // Report endpoints
  tiktokApiRouter.post('/report/integrated/get', createTikTokProxyHandler('/report/integrated/get/', 'POST'));
  
  // Campaign endpoints
  tiktokApiRouter.get('/campaign/get', createTikTokProxyHandler('/campaign/get/'));
  tiktokApiRouter.post('/campaign/create', createTikTokProxyHandler('/campaign/create/', 'POST'));
  tiktokApiRouter.post('/campaign/update', createTikTokProxyHandler('/campaign/update/', 'POST'));
  tiktokApiRouter.post('/campaign/status/update', createTikTokProxyHandler('/campaign/status/update/', 'POST'));
  
  // Ad Group endpoints
  tiktokApiRouter.get('/adgroup/get', createTikTokProxyHandler('/adgroup/get/'));
  tiktokApiRouter.post('/adgroup/create', createTikTokProxyHandler('/adgroup/create/', 'POST'));
  tiktokApiRouter.post('/adgroup/update', createTikTokProxyHandler('/adgroup/update/', 'POST'));
  
  // Ad endpoints
  tiktokApiRouter.get('/ad/get', createTikTokProxyHandler('/ad/get/'));
  tiktokApiRouter.post('/ad/create', createTikTokProxyHandler('/ad/create/', 'POST'));
  tiktokApiRouter.post('/ad/update', createTikTokProxyHandler('/ad/update/', 'POST'));
  
  // Creative endpoints
  tiktokApiRouter.get('/creative/get', createTikTokProxyHandler('/creative/get/'));
  tiktokApiRouter.post('/creative/create', createTikTokProxyHandler('/creative/create/', 'POST'));
  
  // User/Account endpoints
  tiktokApiRouter.get('/user/info', createTikTokProxyHandler('/user/info/'));
  tiktokApiRouter.get('/advertiser/info', createTikTokProxyHandler('/advertiser/info/'));
};

// Đăng ký các endpoints
registerTikTokEndpoints();

// Đăng ký router API TikTok với đường dẫn /api/tiktok
app.use('/api/tiktok', tiktokApiRouter);

// Khởi động server
const PORT = process.env.TIKTOK_PROXY_PORT || 4001;
const DOMAIN = process.env.DOMAIN || 'localhost';

app.listen(PORT, () => {
  console.log(`TikTok proxy server đang chạy tại http://${DOMAIN}:${PORT}`);
  console.log(`Domain: ${DOMAIN}`);
  console.log(`App ID: ${APP_ID}`);
  console.log(`Auto-refresh token enabled: ${OAUTH_CONFIG.TOKEN_REFRESH_THRESHOLD_SEC} seconds threshold`);
});
