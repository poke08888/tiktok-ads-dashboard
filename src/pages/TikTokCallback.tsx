import React, { useEffect, useState } from 'react';
import { exchangeCodeForToken } from '../api/tiktok/auth';
import { useNavigate } from 'react-router-dom';

const TikTokCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Đang xử lý xác thực TikTok...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Kiểm tra xem có code trong URL không (sau khi redirect từ TikTok)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorMsg = urlParams.get('error');
        
        if (errorMsg) {
          setStatus('error');
          setMessage(`Lỗi xác thực TikTok: ${errorMsg}`);
          return;
        }
        
        if (!code) {
          setStatus('error');
          setMessage('Không tìm thấy mã xác thực trong URL. Vui lòng thử lại.');
          return;
        }

        // Đổi code lấy token
        const tokenData = await exchangeCodeForToken(code);
        
        setStatus('success');
        setMessage('Xác thực thành công! Đang chuyển hướng về trang chính...');
        
        // Redirect về trang chính sau 2 giây
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } catch (err) {
        setStatus('error');
        setMessage(`Lỗi khi xác thực: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <svg 
            className={`w-16 h-16 ${status === 'processing' ? 'text-blue-500' : status === 'success' ? 'text-green-500' : 'text-red-500'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {status === 'processing' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            )}
            {status === 'success' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            )}
            {status === 'error' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          {status === 'processing' && 'Đang Kết Nối'}
          {status === 'success' && 'Kết Nối Thành Công'}
          {status === 'error' && 'Kết Nối Thất Bại'}
        </h2>

        <p className="text-center text-gray-600">
          {message}
        </p>

        {status === 'error' && (
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Quay Lại Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TikTokCallback;
