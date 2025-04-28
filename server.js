const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
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

// Shopee API proxy (sử dụng cơ chế tự xử lý thay vì http-proxy-middleware)
app.get('/api/shopee*', async (req, res) => {
  try {
    // Lấy thông tin đường dẫn API Shopee
    const shopeeEndpoint = req.path.replace('/api/shopee', '');
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Đường dẫn API đầy đủ và đúng định dạng của Shopee API v2
    const apiPath = `/api/v2${shopeeEndpoint}`;
    
    // Tạo chuỗi để ký theo format của Shopee API
    const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
    
    // Tạo chữ ký
    const sign = crypto.createHmac('sha256', PARTNER_KEY)
      .update(baseString)
      .digest('hex');
    
    // Thêm thông tin xác thực vào query params
    const params = {
      ...req.query,
      partner_id: PARTNER_ID,
      shop_id: SHOP_ID,
      timestamp: timestamp,
      sign: sign
    };
    
    // Xây dựng URL hoàn chỉnh
    const shopeeUrl = `https://partner.shopeemobile.com${apiPath}`;
    
    if (DEBUG) {
      console.log('>>> REQUEST INFO:');
      console.log('Original URL:', req.originalUrl);
      console.log('API path:', apiPath);
      console.log('Base string for signing:', baseString);
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
      console.log('Data:', JSON.stringify(shopeeResponse.data).substring(0, 500) + '...');
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

// POST request handler cho Shopee API
app.post('/api/shopee*', async (req, res) => {
  try {
    // Tương tự như GET nhưng xử lý body
    const shopeeEndpoint = req.path.replace('/api/shopee', '');
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = `/api/v2${shopeeEndpoint}`;
    const baseString = PARTNER_ID + apiPath + timestamp + SHOP_ID;
    const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
    
    // Thêm thông tin xác thực vào query params
    const params = {
      partner_id: PARTNER_ID,
      shop_id: SHOP_ID,
      timestamp: timestamp,
      sign: sign
    };
    
    // Xây dựng URL hoàn chỉnh
    const shopeeUrl = `https://partner.shopeemobile.com${apiPath}`;
    
    if (DEBUG) {
      console.log('POST Request to:', shopeeUrl);
      console.log('Params:', params);
      console.log('Body:', req.body);
    }
    
    // Gửi request đến Shopee API
    const shopeeResponse = await axios.post(shopeeUrl, req.body, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Trả kết quả về cho client
    res.json(shopeeResponse.data);
  } catch (error) {
    console.error('Error posting to Shopee API:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Shopee API Error',
        status: error.response.status,
        message: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Shopee API Error',
        message: error.message
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
