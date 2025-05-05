const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Thêm route kiểm tra cơ bản
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Khởi động server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server đang chạy tại http://localhost:${PORT}`);
});
