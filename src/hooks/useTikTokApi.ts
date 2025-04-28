import { useState, useEffect } from 'react';
import { 
  TikTokReportingService, 
  TikTokCampaignService, 
  TikTokCreativeService,
  isTokenValid,
  getValidAccessToken
} from '../api/tiktok';
import { STORAGE_KEYS } from '../api/config';
import { 
  IntegratedReportData, 
  ReportTypeEnum, 
  DataLevelEnum,
  ReportRequestOptions,
  TikTokCampaign,
  TikTokCreative
} from '../api/tiktok';

interface TikTokApiState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useTikTokAuth = (): [TikTokApiState, () => boolean] => {
  const [state, setState] = useState<TikTokApiState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
        
        if (!token || !advertiserId) {
          setState({ isAuthenticated: false, isLoading: false, error: null });
          return;
        }
        
        // Kiểm tra token còn hạn không
        const valid = isTokenValid();
        if (!valid) {
          try {
            // Thử refresh token
            await getValidAccessToken();
            setState({ isAuthenticated: true, isLoading: false, error: null });
          } catch (err) {
            setState({ 
              isAuthenticated: false, 
              isLoading: false, 
              error: new Error('Token expired and refresh failed')
            });
          }
        } else {
          setState({ isAuthenticated: true, isLoading: false, error: null });
        }
      } catch (err) {
        setState({ 
          isAuthenticated: false, 
          isLoading: false, 
          error: err instanceof Error ? err : new Error('Unknown authentication error')
        });
      }
    };
    
    checkAuth();
  }, []);

  // Kiểm tra xem có thể thực hiện API calls không
  const canMakeApiCalls = (): boolean => {
    return state.isAuthenticated && !state.isLoading && !state.error;
  };

  return [state, canMakeApiCalls];
};

// Dữ liệu mẫu để hiển thị khi không có xác thực
const generateMockDailyData = (startDate: string, endDate: string): IntegratedReportData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  
  // Tạo ngày trong khoảng
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const dayOfWeek = dt.getDay(); // 0 = Chủ nhật, 6 = Thứ bảy
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? 0.7 : 1.0;
    
    const dateString = dt.toISOString().split('T')[0];
    days.push({
      dimensions: {
        stat_time_day: dateString
      },
      metrics: {
        spend: Math.round(1000000 + Math.random() * 500000) * multiplier,
        impressions: Math.round(50000 + Math.random() * 20000) * multiplier,
        clicks: Math.round(1000 + Math.random() * 500) * multiplier,
        conversions: Math.round(50 + Math.random() * 30) * multiplier,
        total_revenue: Math.round(3000000 + Math.random() * 1000000) * multiplier,
        cost_per_conversion: Math.round(10000 + Math.random() * 5000),
        conversion_rate: (Math.random() * 2 + 1), // 1-3%
        click_through_rate: (Math.random() * 2 + 1), // 1-3%
        cost_per_click: Math.round(500 + Math.random() * 200),
        cost_per_1000_reached: Math.round(50000 + Math.random() * 10000),
        reach: Math.round(30000 + Math.random() * 15000) * multiplier
      }
    });
  }
  
  return days;
};

// Hooks cho Daily Metrics
export const useDailyMetrics = (startDate: string, endDate: string) => {
  const [{ isAuthenticated, isLoading: isAuthLoading }, canMakeApiCalls] = useTikTokAuth();
  const [data, setData] = useState<IntegratedReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Nếu không có kết nối TikTok, dùng dữ liệu mẫu
      if (!canMakeApiCalls() || isAuthLoading) {
        // Từ dữ liệu mẫu để demo
        setTimeout(() => {
          setData(generateMockDailyData(startDate, endDate));
          setIsLoading(false);
        }, 1000); // Giả lập trễ 1 giây để hiệu ứng loading
        return;
      }

      try {
        const reportData = await TikTokReportingService.getDailyPerformanceReport(startDate, endDate);
        setData(reportData);
      } catch (err) {
        console.error('Error fetching TikTok data:', err);
        // Nếu API gặp lỗi, vẫn dùng dữ liệu mẫu để hiển thị
        setData(generateMockDailyData(startDate, endDate));
        setError(err instanceof Error ? err : new Error('Unknown error fetching daily metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isAuthenticated, isAuthLoading]);

  return { data, isLoading, error };
};

// Dữ liệu mẫu giờ cho biểu đồ giờ
const generateMockHourlyData = (date: string): IntegratedReportData[] => {
  const hours = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Các mốc giờ trong ngày có giá trị khác nhau
    let timeMultiplier = 1.0;
    if (hour >= 7 && hour <= 10) timeMultiplier = 1.3; // Cao buổi sáng
    else if (hour >= 12 && hour <= 14) timeMultiplier = 1.1; // Cao buổi trưa
    else if (hour >= 19 && hour <= 22) timeMultiplier = 1.6; // Cao buổi tối
    else if (hour >= 0 && hour <= 5) timeMultiplier = 0.5; // Thấp đêm khuya
    
    hours.push({
      dimensions: {
        stat_time_hour: `${date} ${hour.toString().padStart(2, '0')}:00:00`
      },
      metrics: {
        spend: Math.round(50000 + Math.random() * 30000) * timeMultiplier,
        impressions: Math.round(3000 + Math.random() * 1500) * timeMultiplier,
        clicks: Math.round(80 + Math.random() * 40) * timeMultiplier,
        conversions: Math.round(4 + Math.random() * 4) * timeMultiplier,
        total_revenue: Math.round(150000 + Math.random() * 100000) * timeMultiplier,
        cost_per_conversion: Math.round(10000 + Math.random() * 5000),
        conversion_rate: (Math.random() * 2 + 1), // 1-3%
        click_through_rate: (Math.random() * 2 + 1), // 1-3%
        cost_per_click: Math.round(500 + Math.random() * 200),
        cost_per_1000_reached: Math.round(50000 + Math.random() * 10000),
        reach: Math.round(2000 + Math.random() * 1000) * timeMultiplier
      }
    });
  }
  
  return hours;
};

// Hooks cho Hourly Performance
export const useHourlyPerformance = (date: string) => {
  const [{ isAuthenticated, isLoading: isAuthLoading }, canMakeApiCalls] = useTikTokAuth();
  const [data, setData] = useState<IntegratedReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // Nếu không có xác thực, dùng dữ liệu mẫu
      if (!canMakeApiCalls() || isAuthLoading) {
        setTimeout(() => {
          setData(generateMockHourlyData(date));
          setIsLoading(false);
        }, 800);
        return;
      }

      try {
        const reportData = await TikTokReportingService.getHourlyTrendReport(date);
        setData(reportData);
      } catch (err) {
        console.error('Error fetching hourly data:', err);
        // Nếu lỗi vẫn hiển thị dữ liệu mẫu
        setData(generateMockHourlyData(date));
        setError(err instanceof Error ? err : new Error('Unknown error fetching hourly performance'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date, isAuthenticated, isAuthLoading]);

  return { data, isLoading, error };
};

// Hooks cho Demographic Data
export const useDemographicData = (startDate: string, endDate: string) => {
  const [{ isAuthenticated, isLoading: isAuthLoading }, canMakeApiCalls] = useTikTokAuth();
  const [data, setData] = useState<IntegratedReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!canMakeApiCalls() || isAuthLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const reportData = await TikTokReportingService.getDemographicReport(startDate, endDate);
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error fetching demographic data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isAuthenticated, isAuthLoading]);

  return { data, isLoading, error };
};

// Hooks cho Geographic Data
export const useGeographicData = (startDate: string, endDate: string) => {
  const [{ isAuthenticated, isLoading: isAuthLoading }, canMakeApiCalls] = useTikTokAuth();
  const [data, setData] = useState<IntegratedReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!canMakeApiCalls() || isAuthLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const reportData = await TikTokReportingService.getGeographicReport(startDate, endDate);
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error fetching geographic data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isAuthenticated, isAuthLoading]);

  return { data, isLoading, error };
};

// Hooks cho Top Performing Content
export const useTopPerformingContent = (startDate: string, endDate: string, limit: number = 5) => {
  const [{ isAuthenticated, isLoading: isAuthLoading }, canMakeApiCalls] = useTikTokAuth();
  const [data, setData] = useState<IntegratedReportData[]>([]);
  const [creatives, setCreatives] = useState<Record<string, TikTokCreative>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!canMakeApiCalls() || isAuthLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Lấy top performing content
        const reportData = await TikTokReportingService.getTopPerformingContent(startDate, endDate, limit);
        setData(reportData);
        
        // 2. Lấy thông tin creative/thumbnail cho mỗi ad
        if (reportData.length > 0) {
          const adIds = reportData.map(item => item.dimensions.ad_id as string).filter(Boolean);
          
          if (adIds.length > 0) {
            const creativesData = await TikTokCreativeService.getCreativesForAds(adIds);
            
            // Convert to record for easier lookup
            const creativesMap: Record<string, TikTokCreative> = {};
            creativesData.forEach(creative => {
              creativesMap[creative.ad_id] = creative;
            });
            
            setCreatives(creativesMap);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error fetching top performing content'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, limit, isAuthenticated, isAuthLoading]);

  return { data, creatives, isLoading, error };
};

// Hooks cho Campaigns
export const useCampaigns = () => {
  const [{ isAuthenticated, isLoading: isAuthLoading }, canMakeApiCalls] = useTikTokAuth();
  const [data, setData] = useState<TikTokCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!canMakeApiCalls() || isAuthLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const campaigns = await TikTokCampaignService.getCampaigns(1, 100); // Lấy 100 chiến dịch đầu tiên
        setData(campaigns);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error fetching campaigns'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAuthLoading]);

  return { data, isLoading, error };
};
