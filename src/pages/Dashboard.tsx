import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import KPIOverview from '../components/KPIOverview';
import Footer from '../components/Footer';
import PerformanceChart from '../components/PerformanceChart';
import MetricsFunnel from '../components/MetricsFunnel';
import CampaignTable from '../components/CampaignTable';
import StaffPerformanceTable from '../components/StaffPerformanceTable';
import DailyMetricsTable from '../components/DailyMetricsTable';
import RevenueExpenseOrdersChart from '../components/RevenueExpenseOrdersChart';

// Import các component cho dashboard TMDT vận hành
import RealtimeGauge from '../components/RealtimeGauge';
import StoreRanking from '../components/StoreRanking'; 
import HourlyTrendChart from '../components/HourlyTrendChart';
import WeeklyTrendChart from '../components/WeeklyTrendChart';
import TopProductList from '../components/TopProductList';
import DemographicGeoAnalytics from '../components/DemographicGeoAnalytics';
import TopPerformingContent from '../components/TopPerformingContent';
import TikTokAuth from '../components/TikTokAuth';
import ShopeeOrdersTable from '../components/ShopeeOrdersTable';

// Import hooks cho TikTok và Shopee API
import { useTikTokAuth, useHourlyPerformance, useDailyMetrics } from '../hooks/useTikTokApi';

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tiktok' | 'shopee' | 'inventory'>('overview');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  
  // Lấy dữ liệu từ TikTok API
  const [{ isAuthenticated: isTikTokAuthenticated, isLoading, error }] = useTikTokAuth();
  const today = new Date().toISOString().split('T')[0];
  const { data: hourlyData } = useHourlyPerformance(today);
  const { data: dailyData } = useDailyMetrics();
  
  // Khôi phục trạng thái sidebar từ localStorage khi component được mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);
  
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };
  
  // Đã không còn cần thiết vì đã dùng ShopeeAuthButton
  
  // Dữ liệu tổng hợp cho CEO dashboard
  const businessData = {
    revenue: {
      total: 678950000,
      tiktok: 425680000,
      shopee: 253270000,
      growth: 8.6
    },
    orders: {
      total: 2438,
      tiktok: 1560,
      shopee: 878,
      growth: 12.4
    },
    conversion: {
      tiktok: 2.8,
      shopee: 4.2,
      average: 3.2,
      growth: 0.6
    },
    costs: {
      marketing: 98560000,
      logistics: 45230000,
      operations: 25780000,
      total: 169570000
    },
    profitMargin: 26.8
  };
  
  // Dữ liệu cho biểu đồ hình phễu
  const funnelMetrics = {
    title: "Phễu chuyển đổi",
    metrics: [
      { label: "View", value: 86500, color: "#5470ff" },
      { label: "Click", value: 23400, color: "#36a2eb" },
      { label: "Order", value: 4380, color: "#4bc0c0" },
    ]
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onToggle={handleSidebarToggle} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <Header />
        
        {/* Toolbar */}
        <Toolbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* TikTok Auth */}
          {!isTikTokAuthenticated && !isLoading && activeTab === 'tiktok' && (
            <div className="mb-6">
              <TikTokAuth 
                onSuccess={(data) => {
                  console.log('TikTok authentication successful', data);
                  window.location.reload(); // Reload để cập nhật trạng thái sau khi auth
                }}
                onError={(err) => console.error('TikTok authentication error', err)}
              />
            </div>
          )}
          
          {/* Shopee Auth được xử lý tự động bởi ShopeeAuthButton trong ShopeeOrdersTable */}
          {/* Toggle Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button 
                type="button" 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${activeTab === 'overview' ? 'rounded-l-lg' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tổng quan
                </div>
              </button>
              <button 
                type="button" 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'tiktok' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('tiktok')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  TikTok Shop
                </div>
              </button>
              <button 
                type="button" 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'shopee' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('shopee')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Shopee
                </div>
              </button>
              <button 
                type="button" 
                className={`px-6 py-3 text-sm font-medium rounded-r-lg ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('inventory')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Tồn kho
                </div>
              </button>
            </div>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button 
                type="button" 
                className={`px-4 py-2 text-sm font-medium ${dateRange === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} rounded-l-lg`}
                onClick={() => setDateRange('today')}
              >
                Hôm nay
              </button>
              <button 
                type="button" 
                className={`px-4 py-2 text-sm font-medium ${dateRange === 'yesterday' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setDateRange('yesterday')}
              >
                Hôm qua
              </button>
              <button 
                type="button" 
                className={`px-4 py-2 text-sm font-medium ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setDateRange('week')}
              >
                7 ngày
              </button>
              <button 
                type="button" 
                className={`px-4 py-2 text-sm font-medium ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} rounded-r-lg`}
                onClick={() => setDateRange('month')}
              >
                30 ngày
              </button>
            </div>
          </div>
          {activeTab === 'overview' ? (
            /* Dashboard Tổng quan CEO View */
            <>
              {/* KPI Overview Section */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {/* Thông tin tổng quan */}
                <div className="lg:col-span-4">
                  <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-lg px-8 py-6 shadow-lg text-white mb-6">
                    <h2 className="text-2xl font-bold mb-4">Tổng quan vận hành kinh doanh - {dateRange === 'today' ? 'Hôm nay' : dateRange === 'yesterday' ? 'Hôm qua' : dateRange === 'week' ? '7 ngày qua' : '30 ngày qua'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <p className="text-indigo-200 font-medium mb-1">Doanh thu</p>
                        <div className="flex items-center">
                          <div className="text-3xl font-bold">{new Intl.NumberFormat('vi-VN').format(businessData.revenue.total)} ₫</div>
                          <div className="ml-3 px-2 py-1 bg-green-500 bg-opacity-25 text-green-100 rounded text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            {businessData.revenue.growth}%
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-indigo-200 font-medium mb-1">Số đơn hàng</p>
                        <div className="flex items-center">
                          <div className="text-3xl font-bold">{businessData.orders.total}</div>
                          <div className="ml-3 px-2 py-1 bg-green-500 bg-opacity-25 text-green-100 rounded text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            {businessData.orders.growth}%
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-indigo-200 font-medium mb-1">Biên lợi nhuận</p>
                        <div className="flex items-center">
                          <div className="text-3xl font-bold">{businessData.profitMargin}%</div>
                          <div className="ml-3 px-2 py-1 bg-green-500 bg-opacity-25 text-green-100 rounded text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            2.1%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gauge Chart Section */}
                <div className="lg:col-span-1">
                  <RealtimeGauge value={6119588} maxValue={10000000} title="VND" />
                </div>
              </div>

              {/* Platform Performance Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">So sánh hiệu suất nền tảng</h3>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm font-medium">TikTok Shop</span>
                    </div>
                    <span className="text-sm font-medium">{Math.round(businessData.revenue.tiktok / businessData.revenue.total * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm font-medium">Shopee</span>
                    </div>
                    <span className="text-sm font-medium">{Math.round(businessData.revenue.shopee / businessData.revenue.total * 100)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full mt-6 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.round(businessData.revenue.tiktok / businessData.revenue.total * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Doanh thu theo nền tảng</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Tỉ lệ chuyển đổi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{businessData.conversion.tiktok}%</div>
                      <p className="text-sm text-gray-600 mt-1">TikTok Shop</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">{businessData.conversion.shopee}%</div>
                      <p className="text-sm text-gray-600 mt-1">Shopee</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Trung bình:</span>
                      <span className="text-sm font-bold">{businessData.conversion.average}%</span>
                      <div className="ml-3 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        {businessData.conversion.growth}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Store Ranking */}
                <div className="lg:col-span-3">
                  <StoreRanking />
                </div>
              </div>

              {/* Hourly Trend Chart - Realtime TikTok & Shopee Sales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Doanh số theo giờ - TikTok Shop</h3>
                  <HourlyTrendChart />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Doanh số theo giờ - Shopee</h3>
                  <HourlyTrendChart />
                </div>
              </div>
              
              {/* Chi phí và Doanh thu */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Doanh thu & Chi phí vận hành</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <RevenueExpenseOrdersChart />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-3">Chi phí vận hành</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Marketing</span>
                          <span className="text-sm font-medium">{new Intl.NumberFormat('vi-VN').format(businessData.costs.marketing)} ₫</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.round(businessData.costs.marketing / businessData.costs.total * 100)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Logistics</span>
                          <span className="text-sm font-medium">{new Intl.NumberFormat('vi-VN').format(businessData.costs.logistics)} ₫</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.round(businessData.costs.logistics / businessData.costs.total * 100)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Vận hành</span>
                          <span className="text-sm font-medium">{new Intl.NumberFormat('vi-VN').format(businessData.costs.operations)} ₫</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${Math.round(businessData.costs.operations / businessData.costs.total * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Tổng chi phí:</span>
                        <span className="text-base font-bold">{new Intl.NumberFormat('vi-VN').format(businessData.costs.total)} ₫</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="mb-6">
                <TopProductList />
              </div>

              {/* Top 5 Performing Content */}
              <TopPerformingContent />

              {/* User Demographics and Geographic Analysis */}
              <DemographicGeoAnalytics />
            </>
          ) : activeTab === 'tiktok' ? (
            /* TikTok Shop Dashboard */
            <>
              {/* KPI Cards */}
              <KPIOverview />
              
              {/* Performance Charts - New Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Left column: Metrics Funnel */}
                <div>
                  <MetricsFunnel 
                    title={funnelMetrics.title}
                    metrics={funnelMetrics.metrics}
                  />
                </div>
                
                {/* Right column: Performance Chart */}
                <div className="md:col-span-2">
                  <PerformanceChart />
                </div>
              </div>
              
              {/* Daily Metrics Table */}
              <DailyMetricsTable />
              
              {/* Staff Performance Table */}
              <StaffPerformanceTable />

              {/* Campaign Table */}
              <CampaignTable />

              {/* Top 5 Performing Content */}
              <TopPerformingContent />

              {/* User Demographics and Geographic Analysis */}
              <DemographicGeoAnalytics />
            </>
          ) : activeTab === 'shopee' ? (
            /* Shopee Dashboard */
            <>
              {/* KPI Overview */}
              <KPIOverview />
              
              {/* Shopee Performance Charts */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Hiệu suất Shopee</h3>
                <PerformanceChart />
              </div>
              
              {/* Daily Metrics Table - Shopee */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Thống kê hàng ngày - Shopee</h3>
                <DailyMetricsTable />
              </div>
              
              {/* Shopee Orders Table */}
              <ShopeeOrdersTable />
            </>
          ) : (
            /* Inventory Dashboard */
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Tổng quan tồn kho</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold">1,246</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Còn hàng</p>
                    <p className="text-2xl font-bold">892</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sắp hết hàng</p>
                    <p className="text-2xl font-bold">58</p>
                  </div>
                </div>
              </div>
              
              {/* Top Selling Products */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
                <TopProductList />
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
