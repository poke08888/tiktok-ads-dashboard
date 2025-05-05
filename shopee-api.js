/**
 * Shopee API Integration - Separate module for cleaner code
 * Created for TikTok Ads Dashboard
 */

const axios = require('axios');
const crypto = require('crypto');

// Shopee API constants
const SHOPEE_API_URL = 'https://partner.shopeemobile.com';
const PARTNER_ID = process.env.SHOPEE_PARTNER_ID || '2011192';
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY || '785361484d5a7556724f6f6d6e796167586a574f544e4b50436c5a6862677359';
const SHOP_ID = process.env.SHOPEE_SHOP_ID || '280778267';
const REDIRECT_URL = 'http://localhost:4000/api/shopee/callback';

// In-memory token storage (should be replaced with database in production)
let shopeeTokens = null;

/**
 * Generates a signature for Shopee API calls
 * @param {string} apiPath - The API endpoint path
 * @param {number} timestamp - UNIX timestamp in seconds
 * @returns {string} - The generated signature
 */
function generateSignature(apiPath, timestamp) {
  const baseString = `${PARTNER_ID}${apiPath}${timestamp}`;
  return crypto.createHmac('sha256', PARTNER_KEY)
    .update(baseString)
    .digest('hex');
}

/**
 * Builds an authentication URL for Shopee Partner authentication
 * @returns {Object} - Object containing the authentication URL and timestamp used
 */
function buildAuthUrl() {
  const timestamp = Math.floor(Date.now() / 1000);
  const apiPath = '/api/v2/shop/auth_partner';
  const sign = generateSignature(apiPath, timestamp);
  const redirectParam = encodeURIComponent(REDIRECT_URL);
  
  const authUrl = `${SHOPEE_API_URL}${apiPath}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&redirect=${redirectParam}`;
  
  return {
    authUrl,
    timestamp
  };
}

/**
 * Exchange authorization code for access token
 * @param {string} code - The authorization code received from Shopee
 * @param {string} shopId - The shop ID
 * @returns {Promise<Object>} - Token response
 */
async function exchangeCodeForToken(code, shopId) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/auth/access_token/get';
    const sign = generateSignature(apiPath, timestamp);
    
    const requestBody = {
      code,
      shop_id: parseInt(shopId, 10),
      partner_id: parseInt(PARTNER_ID, 10),
      main_account_id: parseInt(PARTNER_ID, 10), // Required for token exchange
      sign_auth: true // Required parameter
    };
    
    const tokenUrl = `${SHOPEE_API_URL}${apiPath}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`;
    const response = await axios.post(tokenUrl, requestBody);
    
    if (response.data && !response.data.error) {
      // Store token in memory
      shopeeTokens = {
        ...response.data,
        created_at: timestamp,
        shop_id: shopId
      };
      
      console.log('Token retrieved and stored successfully');
      return response.data;
    } else {
      console.error('Error in token exchange response:', response.data);
      return { 
        error: response.data.error || 'Unknown error',
        message: response.data.message || 'Failed to exchange code for token'
      };
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    return {
      error: 'token_exchange_failed',
      message: error.response?.data?.message || error.message
    };
  }
}

/**
 * Call the Shopee API with proper authentication
 * @param {string} method - HTTP method (GET/POST)
 * @param {string} apiPath - API endpoint path
 * @param {Object} data - Request data/body (for POST)
 * @param {Object} params - URL parameters
 * @returns {Promise<Object>} - API response
 */
async function callShopeeApi(method, apiPath, data = {}, params = {}) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = generateSignature(apiPath, timestamp);
    
    // Merge required params with user-provided params
    const requestParams = {
      ...params,
      partner_id: PARTNER_ID,
      timestamp,
      sign,
      access_token: shopeeTokens?.access_token,
      shop_id: shopeeTokens?.shop_id || SHOP_ID
    };
    
    // Build request config
    const config = {
      method,
      url: `${SHOPEE_API_URL}${apiPath}`,
      params: requestParams
    };
    
    // Add data body for POST requests
    if (method.toUpperCase() === 'POST') {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error calling Shopee API ${apiPath}:`, error.response?.data || error.message);
    throw {
      error: 'api_call_failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    };
  }
}

/**
 * Get authentication status
 * @returns {Object} - Authentication status
 */
function getAuthStatus() {
  // If we don't have any tokens
  if (!shopeeTokens) {
    return {
      authenticated: false,
      message: 'Not authenticated with Shopee'
    };
  }
  
  // Check if tokens are expired
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenCreatedAt = shopeeTokens.created_at || 0;
  const expireIn = shopeeTokens.expire_in || 0;
  const expiresAt = tokenCreatedAt + expireIn;
  
  if (currentTime < expiresAt) {
    // Token is still valid
    return {
      authenticated: true,
      expires_in: expireIn,
      expires_at: expiresAt,
      shop_id: shopeeTokens.shop_id,
      shop_name: shopeeTokens.shop_name || 'Shopee Shop',
      message: 'Authenticated with Shopee'
    };
  } else {
    // Token has expired
    return {
      authenticated: false,
      message: 'Shopee token has expired',
      expired: true
    };
  }
}

/**
 * Save a manually provided token
 * @param {Object} tokenData - The token data to save
 * @returns {Object} - Status and saved data
 */
function saveManualToken(tokenData) {
  if (!tokenData || !tokenData.access_token) {
    return {
      success: false,
      message: 'Invalid token data provided'
    };
  }
  
  const timestamp = Math.floor(Date.now() / 1000);
  
  shopeeTokens = {
    ...tokenData,
    created_at: timestamp
  };
  
  return {
    success: true,
    message: 'Token saved successfully',
    data: getAuthStatus()
  };
}

/**
 * Clear stored authentication data
 * @returns {Object} - Status
 */
function clearAuthData() {
  shopeeTokens = null;
  return {
    success: true,
    message: 'Authentication data cleared'
  };
}

module.exports = {
  buildAuthUrl,
  exchangeCodeForToken,
  callShopeeApi,
  getAuthStatus,
  saveManualToken,
  clearAuthData,
  // Export constants for reference
  REDIRECT_URL,
  PARTNER_ID,
  SHOP_ID
};
