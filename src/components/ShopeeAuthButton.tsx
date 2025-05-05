import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Alert, Space, Tooltip, Badge, Typography } from 'antd';
import { ShopOutlined, SyncOutlined, LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Interface for the authentication status
interface AuthStatusResponse {
  authenticated: boolean;
  expires_in?: number | null;
  shop_name?: string | null;
  expired?: boolean;
  message?: string | null;
  expires_in_minutes?: number;
  auto_refresh_enabled?: boolean;
}

/**
 * Component ShopeeAuthButton
 * Hiển thị nút đăng nhập/đăng xuất và trạng thái xác thực
 */
const ShopeeAuthButton: React.FC = () => {
  // State variables
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Effect to check authentication status when component mounts
  useEffect(() => {
    checkAuthStatus();
    
    // Check status every 5 minutes
    const intervalId = setInterval(checkAuthStatus, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Effect to update countdown timer
  useEffect(() => {
    if (!authStatus?.authenticated || !authStatus?.expires_in) {
      setTimeLeft('');
      return;
    }
    
    const updateTimeLeft = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresAt = currentTime + (authStatus.expires_in || 0);
      const secondsLeft = Math.max(0, expiresAt - currentTime);
      
      if (secondsLeft <= 0) {
        setTimeLeft('Hết hạn');
        return;
      }
      
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}p`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}p ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };
    
    updateTimeLeft();
    const timerId = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(timerId);
  }, [authStatus]);

  // Xử lý redirect sau khi đăng nhập Shopee
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
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
  }, []);

  // Hàm kiểm tra trạng thái xác thực
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get<AuthStatusResponse>('http://admin.nonelab.net:4000/api/shopee/auth/status');
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
      await axios.post('http://admin.nonelab.net:4000/api/shopee/auth/refresh');
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

  // Hàm xử lý đăng nhập - sử dụng phiên bản server cải tiến
  const handleLogin = () => {
    // Giải thích cách thức xử lý OAuth flow với Shopee
    alert('Chuẩn bị đăng nhập với Shopee:\n\n' + 
          '1. Bạn sẽ được điều hướng tới trang xác thực Shopee\n' +
          '2. Sau khi xác thực thành công, quá trình tự động hoàn tất\n' +
          '3. Hệ thống sẽ tự động lưu token và chuyển hướng về trang chính');
    
    // Sử dụng đường dẫn tương đối cho môi trường production
    window.location.href = '/shopee-token-helper';
  };

  // Render based on authentication status
  if (loading) return <Button type="default" loading icon={<ShopOutlined />}>Kiểm tra...</Button>;
  
  // If there's an error
  if (error) {
    return (
      <Alert
        message="Lỗi kết nối Shopee"
        description={error}
        type="error"
        closable
        onClose={() => setError(null)}
      />
    );
  }
  
  // Nếu chưa xác thực hoặc token hết hạn
  if (!authStatus?.authenticated || authStatus?.expired) {
    return (
      <Alert
        type="warning"
        message={authStatus?.expired ? 'Token Shopee đã hết hạn' : 'Chưa kết nối Shopee'}
        description={
          <Space direction="vertical">
            <div>
              {authStatus?.expired 
                ? 'Token Shopee đã hết hạn. Vui lòng làm mới hoặc đăng nhập lại.' 
                : 'Bạn chưa kết nối với Shopee API. Hãy đăng nhập để xem dữ liệu đơn hàng.'}
            </div>
            <Space>
              <Button
                type="primary"
                icon={authStatus?.expired ? <SyncOutlined /> : <ShopOutlined />}
                onClick={authStatus?.expired ? refreshToken : handleLogin}
              >
                {authStatus?.expired ? 'Làm mới Token' : 'Đăng nhập với Shopee'}
              </Button>
              {authStatus?.expired && (
                <Button
                  type="default"
                  icon={<ShopOutlined />}
                  onClick={handleLogin}
                >
                  Đăng nhập lại
                </Button>
              )}
            </Space>
          </Space>
        }
      />
    );
  }

  // Nếu đã xác thực
  return authStatus ? (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Alert
        message={
          <Space>
            {authStatus.expired ? "Token đã hết hạn" : "Shopee đã kết nối thành công"}
            {!authStatus.expired && timeLeft && (
              <Badge 
                status={authStatus.expired ? 'error' : 
                  (authStatus.expires_in_minutes && authStatus.expires_in_minutes < 30) ? 'warning' : 'success'} 
                text={
                  <Tooltip title="Thời gian còn lại của token">
                    <Space>
                      <ClockCircleOutlined />
                      <Text>{timeLeft}</Text>
                    </Space>
                  </Tooltip>
                } 
              />
            )}
            {authStatus.auto_refresh_enabled && (
              <Tooltip title="Tự động làm mới token khi sắp hết hạn">
                <Badge status="processing" text="Auto-refresh" />
              </Tooltip>
            )}
          </Space>
        }
        description={
          <Space direction="vertical">
            <div>Shop Info: {authStatus.shop_name || 'Not available'}</div>
            {refreshing ? (
              <Button type="dashed" loading>Đang làm mới token...</Button>
            ) : (
              <Space>
                {authStatus.expired ? (
                  <Button 
                    type="primary" 
                    danger 
                    icon={<SyncOutlined />} 
                    onClick={refreshToken}
                  >
                    Làm mới token
                  </Button>
                ) : (
                  <Button 
                    type="default" 
                    icon={<SyncOutlined />} 
                    onClick={refreshToken}
                  >
                    Làm mới token thủ công
                  </Button>
                )}
                <Button 
                  type="default" 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogin}
                >
                  Đăng xuất
                </Button>
              </Space>
            )}
          </Space>
        }
        type={authStatus.expired ? "warning" : "success"}
      />
    </Space>
  ) : null;

};

export default ShopeeAuthButton;
