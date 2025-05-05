/**
 * Main proxy server cho cả TikTok và Shopee API
 * Khởi động cả hai proxy server cùng lúc
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Token Storage module
const TokenStorage = require('./token-storage');

// Khởi tạo Token Storage
TokenStorage.initialize();

// Tạo app Express chính
const app = express();

// Sử dụng middleware cơ bản
app.use(cors());
app.use(express.json());

// Khai báo PORT
const PORT = process.env.PORT || 4000;
const TIKTOK_PORT = process.env.TIKTOK_PROXY_PORT || 4001;

// Middleware để log tất cả request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Tạo route health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Khởi động server chính
app.listen(PORT, () => {
  console.log(`Proxy server chính đang chạy tại http://localhost:${PORT}`);
  
  // Khởi động Shopee API proxy
  try {
    console.log('Khởi động Shopee API proxy...');
    require('./shopee-proxy');
  } catch (error) {
    console.error('Lỗi khi khởi động Shopee API proxy:', error);
  }
  
  // Khởi động TikTok API proxy
  try {
    console.log('Khởi động TikTok API proxy...');
    require('./tiktok-proxy');
  } catch (error) {
    console.error('Lỗi khi khởi động TikTok API proxy:', error);
  }
});
