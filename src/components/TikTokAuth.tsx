import React, { useEffect, useState } from 'react';
import { getAuthorizationUrl, exchangeCodeForToken } from '../api/tiktok/auth';

interface TikTokAuthProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

const TikTokAuth: React.FC<TikTokAuthProps> = ({ onSuccess, onError }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Xử lý callback từ TikTok OAuth redirect
  useEffect(() => {
    // Kiểm tra xem có code trong URL không (sau khi redirect từ TikTok)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorMsg = urlParams.get('error');
    const state = urlParams.get('state');
    
    if (code) {
      handleAuthCode(code);
    } else if (errorMsg) {
      setError(`TikTok authentication error: ${errorMsg}`);
      onError && onError(new Error(errorMsg));
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý code từ TikTok để lấy access token
  const handleAuthCode = async (code: string) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const tokenData = await exchangeCodeForToken(code);
      
      // Xóa code từ URL (để tránh refresh làm lặp lại quá trình)
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.pathname);
      
      // Trả kết quả về component cha
      onSuccess && onSuccess(tokenData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during authentication';
      setError(errorMessage);
      onError && onError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Bắt đầu quá trình đăng nhập TikTok
  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      // getAuthorizationUrl trả về Promise vì cần tạo code_challenge
      const authUrl = await getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi tạo URL xác thực';
      setError(errorMessage);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">TikTok Account Connection</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 w-full">
          {error}
        </div>
      )}
      
      <button
        className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        onClick={handleLogin}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path fill="currentColor" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
            </svg>
            Connect TikTok Account
          </>
        )}
      </button>
      
      <p className="text-sm text-gray-600 mt-3 text-center">
        Connect your TikTok Ads account to access analytics and reporting data.
      </p>
    </div>
  );
};

export default TikTokAuth;
