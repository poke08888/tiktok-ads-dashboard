/**
 * Module quản lý token sử dụng SQLite
 * Thay thế cho việc lưu token vào file JSON
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Cấu hình database
const DB_PATH = path.join(__dirname, 'tokens.db');
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'shopee-tiktok-dashboard-secret-key';

// Khởi tạo database
const initializeDb = () => {
  const db = new Database(DB_PATH);
  
  // Tạo bảng tokens nếu chưa tồn tại
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      platform TEXT PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      created_at INTEGER,
      expire_in INTEGER,
      shop_id TEXT,
      advertiser_id TEXT,
      additional_data TEXT,
      updated_at INTEGER
    )
  `);
  
  return db;
};

// Mã hóa dữ liệu nhạy cảm
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Giải mã dữ liệu
const decrypt = (text) => {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error('Decryption error:', e);
    return null;
  }
};

// Database instance
let db;

/**
 * Module quản lý token
 */
const TokenStorage = {
  /**
   * Khởi tạo database
   */
  initialize: () => {
    try {
      db = initializeDb();
      console.log('Token database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize token database:', error);
      return false;
    }
  },

  /**
   * Lấy thông tin token của một platform
   * @param {string} platform - Platform cần lấy token (shopee, tiktok, etc.)
   * @returns {object|null} Thông tin token hoặc null nếu không tìm thấy
   */
  getToken: (platform) => {
    try {
      const stmt = db.prepare('SELECT * FROM tokens WHERE platform = ?');
      const token = stmt.get(platform);
      
      if (!token) return null;
      
      // Giải mã các trường nhạy cảm
      if (token.access_token) token.access_token = decrypt(token.access_token);
      if (token.refresh_token) token.refresh_token = decrypt(token.refresh_token);
      
      // Parse additional_data nếu có
      if (token.additional_data) {
        try {
          token.additional_data = JSON.parse(token.additional_data);
        } catch (e) {
          console.warn('Failed to parse additional_data for', platform);
        }
      }
      
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Lưu hoặc cập nhật token
   * @param {string} platform - Platform cần lưu token (shopee, tiktok, etc.)
   * @param {object} tokenData - Dữ liệu token cần lưu
   * @returns {boolean} Kết quả lưu token
   */
  saveToken: (platform, tokenData) => {
    try {
      // Mã hóa các trường nhạy cảm
      const encryptedData = { ...tokenData };
      if (encryptedData.access_token) {
        encryptedData.access_token = encrypt(encryptedData.access_token);
      }
      if (encryptedData.refresh_token) {
        encryptedData.refresh_token = encrypt(encryptedData.refresh_token);
      }
      
      // Chuyển additional_data thành JSON string nếu là object
      if (encryptedData.additional_data && typeof encryptedData.additional_data === 'object') {
        encryptedData.additional_data = JSON.stringify(encryptedData.additional_data);
      }
      
      // Thêm thời gian cập nhật
      encryptedData.updated_at = Math.floor(Date.now() / 1000);
      
      // Kiểm tra xem token đã tồn tại chưa
      const existingToken = db.prepare('SELECT 1 FROM tokens WHERE platform = ?').get(platform);
      
      if (existingToken) {
        // Cập nhật token hiện có
        const updateStmt = db.prepare(`
          UPDATE tokens 
          SET access_token = ?, refresh_token = ?, created_at = ?, expire_in = ?, 
              shop_id = ?, advertiser_id = ?, additional_data = ?, updated_at = ?
          WHERE platform = ?
        `);
        
        updateStmt.run(
          encryptedData.access_token || null,
          encryptedData.refresh_token || null,
          encryptedData.created_at || Math.floor(Date.now() / 1000),
          encryptedData.expire_in || null,
          encryptedData.shop_id || null,
          encryptedData.advertiser_id || null,
          encryptedData.additional_data || null,
          encryptedData.updated_at,
          platform
        );
      } else {
        // Thêm token mới
        const insertStmt = db.prepare(`
          INSERT INTO tokens 
          (platform, access_token, refresh_token, created_at, expire_in, 
           shop_id, advertiser_id, additional_data, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        insertStmt.run(
          platform,
          encryptedData.access_token || null,
          encryptedData.refresh_token || null,
          encryptedData.created_at || Math.floor(Date.now() / 1000),
          encryptedData.expire_in || null,
          encryptedData.shop_id || null,
          encryptedData.advertiser_id || null,
          encryptedData.additional_data || null,
          encryptedData.updated_at
        );
      }
      
      console.log(`Token for ${platform} saved successfully`);
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  },

  /**
   * Xóa token
   * @param {string} platform - Platform cần xóa token
   * @returns {boolean} Kết quả xóa token
   */
  deleteToken: (platform) => {
    try {
      const stmt = db.prepare('DELETE FROM tokens WHERE platform = ?');
      stmt.run(platform);
      console.log(`Token for ${platform} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting token:', error);
      return false;
    }
  },

  /**
   * Kiểm tra trạng thái token (còn hạn, hết hạn)
   * @param {string} platform - Platform cần kiểm tra
   * @returns {object} Trạng thái token với các trường: exists, expired, expiresAt
   */
  checkTokenStatus: (platform) => {
    const token = TokenStorage.getToken(platform);
    if (!token || !token.access_token) {
      return {
        exists: false,
        expired: true,
        expiresAt: null
      };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = token.created_at + token.expire_in;
    const isExpired = now >= expiresAt;
    
    return {
      exists: true,
      expired: isExpired,
      expiresAt: expiresAt,
      remainingSeconds: Math.max(0, expiresAt - now)
    };
  },

  /**
   * Đóng database connection
   */
  close: () => {
    if (db) {
      db.close();
      console.log('Token database connection closed');
    }
  },

  /**
   * Chuyển đổi từ file JSON sang SQLite
   * @param {string} jsonFilePath - Đường dẫn đến file JSON cũ
   * @param {string} platform - Platform của token (shopee, tiktok)
   * @returns {boolean} Kết quả chuyển đổi
   */
  migrateFromJson: (jsonFilePath, platform) => {
    try {
      if (!fs.existsSync(jsonFilePath)) {
        console.log(`No JSON file found at ${jsonFilePath}, skipping migration`);
        return false;
      }
      
      const tokenData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      const result = TokenStorage.saveToken(platform, tokenData);
      
      if (result) {
        console.log(`Successfully migrated tokens from ${jsonFilePath} to SQLite`);
        // Tạo bản sao của file JSON cũ
        const backupPath = `${jsonFilePath}.bak`;
        fs.copyFileSync(jsonFilePath, backupPath);
        console.log(`Created backup of old JSON file at ${backupPath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error migrating from JSON:', error);
      return false;
    }
  }
};

module.exports = TokenStorage;
