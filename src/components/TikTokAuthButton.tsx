import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Alert, Space, Tooltip, Badge, Typography } from 'antd';
import { ShopOutlined, SyncOutlined, LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { TIKTOK_API_CONFIG } from '../api/config';

const { Text } = Typography;

// Interface for the authentication status response
interface AuthStatusResponse {
  authenticated: boolean;
  expired?: boolean;
  advertiser_id?: string;
  expires_at?: number;
  expires_in_minutes?: number;
  auto_refresh_enabled?: boolean;
  scope?: string[];
}

/**
 * Component TikTokAuthButton
 * Hiển thị nút đăng nhập/đăng xuất và trạng thái xác thực với TikTok
 */
const TikTokAuthButton: React.FC = () => {
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
    if (!authStatus?.authenticated || !authStatus?.expires_at) {
      setTimeLeft('');
      return;
    }
    
    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = authStatus.expires_at || 0;
      const secondsLeft = Math.max(0, expiresAt - now);
      
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

  // Xử lý redirect sau khi đăng nhập TikTok
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authResult = searchParams.get('tiktok_auth');
    
    if (authResult === 'success') {
      // Xóa query params sau khi xử lý
      const url = new URL(window.location.href);
      url.searchParams.delete('tiktok_auth');
      window.history.replaceState({}, '', url.toString());
      
      // Thông báo đăng nhập thành công
      checkAuthStatus();
    } else if (authResult === 'error') {
      const errorMessage = searchParams.get('message') || 'Unknown error';
      
      // Xóa query params sau khi xử lý
      const url = new URL(window.location.href);
      url.searchParams.delete('tiktok_auth');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
      
      // Thông báo lỗi
      setError(`Lỗi đăng nhập TikTok: ${errorMessage}`);
    }
  }, []);

  // Hàm kiểm tra trạng thái xác thực
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get<AuthStatusResponse>(TIKTOK_API_CONFIG.AUTH_STATUS_URL);
      setAuthStatus(response.data);
    } catch (error) {
      console.error('Error checking TikTok auth status:', error);
      setError('Không thể kết nối với máy chủ TikTok. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm làm mới token
  const refreshToken = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await axios.post(TIKTOK_API_CONFIG.AUTH_REFRESH_URL);
      
      if (response.data.success) {
        await checkAuthStatus();
      } else {
        setError('Không thể làm mới token TikTok. Vui lòng đăng nhập lại.');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setError('Lỗi khi làm mới token TikTok. Vui lòng đăng nhập lại.');
    } finally {
      setRefreshing(false);
    }
  };

  // Hàm đăng nhập
  const handleLogin = () => {
    window.location.href = TIKTOK_API_CONFIG.AUTH_URL;
  };

  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      await axios.post(TIKTOK_API_CONFIG.AUTH_LOGOUT_URL);
      await checkAuthStatus();
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Lỗi khi đăng xuất. Vui lòng thử lại sau.');
    }
  };

  // Render based on authentication status
  if (loading) {
    return <Button type="default" loading icon={<ShopOutlined />}>Kiểm tra kết nối TikTok...</Button>;
  }
  
  // If there's an error
  if (error) {
    return (
      <Alert
        message="Lỗi kết nối TikTok"
        description={error}
        type="error"
        closable
        onClose={() => setError(null)}
      />
    );
  }
  
  // If not authenticated or token expired
  if (!authStatus?.authenticated || authStatus?.expired) {
    return (
      <Alert
        type="warning"
        message={authStatus?.expired ? 'Token TikTok đã hết hạn' : 'Chưa kết nối TikTok'}
        description={
          <Space direction="vertical">
            <div>
              {authStatus?.expired 
                ? 'Token TikTok đã hết hạn. Vui lòng làm mới hoặc đăng nhập lại.' 
                : 'Bạn chưa kết nối với TikTok API. Hãy đăng nhập để xem dữ liệu chiến dịch.'}
            </div>
            <Space>
              <Button
                type="primary"
                icon={authStatus?.expired ? <SyncOutlined /> : <ShopOutlined />}
                onClick={authStatus?.expired ? refreshToken : handleLogin}
              >
                {authStatus?.expired ? 'Làm mới Token' : 'Đăng nhập với TikTok'}
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
  
  // If authenticated
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Alert
        message={
          <Space>
            {authStatus.expired ? "Token đã hết hạn" : "TikTok đã kết nối thành công"}
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
            <div>Advertiser ID: {authStatus.advertiser_id}</div>
            {authStatus.scope && authStatus.scope.length > 0 && (
              <div>Scopes: {authStatus.scope.join(', ')}</div>
            )}
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
                  onClick={handleLogout}
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
  );
};

export default TikTokAuthButton;
