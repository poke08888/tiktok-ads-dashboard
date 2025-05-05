/**
 * TikTok Ads Dashboard - Clean Server Implementation
 * Backend API server for both TikTok and Shopee integrations
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import the clean Shopee API module
const shopeeApi = require('./shopee-api');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
app.use(morgan('dev')); // Request logging

// TikTok API Credentials
const TIKTOK_APP_ID = process.env.TIKTOK_APP_ID;
const TIKTOK_APP_SECRET = process.env.TIKTOK_APP_SECRET;
const TIKTOK_AUTH_URL = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/';

// Add TikTok OAuth endpoint
app.get('/api/tiktok/auth', (req, res) => {
  // Get the authorization code from query params
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({
      error: 'Missing authorization code'
    });
  }
  
  // Exchange the code for an access token
  const authPayload = {
    app_id: TIKTOK_APP_ID,
    secret: TIKTOK_APP_SECRET,
    auth_code: code
  };
  
  // Call TikTok API to get tokens
  axios.post(TIKTOK_AUTH_URL, authPayload)
    .then(response => {
      const data = response.data;
      
      if (data.code === 0 && data.data && data.data.access_token) {
        // Success
        res.json({
          success: true,
          data: data.data
        });
      } else {
        // Error
        res.json({
          success: false,
          error: data.message,
          code: data.code
        });
      }
    })
    .catch(error => {
      console.error('TikTok auth error:', error);
      res.status(500).json({
        error: 'Failed to authenticate with TikTok',
        message: error.message
      });
    });
});

// TikTok API Proxy
app.use('/api/tiktok/api', (req, res, next) => {
  // Any custom preprocessing for TikTok API calls
  next();
}, createProxyMiddleware({
  target: TIKTOK_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tiktok/api': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add custom headers or modify the request if needed
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
}));

// -------------------------------------------
// SHOPEE API ROUTES - Using the clean module
// -------------------------------------------

// Authentication endpoint - Redirect to Shopee for authorization
app.get('/api/shopee/auth', (req, res) => {
  try {
    const { authUrl } = shopeeApi.buildAuthUrl();
    console.log('Redirecting to Shopee auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error creating Shopee auth URL:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Callback endpoint - Processes the response from Shopee
app.get('/api/shopee/callback', async (req, res) => {
  try {
    const { code, shop_id } = req.query;
    
    if (!code || !shop_id) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both code and shop_id are required'
      });
    }
    
    console.log('Received callback with code and shop_id');
    
    // Exchange code for token
    const tokenData = await shopeeApi.exchangeCodeForToken(code, shop_id);
    
    if (tokenData.error) {
      // If there's an error, redirect to React app with error params
      return res.redirect(`http://localhost:3000?shopee_auth=error&message=${encodeURIComponent(tokenData.message || 'Token exchange failed')}`);
    }
    
    // Successful token exchange - redirect to React app
    return res.redirect(`http://localhost:3000?shopee_auth=success&message=Authentication+successful&shop_id=${shop_id}&expires_in=${tokenData.expire_in || 0}`);
  } catch (error) {
    console.error('Error in Shopee callback:', error);
    res.redirect(`http://localhost:3000?shopee_auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Authentication status endpoint
app.get('/api/shopee/auth/status', (req, res) => {
  try {
    const status = shopeeApi.getAuthStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Manual token save endpoint
app.post('/api/shopee/save-token', (req, res) => {
  try {
    const result = shopeeApi.saveManualToken(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save token',
      error: error.message
    });
  }
});

// Logout endpoint
app.post('/api/shopee/logout', (req, res) => {
  try {
    const result = shopeeApi.clearAuthData();
    res.json(result);
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    });
  }
});

// Generic Shopee API proxy
app.all('/api/shopee/api/*', async (req, res) => {
  try {
    // Extract the API path from the URL
    const apiPath = req.url.replace('/api/shopee/api', '');
    
    // Check if we're authenticated
    const authStatus = shopeeApi.getAuthStatus();
    if (!authStatus.authenticated) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must authenticate with Shopee first'
      });
    }
    
    // Call Shopee API with appropriate method, path and data
    const result = await shopeeApi.callShopeeApi(
      req.method,
      apiPath,
      req.method !== 'GET' ? req.body : {},
      req.query
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error proxying to Shopee API:', error);
    res.status(error.status || 500).json({
      error: error.error || 'API Call Failed',
      message: error.message,
      details: error.details
    });
  }
});

// Helper HTML pages
app.get('/shopee-token-helper', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shopee-token-helper.html'));
});

// Fallback route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Shopee API authentication available at: http://localhost:${PORT}/api/shopee/auth`);
  console.log(`TikTok API proxy available at: http://localhost:${PORT}/api/tiktok/api`);
});
