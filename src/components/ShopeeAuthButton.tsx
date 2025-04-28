import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface AuthStatus {
  authenticated: boolean;
  expired?: boolean;
  shop_id?: string;
  expires_at?: number;
}

/**
 * Component nút xác thực Shopee
 * Hiển thị nút đăng nhập/đăng xuất và trạng thái xác thực
 */
const ShopeeAuthButton: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  // Kiểm tra trạng thái xác thực khi component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Xử lý redirect sau khi đăng nhập Shopee
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authResult = searchParams.get('shopee_auth');
    
    if (authResult === 'success') {
      // Xóa tham số khỏi URL để tránh reload làm mất state
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Cập nhật trạng thái và thông báo thành công
      checkAuthStatus();
      alert('Đăng nhập Shopee thành công!');
    } else if (authResult === 'error') {
      const errorMessage = searchParams.get('message') || 'Không thể đăng nhập với Shopee.';
      
      // Xóa tham số khỏi URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Thông báo lỗi
      alert(`Lỗi đăng nhập: ${errorMessage}`);
    }
  }, [location]);

  // Hàm kiểm tra trạng thái xác thực
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get<AuthStatus>('http://localhost:4000/api/shopee/auth/status');
      setAuthStatus(response.data);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  // Hàm làm mới token khi hết hạn
  const refreshToken = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:4000/api/shopee/auth/refresh');
      await checkAuthStatus();
      alert('Đã làm mới token thành công!');
    } catch (error) {
      console.error('Error refreshing token:', error);
      alert('Không thể làm mới token. Vui lòng đăng nhập lại.');
      setAuthStatus({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng nhập
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/api/shopee/auth';
  };

  if (loading) {
    return <div className="px-4 py-2 text-gray-500">Đang kiểm tra kết nối Shopee...</div>;
  }

  // Nếu chưa xác thực hoặc token hết hạn
  if (!authStatus?.authenticated || authStatus?.expired) {
    return (
      <div className="flex flex-col space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="text-sm text-red-600 font-medium">
          {authStatus?.expired 
            ? 'Phiên đăng nhập Shopee đã hết hạn!' 
            : 'Bạn chưa kết nối với Shopee API'}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={authStatus?.expired ? refreshToken : handleLogin}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {authStatus?.expired ? 'Làm mới token' : 'Đăng nhập với Shopee'}
          </button>
          {authStatus?.expired && (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Đăng nhập lại
            </button>
          )}
        </div>
      </div>
    );
  }

  // Đã xác thực và token còn hạn
  return (
    <div className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="text-sm text-green-600 font-medium">
        Đã kết nối với Shopee Shop ID: {authStatus.shop_id}
      </div>
      <div className="text-xs text-gray-500">
        {authStatus.expires_at && (
          <span>
            Token hết hạn vào: {new Date(authStatus.expires_at * 1000).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ShopeeAuthButton;
