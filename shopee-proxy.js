const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Cho phép CORS từ frontend
app.use(cors());

// Parse JSON body
app.use(express.json());

// Lấy thông tin xác thực từ biến môi trường
const PARTNER_ID = process.env.REACT_APP_SHOPEE_PARTNER_ID;
const PARTNER_KEY = process.env.REACT_APP_SHOPEE_PARTNER_KEY;
const SHOP_ID = process.env.REACT_APP_SHOPEE_SHOP_ID;

// Các thông số OAuth
const OAUTH_CONFIG = {
  // Đường dẫn callback khi người dùng hoàn tất xác thực
  // Sử dụng đúng URL đã đăng ký trong Shopee Partner Console
  REDIRECT_URL: 'http://admin.nonelab.net/shopee/auth/callback',
  
  // Đường dẫn để lưu token
  TOKEN_PATH: path.join(__dirname, 'shopee_tokens.json'),
};

// Hàm lưu token vào file
const saveTokens = (tokens) => {
  try {
    fs.writeFileSync(OAUTH_CONFIG.TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('Tokens saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
};

// Hàm đọc token từ file
const getTokens = () => {
  try {
    if (fs.existsSync(OAUTH_CONFIG.TOKEN_PATH)) {
      const tokens = JSON.parse(fs.readFileSync(OAUTH_CONFIG.TOKEN_PATH, 'utf8'));
      return tokens;
    }
    return null;
  } catch (error) {
    console.error('Error reading tokens:', error);
    return null;
  }
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
  const tokens = getTokens();
  if (tokens && tokens.access_token) {
    // Kiểm tra xem token còn hạn không
    const now = Math.floor(Date.now() / 1000);
    const isExpired = tokens.expire_in && (tokens.created_at + tokens.expire_in < now);
    
    res.json({
      authenticated: true,
      expired: isExpired,
      shop_id: SHOP_ID,
      expires_at: tokens.created_at + tokens.expire_in
    });
  } else {
    res.json({
      authenticated: false
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
    
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/auth/access_token/get';
    const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
    
    const sign = crypto.createHmac('sha256', PARTNER_KEY)
      .update(baseString)
      .digest('hex');
    
    // Gọi API để làm mới token
    const refreshResponse = await axios.post(`https://partner.shopeemobile.com${apiPath}`, {
      refresh_token: tokens.refresh_token,
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
      
      res.json({
        success: true,
        message: 'Tokens refreshed successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to refresh token',
        details: refreshResponse.data
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

// Shopee API proxy cho endpoint get_order_list
app.get('/api/shopee/order/get_order_list', async (req, res) => {
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
    
    // Lấy access_token từ file đã lưu
    const tokens = getTokens();
    const access_token = tokens && tokens.access_token;
    
    if (!access_token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate with Shopee first',
        auth_url: 'http://localhost:4000/shopee/auth'
      });
    }
    
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

// Khởi động server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy tại http://localhost:${PORT}`);
  console.log(`Partner ID: ${PARTNER_ID}, Shop ID: ${SHOP_ID}`);
});
