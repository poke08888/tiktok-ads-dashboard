const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Thông tin TikTok từ trước
const APP_ID = '7299591519273682950';
const APP_SECRET = 'TAyxhxzm2NMdbH3rtdqbMJD2KsiSQUyU';
const REDIRECT_URI = 'http://localhost:3000/tiktok/callback';

// Route chính để kiểm tra trạng thái
app.get('/api/status', (req, res) => {
  res.json({
    status: 'TikTok proxy is running',
    appId: APP_ID,
    redirectUri: REDIRECT_URI
  });
});

// OAuth route đơn giản
app.get('/api/tiktok/auth', (req, res) => {
  const authUrl = `https://ads.tiktok.com/marketing_api/auth?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=test&scope=user_info,ad.read`;
  
  console.log(`OAuth redirect URL: ${authUrl}`);
  res.redirect(authUrl);
});

// Khởi động server
const PORT = 4001;
app.listen(PORT, () => {
  console.log(`TikTok simple proxy đang chạy tại http://localhost:${PORT}`);
  console.log(`App ID: ${APP_ID}`);
});
