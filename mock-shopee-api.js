const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4001;
const MOCK_DATA_FILE = path.join(__dirname, 'mock_shopee_orders.json');

// Tạo dữ liệu giả nếu không tồn tại
if (!fs.existsSync(MOCK_DATA_FILE)) {
  const mockOrders = {
    orders: Array(20).fill().map((_, i) => ({
      order_id: `MCK${(10000000 + i).toString()}`,
      order_status: ['READY_TO_SHIP', 'SHIPPED', 'COMPLETED', 'COMPLETED', 'COMPLETED'][Math.floor(Math.random() * 5)],
      create_time: Math.floor(Date.now() / 1000) - (i * 86400 + Math.floor(Math.random() * 86400)),
      update_time: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      shipping_carrier: ['Standard', 'Express', 'Economy'][Math.floor(Math.random() * 3)],
      total_amount: Math.floor(Math.random() * 1000000) + 50000,
      currency: 'VND',
      buyer_user_id: Math.floor(Math.random() * 10000000),
      buyer_username: `user_${Math.floor(Math.random() * 1000)}`,
      payment_method: ['COD', 'Card', 'Bank Transfer'][Math.floor(Math.random() * 3)],
      estimated_shipping_fee: Math.floor(Math.random() * 30000) + 10000,
      items: Array(Math.floor(Math.random() * 3) + 1).fill().map((_, j) => ({
        item_id: Math.floor(Math.random() * 1000000),
        item_name: `Sản phẩm mẫu #${j + 1}`,
        item_sku: `SKU${Math.floor(Math.random() * 10000)}`,
        model_id: Math.floor(Math.random() * 10000),
        model_name: `Mẫu ${['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)]}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        original_price: Math.floor(Math.random() * 200000) + 50000,
        discounted_price: Math.floor(Math.random() * 150000) + 30000,
      }))
    }))
  };
  fs.writeFileSync(MOCK_DATA_FILE, JSON.stringify(mockOrders, null, 2));
}

// Đọc dữ liệu đơn hàng mock
const getMockOrders = () => {
  try {
    return JSON.parse(fs.readFileSync(MOCK_DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading mock data:', err);
    return { orders: [] };
  }
};

// Routes
app.get('/test', (req, res) => {
  res.json({ message: 'Mock Shopee API server đang hoạt động!' });
});

// Mock auth status endpoint
app.get('/api/shopee/auth/status', (req, res) => {
  res.json({
    authenticated: true,
    expired: false,
    shop_id: '280778267',
    expires_at: Math.floor(Date.now() / 1000) + 7200 // hết hạn sau 2 giờ
  });
});

// Mock auth endpoint - luôn chuyển hướng đến callback
app.get('/api/shopee/auth', (req, res) => {
  console.log('Mock auth được gọi, chuyển hướng tới callback');
  res.redirect('http://localhost:3000?shopee_auth=success');
});

// Mock refresh token endpoint
app.post('/api/shopee/auth/refresh', (req, res) => {
  res.json({
    success: true,
    message: 'Token đã được làm mới trong môi trường test'
  });
});

// Mock order list API
app.get('/api/shopee/order/get_order_list', (req, res) => {
  const { time_from, time_to, page_size = 20 } = req.query;
  console.log('Get order list called with params:', req.query);

  const { orders } = getMockOrders();
  
  // Lọc đơn hàng theo thời gian nếu có
  let filteredOrders = orders;
  if (time_from && time_to) {
    filteredOrders = orders.filter(order => 
      order.create_time >= Number(time_from) && 
      order.create_time <= Number(time_to)
    );
  }

  // Giới hạn số lượng đơn hàng trả về
  const limitedOrders = filteredOrders.slice(0, Number(page_size));

  res.json({
    error: "",
    message: "Success",
    response: {
      more: filteredOrders.length > Number(page_size),
      next_cursor: filteredOrders.length > Number(page_size) ? "mockcursor123" : "",
      order_list: limitedOrders
    },
    request_id: `mock_req_${Date.now()}`
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Mock Shopee API Server đang chạy tại http://localhost:${PORT}`);
  console.log('Sử dụng API này để thử nghiệm mà không cần kết nối thực tế với Shopee API');
});
