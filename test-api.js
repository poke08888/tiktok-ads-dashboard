const axios = require('axios');
require('dotenv').config();

// URL của proxy server
// Kiểm tra trạng thái proxy server trước
const proxyBaseUrl = 'http://localhost:4000';
const proxyTestUrl = `${proxyBaseUrl}/test`;
const proxyApiUrl = `${proxyBaseUrl}/api/shopee/order/get_order_list`;

// Tham số thời gian
const timeFrom = Math.floor(Date.now() / 1000) - (86400 * 3); // 3 ngày trước
const timeTo = Math.floor(Date.now() / 1000); // hiện tại

// Hàm test API
async function testApi() {
  try {
    // Kiểm tra proxy server có hoạt động không
    console.log('Kiểm tra trạng thái proxy server...');
    try {
      const statusResponse = await axios.get(`${proxyBaseUrl}/api/status`);
      console.log('Proxy server status:', statusResponse.data);
      
      // Kiểm tra endpoint test
      console.log('Kiểm tra endpoint test của proxy server...');
      const testResponse = await axios.get(proxyTestUrl);
      console.log('Test endpoint response:', testResponse.data);
    } catch (error) {
      console.error('Không thể kết nối đến proxy server:', error.message);
      console.log('Hãy đảm bảo proxy server đang chạy tại', proxyBaseUrl);
      return;
    }
    
    console.log('Đang kiểm tra kết nối đến Shopee API qua proxy server...');
    
    const params = {
      time_range_field: 'create_time',
      time_from: timeFrom,
      time_to: timeTo,
      page_size: 10
    };
    
    console.log('URL:', proxyApiUrl);
    console.log('Request params:', params);
    
    const response = await axios.get(proxyApiUrl, { params });
    
    console.log('Kết nối thành công!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.data && response.data.response) {
      console.log('Số lượng đơn hàng:', response.data.response.order_list ? response.data.response.order_list.length : 0);
      console.log('Mẫu dữ liệu:', JSON.stringify(response.data.response, null, 2).substring(0, 500) + '...');
    } else {
      console.log('Dữ liệu trả về:', response.data);
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra kết nối:');
    
    if (error.response) {
      // Server trả về mã status ngoài dải 2xx
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
      console.error('- Headers:', error.response.headers);
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error('- Không nhận được phản hồi từ server');
      console.error('- Request:', error.request);
    } else {
      // Lỗi khác
      console.error('- Message:', error.message);
    }
    
    console.error('- Stack:', error.stack);
  }
}

// Chạy test
testApi();
