import React, { useState, useEffect } from 'react';
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

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Khôi phục trạng thái sidebar từ localStorage khi component được mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);
  
  const handleSidebarToggle = (collapsed) => {
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
          {/* KPI Cards */}
          <KPIOverview />
          
          {/* Revenue Expense Orders Chart - Ngay dưới KPI cards */}
          <RevenueExpenseOrdersChart />
          
          {/* Performance Charts - New Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <MetricsFunnel 
                title={funnelMetrics.title}
                metrics={funnelMetrics.metrics}
              />
            </div>
            
            <div className="md:col-span-2">
              {/* Biểu đồ đường với các chỉ số */}
              <div className="card p-4">
                <h3 className="text-base font-medium mb-4">Tổng quan</h3>
                <PerformanceChart />
              </div>
            </div>
          </div>
          
          {/* Revenue Expense Orders Chart */}
          <RevenueExpenseOrdersChart />
          
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

export default Dashboard;
