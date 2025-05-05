const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Trang chính với các nút xác thực
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TikTok & Shopee Auth Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background: #000; color: white; padding: 10px 20px; 
                  text-decoration: none; margin: 10px; border-radius: 4px; }
        .shopee { background: #f53d2d; }
        .container { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>TikTok & Shopee Authentication Test</h1>
      
      <div class="container">
        <h2>TikTok Authentication</h2>
        <p>Test the TikTok authentication flow</p>
        <a href="http://localhost:4001/api/tiktok/auth" class="button">Connect to TikTok</a>
      </div>
      
      <div class="container">
        <h2>Shopee Authentication</h2>
        <p>Test the Shopee authentication flow</p>
        <a href="http://localhost:4000/api/shopee/auth" class="button shopee">Connect to Shopee</a>
      </div>

      <div class="container">
        <h2>Server Status</h2>
        <p>Check the status of API servers</p>
        <a href="http://localhost:4001/api/status" class="button" target="_blank">TikTok API Status</a>
        <a href="http://localhost:4000/api/status" class="button shopee" target="_blank">Shopee API Status</a>
      </div>
    </body>
    </html>
  `);
});

// Callback handler cho TikTok OAuth
app.get('/tiktok/callback', (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TikTok Auth Callback</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>TikTok Authentication Callback</h1>
      <p>Received authorization code from TikTok!</p>
      
      <h2>Query Parameters:</h2>
      <pre>${JSON.stringify(req.query, null, 2)}</pre>
      
      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Callback handler cho Shopee OAuth
app.get('/shopee/callback', (req, res) => {
  const code = req.query.code;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shopee Auth Callback</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>Shopee Authentication Callback</h1>
      <p>Received authorization code from Shopee!</p>
      
      <h2>Query Parameters:</h2>
      <pre>${JSON.stringify(req.query, null, 2)}</pre>
      
      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Auth Test Server đang chạy tại http://localhost:${PORT}`);
});
