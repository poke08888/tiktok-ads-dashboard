import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/' },
    { name: 'Campaigns', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', path: '/campaigns' },
    { name: 'Ad Groups', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', path: '/ad-groups' },
    { name: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/reports' },
    { name: 'Recommendations', icon: 'M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z', path: '/recommendations' },
    { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', children: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', path: '/settings' },
  ];
  
  // Link chính thức tới trang quản lý TikTok Ads
  const externalLinks = [
    { name: 'TikTok Ads Manager', icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14', url: 'https://ads.tiktok.com/i18n/login/' }
  ];

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  useEffect(() => {
    // Lưu trạng thái sidebar vào localStorage để duy trì qua các lần tải trang
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  // Khôi phục trạng thái từ localStorage khi component được mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      const isCollapsed = savedState === 'true';
      setCollapsed(isCollapsed);
      if (onToggle) onToggle(isCollapsed);
    }
  }, [onToggle]);

  return (
    <div className={`bg-gray-900 text-white ${collapsed ? 'w-20' : 'w-64'} flex-shrink-0 h-screen transition-all duration-300 ease-in-out`}>
      <div className={`${collapsed ? 'py-4 px-2' : 'p-4'} border-b border-gray-800 flex justify-between items-center`}>
        <div className="flex items-center overflow-hidden">
          <svg className="h-8 w-8 text-tiktok-red flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.321 5.562a5.124 5.124 0 01-4.879-3.562H10.266v13.162c0 2.053-1.668 3.723-3.724 3.723-2.054 0-3.724-1.67-3.724-3.723s1.669-3.724 3.724-3.724c.42 0 .843.07 1.241.208v-4.324a8.008 8.008 0 00-1.241-.099c-4.532 0-8.142 3.61-8.142 8.142 0 4.532 3.61 8.142 8.142 8.142 4.532 0 8.142-3.61 8.142-8.142V9.321c1.454.901 3.233 1.438 5.112 1.438V6.585c.003-.347.002-.677 0-1" />
          </svg>
          {!collapsed && <h1 className="ml-2 text-xl font-bold whitespace-nowrap">TikTok Ads</h1>}
        </div>
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white focus:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className={`${collapsed ? 'px-2 py-4' : 'p-4'}`}>
        {!collapsed && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>}
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-3' : 'px-4'} py-2 text-sm rounded-md transition-colors ${index === 0 ? 'bg-tiktok-red text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                title={collapsed ? item.name : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  {item.children && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.children} />}
                </svg>
                {!collapsed && item.name}
              </Link>
            </li>
          ))}
        </ul>

        {!collapsed && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-2">Analytics</p>}
        <ul className="space-y-3 mt-4">
          <li>
            <Link to="/audience" className={`flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-3' : 'px-4'} py-2 text-sm text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors`} title={collapsed ? 'Audience' : ''}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!collapsed && 'Audience'}
            </Link>
          </li>
          <li>
            <Link to="/creative-analysis" className={`flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-3' : 'px-4'} py-2 text-sm text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors`} title={collapsed ? 'Creative Analysis' : ''}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!collapsed && 'Creative Analysis'}
            </Link>
          </li>
        </ul>
        {/* External Links */}
        {!collapsed && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">External Links</p>}
        <ul className="space-y-3 mt-2">
          {externalLinks.map((item, index) => (
            <li key={`external-${index}`}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-3' : 'px-4'} py-2 text-sm text-tiktok-red rounded-md hover:bg-gray-800 hover:text-white transition-colors`}
                title={collapsed ? item.name : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!collapsed && (
                  <span className="flex items-center">
                    {item.name}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed ? (
        <div className={`absolute bottom-0 w-64 p-4 border-t border-gray-800`}>
          <div className="bg-gray-800 rounded-md p-4">
            <p className="text-sm text-gray-300 font-medium">Current Plan</p>
            <p className="text-xs text-gray-400 mt-1">Enterprise</p>
            <div className="mt-3 flex justify-between">
              <span className="text-xs text-gray-400">Usage: 78%</span>
              <span className="text-xs text-tiktok-blue">Upgrade</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div className="bg-tiktok-blue h-1.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 w-20 p-2 border-t border-gray-800 flex justify-center">
          <div className="bg-gray-800 rounded-md p-2 text-center w-full mx-2">
            <div className="bg-tiktok-blue rounded-full h-8 w-8 mx-auto flex items-center justify-center">
              <span className="text-xs font-bold">78%</span>
            </div>
            <span className="text-xs text-gray-400 block mt-1">Plan</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
