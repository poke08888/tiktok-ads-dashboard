import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-3 md:mb-0">
          <p className="text-sm text-gray-500">© 2025 TikTok Ads Management. All rights reserved.</p>
        </div>
        
        <div className="flex space-x-6">
          <a href="#help" className="text-sm text-gray-500 hover:text-tiktok-blue transition-colors">Help Center</a>
          <a href="#privacy" className="text-sm text-gray-500 hover:text-tiktok-blue transition-colors">Privacy Policy</a>
          <a href="#terms" className="text-sm text-gray-500 hover:text-tiktok-blue transition-colors">Terms of Service</a>
          <a href="#contact" className="text-sm text-gray-500 hover:text-tiktok-blue transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
