const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Thông tin Shopee từ trước
const PARTNER_ID = 1279257;
const PARTNER_KEY = '575449466265464e4c4e636d4f644c446558794a544474574e62635771645667';
const SHOP_ID = 280778267;
const REDIRECT_URI = 'http://localhost:3000/shopee/callback';

// Route chính để kiểm tra trạng thái
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Shopee proxy is running',
    partnerId: PARTNER_ID,
    shopId: SHOP_ID,
    redirectUri: REDIRECT_URI
  });
});

// OAuth route đơn giản
app.get('/api/shopee/auth', (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const baseString = `${PARTNER_ID}${REDIRECT_URI}${timestamp}`;
  const hmac = require('crypto').createHmac('sha256', PARTNER_KEY);
  const sign = hmac.update(baseString).digest('hex');
  
  const authUrl = `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${PARTNER_ID}&redirect=${encodeURIComponent(REDIRECT_URI)}&timestamp=${timestamp}&sign=${sign}`;
  
  console.log(`OAuth redirect URL: ${authUrl}`);
  res.redirect(authUrl);
});

// Khởi động server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Shopee simple proxy đang chạy tại http://localhost:${PORT}`);
  console.log(`Partner ID: ${PARTNER_ID}`);
});
