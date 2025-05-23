import React, { useState } from 'react';
import { format, startOfWeek, addDays, getWeek, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useDailyMetrics } from '../hooks/useTikTokApi';

interface MetricRow {
  date: string;
  day: string;
  revenue: number;
  conversions: number;
  cost: number;
  adsCost: number; 
  cpa: number;
  cvr: number;
  roas: number;
  arpu: number;
  impressions: number;
  reach: number;
  ctr: number;
  cpc: number;
  cpm: number;
  clicks: number;
}

const DailyMetricsTable: React.FC = () => {
  const currentDate = new Date();
  const currentYear = getYear(currentDate);
  const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [compareYear, setCompareYear] = useState(currentYear);
  const [compareWeek, setCompareWeek] = useState(currentWeek > 1 ? currentWeek - 1 : 52);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedContent, setSelectedContent] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  
  // Format dates for API call
  const getStartEndDate = (year: number, week: number) => {
    const firstDay = startOfWeek(new Date(year, 0, 1 + (week - 1) * 7), { weekStartsOn: 1 });
    const lastDay = addDays(firstDay, 6);
    
    return {
      startDate: format(firstDay, 'yyyy-MM-dd'),
      endDate: format(lastDay, 'yyyy-MM-dd')
    };
  };
  
  const { startDate, endDate } = getStartEndDate(selectedYear, selectedWeek);
  const { data, isLoading, error } = useDailyMetrics(startDate, endDate);
  
  // Nếu showComparison, lấy dữ liệu so sánh
  const compareDate = getStartEndDate(compareYear, compareWeek);
  const { 
    data: compareData, 
    isLoading: isCompareLoading
  } = useDailyMetrics(
    showComparison ? compareDate.startDate : '', 
    showComparison ? compareDate.endDate : ''
  );
  
  // Dữ liệu mẫu trống khi không có dữ liệu API
  const getEmptyData = (): MetricRow[] => {
    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    const startOfWeekDate = startOfWeek(new Date(selectedYear, 0, 1 + (selectedWeek - 1) * 7), { weekStartsOn: 1 });
    
    return days.map((day, index) => {
      const date = addDays(startOfWeekDate, index);
      return {
        date: format(date, 'yyyy-MM-dd'),
        day,
        revenue: 0,
        conversions: 0,
        cost: 0,
        adsCost: 0,
        cpa: 0,
        cvr: 0,
        roas: 0,
        arpu: 0,
        impressions: 0,
        reach: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        clicks: 0
      };
    });
  };
  
  // Transform API data to table data
  const transformApiData = (apiData: any[]): MetricRow[] => {
    if (!apiData || apiData.length === 0) return getEmptyData();
    
    return apiData.map(item => {
      const date = item.dimensions?.stat_time_day || '';
      const dayObj = date ? new Date(date) : new Date();
      
      return {
        date: date,
        day: format(dayObj, 'EEEE', { locale: vi }),
        revenue: item.metrics?.total_revenue || 0,
        conversions: item.metrics?.conversions || 0,
        cost: item.metrics?.spend || 0,
        adsCost: (item.metrics?.spend || 0) / (item.metrics?.total_revenue || 1) * 100, // % ads cost
        cpa: item.metrics?.cost_per_conversion || 0,
        cvr: item.metrics?.conversion_rate || 0,
        roas: (item.metrics?.total_revenue || 0) / (item.metrics?.spend || 1),
        arpu: (item.metrics?.total_revenue || 0) / (item.metrics?.conversions || 1),
        impressions: item.metrics?.impressions || 0,
        reach: item.metrics?.reach || 0,
        ctr: item.metrics?.click_through_rate || 0,
        cpc: item.metrics?.cost_per_click || 0,
        cpm: item.metrics?.cost_per_1000_reached || 0,
        clicks: item.metrics?.clicks || 0
      };
    });
  };
  
  // Chuyển đổi dữ liệu API thành dữ liệu hiển thị
  const tableData = transformApiData(data);
  const compareTableData = transformApiData(compareData);
  
  // Tính tổng cho tuần
  const calculateWeeklyTotal = (data: MetricRow[]): MetricRow => {
    if (!data || data.length === 0) {
      return {
        date: '',
        day: 'Tổng tuần',
        revenue: 0,
        conversions: 0,
        cost: 0,
        adsCost: 0,
        cpa: 0,
        cvr: 0,
        roas: 0,
        arpu: 0,
        impressions: 0,
        reach: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        clicks: 0
      };
    }
    
    // Tổng các số liệu
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
    const totalReach = data.reduce((sum, item) => sum + item.reach, 0);
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
    
    // Tính các giá trị trung bình
    const weightedCtr = totalClicks / (totalImpressions || 1) * 100;
    const weightedCvr = totalConversions / (totalClicks || 1) * 100;
    const weightedCpc = totalCost / (totalClicks || 1);
    const weightedCpm = totalCost / (totalImpressions || 1) * 1000;
    const weightedCpa = totalCost / (totalConversions || 1);
    const weightedRoas = totalRevenue / (totalCost || 1);
    const weightedArpu = totalRevenue / (totalConversions || 1);
    const avgAdsCost = totalCost / (totalRevenue || 1) * 100;
    
    return {
      date: '',
      day: 'Tổng tuần',
      revenue: totalRevenue,
      conversions: totalConversions,
      cost: totalCost,
      adsCost: avgAdsCost,
      cpa: weightedCpa,
      cvr: weightedCvr,
      roas: weightedRoas,
      arpu: weightedArpu,
      impressions: totalImpressions,
      reach: totalReach,
      ctr: weightedCtr,
      cpc: weightedCpc,
      cpm: weightedCpm,
      clicks: totalClicks
    };
  };
  
  const weeklyTotal = calculateWeeklyTotal(tableData);
  const compareWeeklyTotal = calculateWeeklyTotal(compareTableData);
  
  // Hàm tính phần trăm thay đổi
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Xác định kiểu chỉ số (positive là tốt khi tăng, negative là tốt khi giảm)
  const isPositiveMetric = (metricName: string): boolean => {
    const negativeMetrics = ['cost', 'adsCost', 'cpa', 'cpc', 'cpm'];
    return !negativeMetrics.includes(metricName);
  };
  
  // Tạo options cho dropdowns
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const weekOptions = Array.from({ length: 52 }, (_, i) => i + 1);
  
  // Format số với đơn vị tiền
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  // Format số phần trăm
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Hiển thị mũi tên tăng/giảm với màu sắc dựa trên loại metric
  const renderChangeArrow = (change: number, metricName: string) => {
    const isPositive = isPositiveMetric(metricName);
    
    if (change === 0) {
      return null;
    }
    
    const isGood = (isPositive && change > 0) || (!isPositive && change < 0);
    const color = isGood ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`ml-1 ${color}`}>
        {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };
  
  return (
    <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Thống kê theo ngày</h2>
      </div>
      
      {/* Filters - Improved grid layout */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* First row - Year and Week selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
            <select 
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tuần</label>
            <select 
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              {weekOptions.map(week => (
                <option key={week} value={week}>Tuần {week}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <select 
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              value={selectedContent}
              onChange={(e) => setSelectedContent(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="video">Video</option>
              <option value="image">Hình ảnh</option>
            </select>
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kênh TikTok</label>
            <select 
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="feed">Feed</option>
              <option value="explore">Explore</option>
              <option value="live">Live</option>
            </select>
          </div>
        </div>
        
        {/* Second row - Comparison controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <button
              className={`px-4 py-2 text-sm font-medium rounded ${showComparison ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Ẩn so sánh' : 'So sánh với tuần khác'}
            </button>
          </div>
          
          {showComparison && (
            <>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 mr-2">So với:</label>
                <select 
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 mr-2 text-sm"
                  value={compareYear}
                  onChange={(e) => setCompareYear(parseInt(e.target.value))}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select 
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  value={compareWeek}
                  onChange={(e) => setCompareWeek(parseInt(e.target.value))}
                >
                  {weekOptions.map(week => (
                    <option key={week} value={week}>Tuần {week}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt chuyển đổi</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Ads</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CPA</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CVR</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ARPU</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt hiển thị</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt tiếp cận</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CPM</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="font-medium">{row.day}</div>
                  <div className="text-gray-500">{format(new Date(row.date), 'dd/MM/yyyy')}</div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(row.revenue)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{row.conversions}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(row.cost)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPercent(row.adsCost)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(row.cpa)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPercent(row.cvr)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{row.roas.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(row.arpu)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{row.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{row.reach.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPercent(row.ctr)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(row.cpc)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(row.cpm)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">{row.clicks.toLocaleString()}</td>
              </tr>
            ))}
            
            {/* Weekly Total Row */}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900">{weeklyTotal.day}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatCurrency(weeklyTotal.revenue)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.revenue, compareWeeklyTotal.revenue),
                  'revenue'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {weeklyTotal.conversions}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.conversions, compareWeeklyTotal.conversions),
                  'conversions'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatCurrency(weeklyTotal.cost)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.cost, compareWeeklyTotal.cost),
                  'cost'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatPercent(weeklyTotal.adsCost)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.adsCost, compareWeeklyTotal.adsCost),
                  'adsCost'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatCurrency(weeklyTotal.cpa)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.cpa, compareWeeklyTotal.cpa),
                  'cpa'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatPercent(weeklyTotal.cvr)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.cvr, compareWeeklyTotal.cvr),
                  'cvr'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {weeklyTotal.roas.toFixed(2)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.roas, compareWeeklyTotal.roas),
                  'roas'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatCurrency(weeklyTotal.arpu)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.arpu, compareWeeklyTotal.arpu),
                  'arpu'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {weeklyTotal.impressions.toLocaleString()}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.impressions, compareWeeklyTotal.impressions),
                  'impressions'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {weeklyTotal.reach.toLocaleString()}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.reach, compareWeeklyTotal.reach),
                  'reach'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatPercent(weeklyTotal.ctr)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.ctr, compareWeeklyTotal.ctr),
                  'ctr'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatCurrency(weeklyTotal.cpc)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.cpc, compareWeeklyTotal.cpc),
                  'cpc'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatCurrency(weeklyTotal.cpm)}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.cpm, compareWeeklyTotal.cpm),
                  'cpm'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {weeklyTotal.clicks.toLocaleString()}
                {showComparison && renderChangeArrow(
                  calculateChange(weeklyTotal.clicks, compareWeeklyTotal.clicks),
                  'clicks'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-8 bg-white bg-opacity-75 absolute inset-0">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-t">
          <p className="font-medium">Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}
    </div>
  );
};

export default DailyMetricsTable;
