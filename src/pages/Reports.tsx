import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import KPIOverview from '../components/KPIOverview';
import PerformanceChart from '../components/PerformanceChart';
import MetricsFunnel from '../components/MetricsFunnel';
import CampaignTable from '../components/CampaignTable';
import Footer from '../components/Footer';
import StaffPerformanceTable from '../components/StaffPerformanceTable';
import DailyMetricsTable from '../components/DailyMetricsTable';
import RevenueExpenseOrdersChart from '../components/RevenueExpenseOrdersChart';

const Reports: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
          {/* Nút quay lại trang Dashboard */}
          <div className="flex justify-end mb-4">
            <Link to="/" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Quay lại Dashboard TMDT
            </Link>
          </div>

          {/* KPI Cards */}
          <KPIOverview />
          
          {/* Revenue Expense Orders Chart - Ngay dưới KPI cards */}
          <RevenueExpenseOrdersChart />
          
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
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Reports;
