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

// Parse JSON body
app.use(express.json());

// Lấy thông tin xác thực từ .env
const PARTNER_ID = process.env.REACT_APP_SHOPEE_PARTNER_ID || '1279257';
const PARTNER_KEY = process.env.REACT_APP_SHOPEE_PARTNER_KEY || '575449466265464e4c4e636d4f644c446558794a544474574e62635771645667';
const SHOP_ID = process.env.REACT_APP_SHOPEE_SHOP_ID || '280778267';

// Các thông số OAuth
const OAUTH_CONFIG = {
  // Đường dẫn callback khi người dùng hoàn tất xác thực
  // Sử dụng đúng URL đã đăng ký trong Shopee Partner Console
  REDIRECT_URL: 'http://localhost:3000/shopee/auth/callback',
  
  // Config cho auto-refresh
  TOKEN_REFRESH_THRESHOLD_SEC: 1800, // Làm mới token khi còn 30 phút
  PLATFORM_NAME: 'shopee'           // Tên platform trong TokenStorage
};

// Hàm lưu token vào storage
const saveTokens = (tokens) => {
  return TokenStorage.saveToken(OAUTH_CONFIG.PLATFORM_NAME, tokens);
};

// Hàm đọc token từ storage
const getTokens = () => {
  return TokenStorage.getToken(OAUTH_CONFIG.PLATFORM_NAME);
};

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
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/auth/access_token/get';
    const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
    
    const sign = crypto.createHmac('sha256', PARTNER_KEY)
      .update(baseString)
      .digest('hex');
    
    // Gọi API để làm mới token
    const refreshResponse = await axios.post(`https://partner.shopeemobile.com${apiPath}`, {
      refresh_token: refresh_token,
      shop_id: Number(SHOP_ID),
      partner_id: Number(PARTNER_ID)
    }, {
      params: {
        partner_id: PARTNER_ID,
        timestamp,
        sign
      }
    });
    
    if (refreshResponse.data && refreshResponse.data.access_token) {
      // Lưu token mới
      const newTokens = {
        ...refreshResponse.data,
        created_at: timestamp
      };
      
      saveTokens(newTokens);
      console.log('Token refreshed automatically');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in auto refreshing token:', error);
    return false;
  }
};

// Migration from old JSON file to new SQLite storage
try {
  const oldTokenPath = path.join(__dirname, 'shopee_tokens.json');
  if (fs.existsSync(oldTokenPath)) {
    TokenStorage.migrateFromJson(oldTokenPath, OAUTH_CONFIG.PLATFORM_NAME);
  }
} catch (error) {
  console.warn('Migration warning:', error.message);
};

// Debug mode
const DEBUG = true;

// Thêm route kiểm tra trạng thái server
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    config: {
      partner_id: PARTNER_ID,
      shop_id: SHOP_ID,
      has_partner_key: !!PARTNER_KEY
    }
  });
});

// Route đơn giản cho test
app.get('/test', (req, res) => {
  res.json({ message: 'Server hoạt động bình thường!' });
});

// Kiểm tra trạng thái xác thực Shopee
app.get('/api/shopee/auth/status', (req, res) => {
  const status = TokenStorage.checkTokenStatus(OAUTH_CONFIG.PLATFORM_NAME);
  const tokens = getTokens();
  
  if (status.exists) {
    res.json({
      authenticated: true,
      expired: status.expired,
      shop_id: SHOP_ID,
      expires_at: status.expiresAt,
      expires_in_minutes: Math.floor(status.remainingSeconds / 60),
      auto_refresh_enabled: true
    });
  } else {
    res.json({
      authenticated: false,
      auto_refresh_enabled: true
    });
  }
});

// Bắt đầu quy trình OAuth: Chuyển hướng đến trang đăng nhập Shopee
app.get('/api/shopee/auth', (req, res) => {
  try {
    // Tạo timestamp và chuỗi cơ sở để ký
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/shop/auth_partner';
    const baseString = PARTNER_ID + apiPath + timestamp;
    
    // Tạo chữ ký
    const sign = crypto.createHmac('sha256', PARTNER_KEY)
      .update(baseString)
      .digest('hex');
    
    // Tạo URL xác thực Shopee
    const authUrl = `https://partner.shopeemobile.com${apiPath}?` + 
      `partner_id=${PARTNER_ID}&` +
      `redirect=${encodeURIComponent(OAUTH_CONFIG.REDIRECT_URL)}&` +
      `timestamp=${timestamp}&` +
      `sign=${sign}`;
    
    if (DEBUG) {
      console.log('Redirecting to Shopee Auth URL:', authUrl);
    }
    
    // Chuyển hướng người dùng đến URL xác thực
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error creating auth URL:', error);
    res.status(500).json({
      error: 'Failed to create auth URL',
      message: error.message
    });
  }
});

// Xử lý callback sau khi người dùng đăng nhập thành công - endpoint này dùng trong development
app.get('/api/shopee/auth/callback', processShopeeAuthCallback);

// Endpoint phù hợp với URL đã đăng ký trong Shopee Partner Console
app.get('/shopee/auth/callback', processShopeeAuthCallback);

// Handler chung cho tất cả các callback URL
async function processShopeeAuthCallback(req, res) {
  try {
    const { code, shop_id } = req.query;
    
    if (!code) {
      return res.status(400).json({
        error: 'Missing code parameter'
      });
    }
    
    if (DEBUG) {
      console.log('Received auth code:', code, 'for shop_id:', shop_id);
    }
    
    // Trao đổi code để lấy access_token
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/auth/token/get';
    const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
    
    const sign = crypto.createHmac('sha256', PARTNER_KEY)
      .update(baseString)
      .digest('hex');
    
    // Gọi API để lấy token
    const tokenResponse = await axios.post(`https://partner.shopeemobile.com${apiPath}`, {
      code,
      shop_id: Number(SHOP_ID),
      partner_id: Number(PARTNER_ID)
    }, {
      params: {
        partner_id: PARTNER_ID,
        timestamp,
        sign
      }
    });
    
    if (DEBUG) {
      console.log('Token response:', tokenResponse.data);
    }
    
    if (tokenResponse.data && tokenResponse.data.access_token) {
      // Lưu token với thời điểm tạo
      const tokens = {
        ...tokenResponse.data,
        created_at: timestamp
      };
      
      saveTokens(tokens);
      
      // Chuyển hướng về trang chủ của ứng dụng 
      // với tham số là status=success để frontend biết đã đăng nhập thành công
      res.redirect('http://localhost:3000?shopee_auth=success');
    } else {
      // Trường hợp lỗi, chuyển hướng về trang chủ với trạng thái lỗi
      res.redirect('http://localhost:3000?shopee_auth=error');
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    
    // Trường hợp lỗi, chuyển hướng về trang chủ với trạng thái lỗi
    res.redirect('http://localhost:3000?shopee_auth=error&message=' + encodeURIComponent(error.message));
  }
}

// API làm mới access_token
app.post('/api/shopee/auth/refresh', async (req, res) => {
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
        message: 'Could not obtain a new access token from Shopee API'
      });
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: error.message
    });
  }
});

// Middleware để kiểm tra và làm mới token trước mỗi request đến Shopee API
const tokenMiddleware = async (req, res, next) => {
  try {
    console.log('Executing Shopee tokenMiddleware...');
    
    // Lấy token hiện tại
    const tokens = getTokens();
    console.log('Tokens found:', tokens ? 'Yes' : 'No');
    if (tokens) {
      console.log('Access token exists:', !!tokens.access_token);
      console.log('Refresh token exists:', !!tokens.refresh_token);
    }
    
    // Nếu không có token hoặc đã hết hạn, yêu cầu xác thực
    if (!tokens || !tokens.access_token) {
      console.log('No Shopee tokens found, returning 401');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No Shopee access token found. Please authenticate first.',
        auth_url: '/api/shopee/auth'
      });
    }
    
    // Kiểm tra xem token có hết hạn không
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = tokens.created_at + tokens.expire_in;
    if (now >= expiresAt) {
      console.log('Token has expired, refreshing...');
      await checkAndRefreshToken();
      const newTokens = getTokens();
      if (!newTokens || !newTokens.access_token) {
        console.log('Failed to refresh token, returning 401');
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Failed to refresh Shopee access token. Please authenticate again.',
          auth_url: '/api/shopee/auth'
        });
      }
    }
    
    // Thêm token vào request để các handler sử dụng
    req.shopeeToken = tokens.access_token;
    console.log('Token added to request. Proceeding with API call...');
    
    // Tiếp tục xử lý request
    next();
  } catch (error) {
    console.error('Token middleware error:', error);
    return res.status(500).json({
      error: 'Token middleware error',
      message: error.message
    });
  }
};

// Tạo router riêng cho các endpoint API của Shopee
const shopeeApiRouter = express.Router();

// Áp dụng middleware kiểm tra token cho tất cả các endpoint API
shopeeApiRouter.use(tokenMiddleware);

// Shopee API proxy cho endpoint get_order_list
shopeeApiRouter.get('/order/get_order_list', async (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/order/get_order_list';
    
    // Tạo chuỗi để ký theo format của Shopee API v2
    // Format đúng: {partner_id}{api path}{timestamp}{shop_id}
    const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
    
    // Tạo chữ ký
    const sign = crypto.createHmac('sha256', PARTNER_KEY)
      .update(baseString)
      .digest('hex');
    
    // Sử dụng access_token đã được lưu trong request bởi middleware
    const access_token = req.shopeeToken;
    
    // Thêm thông tin xác thực vào query params
    const params = {
      ...req.query,
      partner_id: PARTNER_ID,
      shop_id: SHOP_ID,
      timestamp: timestamp,
      sign: sign,
      access_token: access_token
    };
    
    // Xây dựng URL hoàn chỉnh
    const shopeeUrl = `https://partner.shopeemobile.com${apiPath}`;
    
    if (DEBUG) {
      console.log('>>> REQUEST INFO:');
      console.log('Original URL:', req.originalUrl);
      console.log('API path:', apiPath);
      console.log('Base string for signing:', baseString);
      console.log('Sign:', sign);
      console.log('Partner ID:', PARTNER_ID);
      console.log('Shop ID:', SHOP_ID);
      console.log('Timestamp:', timestamp);
      console.log('Final URL:', shopeeUrl);
      console.log('Full params:', params);
    }
    
    // Gửi request đến Shopee API
    const shopeeResponse = await axios.get(shopeeUrl, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (DEBUG) {
      console.log('>>> RESPONSE FROM SHOPEE:');
      console.log('Status:', shopeeResponse.status);
      console.log('Data preview:', JSON.stringify(shopeeResponse.data).substring(0, 500) + '...');
    }
    
    // Trả kết quả về cho client
    res.json(shopeeResponse.data);
  } catch (error) {
    console.error('>>> ERROR CALLING SHOPEE API:');
    
    if (error.response) {
      // Server đã trả về response với status code ngoài dải 2xx
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      res.status(error.response.status).json({
        error: 'Shopee API Error',
        status: error.response.status,
        message: error.response.data,
        timestamp: new Date()
      });
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error('No response received:', error.message);
      res.status(500).json({
        error: 'No response from Shopee API',
        message: 'Không nhận được phản hồi từ Shopee API',
        details: error.message,
        timestamp: new Date()
      });
    } else {
      // Lỗi khi thiết lập request
      console.error('Error:', error.message);
      res.status(500).json({
        error: 'Request Setup Error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }
});

// Function to create and register new API endpoints
const registerShopeeEndpoints = () => {
  // Logistics endpoints
  shopeeApiRouter.get('/logistics/get_shipping_document', createShopeeProxyHandler('/api/v2/logistics/get_shipping_document'));
  shopeeApiRouter.get('/logistics/get_tracking_info', createShopeeProxyHandler('/api/v2/logistics/get_tracking_info'));
  shopeeApiRouter.get('/logistics/get_shipping_parameter', createShopeeProxyHandler('/api/v2/logistics/get_shipping_parameter'));
  
  // Product endpoints
  shopeeApiRouter.get('/product/get_item_list', createShopeeProxyHandler('/api/v2/product/get_item_list'));
  shopeeApiRouter.get('/product/get_item_base_info', createShopeeProxyHandler('/api/v2/product/get_item_base_info'));
  shopeeApiRouter.get('/product/get_model_list', createShopeeProxyHandler('/api/v2/product/get_model_list'));
  
  // Order endpoints
  shopeeApiRouter.get('/order/get_order_detail', createShopeeProxyHandler('/api/v2/order/get_order_detail'));
  shopeeApiRouter.post('/order/cancel_order', createShopeeProxyHandler('/api/v2/order/cancel_order', 'POST'));
  shopeeApiRouter.post('/order/ship_order', createShopeeProxyHandler('/api/v2/order/ship_order', 'POST'));
  
  // Shop and reports endpoints
  shopeeApiRouter.get('/shop/get_shop_performance', createShopeeProxyHandler('/api/v2/shop/get_shop_performance'));
  shopeeApiRouter.get('/account_health/shop_performance', createShopeeProxyHandler('/api/v2/account_health/shop_performance'));
  shopeeApiRouter.get('/payment/get_transaction_list', createShopeeProxyHandler('/api/v2/payment/get_transaction_list'));
};

// Generic proxy handler creator for Shopee API endpoints
function createShopeeProxyHandler(apiPath, method = 'GET') {
  return async (req, res) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
      
      const sign = crypto.createHmac('sha256', PARTNER_KEY)
        .update(baseString)
        .digest('hex');
      
      // Build params with authentication
      const params = {
        ...req.query,
        partner_id: PARTNER_ID,
        shop_id: SHOP_ID,
        timestamp: timestamp,
        sign: sign,
        access_token: req.shopeeToken
      };
      
      // Build URL
      const shopeeUrl = `https://partner.shopeemobile.com${apiPath}`;
      
      if (DEBUG) {
        console.log(`>>> ${method} REQUEST to ${apiPath}:`);
        console.log('Params:', params);
        if (method === 'POST') console.log('Body:', req.body);
      }
      
      // Make request to Shopee API
      let response;
      if (method === 'GET') {
        response = await axios.get(shopeeUrl, { 
          params,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = await axios.post(shopeeUrl, req.body, { 
          params,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (DEBUG) {
        console.log(`>>> RESPONSE from ${apiPath}:`);
        console.log('Status:', response.status);
        console.log('Data preview:', JSON.stringify(response.data).substring(0, 300) + '...');
      }
      
      res.json(response.data);
    } catch (error) {
      console.error(`>>> ERROR calling ${apiPath}:`, error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: `Shopee API Error (${apiPath})`,
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

// Register all Shopee API endpoints
registerShopeeEndpoints();

// Đăng ký router API Shopee với đường dẫn /api/shopee
app.use('/api/shopee', shopeeApiRouter);

// Khởi động server
const PORT = process.env.PORT || 4000;
const DOMAIN = process.env.DOMAIN || 'localhost';

app.listen(PORT, () => {
  console.log(`Shopee proxy server đang chạy tại http://${DOMAIN}:${PORT}`);
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Partner ID: ${PARTNER_ID}, Shop ID: ${SHOP_ID}`);
  console.log(`Auto-refresh token enabled: ${OAUTH_CONFIG.TOKEN_REFRESH_THRESHOLD_SEC} seconds threshold`);
});
