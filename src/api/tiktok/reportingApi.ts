import createTikTokApiClient from './apiClient';
import { STORAGE_KEYS } from '../config';

/**
 * Interface cho report data được trả về từ TikTok API
 */
export interface IntegratedReportData {
  dimensions: {
    stat_time_day?: string;
    age?: string;
    gender?: string;
    country_code?: string;
    province_id?: string;
    city_id?: string;
    ad_id?: string;
    campaign_id?: string;
    advertiser_id?: string;
    [key: string]: string | undefined;
  };
  metrics: {
    spend?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    cost_per_conversion?: number;
    conversion_rate?: number;
    cost_per_1000_reached?: number;
    click_through_rate?: number;
    reach?: number;
    cost_per_click?: number;
    video_play?: number;
    video_views_p25?: number;
    video_views_p50?: number;
    video_views_p75?: number;
    complete_video_views?: number;
    video_watched2s?: number;
    video_watched6s?: number;
    average_video_play?: number;
    total_revenue?: number;
    total_complete_payment_roi?: number;
    [key: string]: number | undefined;
  };
}

/**
 * Interface cho response từ Report API
 */
export interface ReportApiResponse {
  code: number;
  message: string;
  data: {
    page_info: {
      total_number: number;
      page: number;
      page_size: number;
      total_page: number;
    };
    list: IntegratedReportData[];
  };
  request_id: string;
}

// Enum các loại báo cáo có thể yêu cầu
export enum ReportTypeEnum {
  BASIC = 'BASIC',
  AUDIENCE = 'AUDIENCE',
  PLAYABLE_MATERIAL = 'PLAYABLE_MATERIAL',
  CATALOG = 'CATALOG',
}

// Enum các data level có thể yêu cầu
export enum DataLevelEnum {
  AUCTION_ADVERTISER = 'AUCTION_ADVERTISER',
  AUCTION_CAMPAIGN = 'AUCTION_CAMPAIGN',
  AUCTION_ADGROUP = 'AUCTION_ADGROUP',
  AUCTION_AD = 'AUCTION_AD',
  RESERVATION_ADVERTISER = 'RESERVATION_ADVERTISER',
  RESERVATION_CAMPAIGN = 'RESERVATION_CAMPAIGN',
  RESERVATION_ADGROUP = 'RESERVATION_ADGROUP',
  RESERVATION_AD = 'RESERVATION_AD',
}

// Interface cho các tùy chọn yêu cầu báo cáo
export interface ReportRequestOptions {
  report_type: ReportTypeEnum;
  data_level: DataLevelEnum; 
  dimensions?: string[];
  metrics?: string[];
  start_date: string; // Định dạng 'YYYY-MM-DD'
  end_date: string;   // Định dạng 'YYYY-MM-DD'
  page?: number;
  page_size?: number;
  filters?: Record<string, any>;
  order_field?: string;
  order_type?: 'ASC' | 'DESC';
}

/**
 * Service để lấy báo cáo từ TikTok Integrated Reporting API
 */
export class TikTokReportingService {
  /**
   * Lấy báo cáo tích hợp từ TikTok API
   * @param options Các tùy chọn báo cáo
   * @returns Dữ liệu báo cáo
   */
  static async getIntegratedReport(options: ReportRequestOptions): Promise<IntegratedReportData[]> {
    try {
      const apiClient = await createTikTokApiClient();
      const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
      
      if (!advertiserId) {
        throw new Error('No advertiser ID found. Please authenticate first.');
      }
      
      const response = await apiClient.get<ReportApiResponse>('/report/integrated/get/', {
        params: {
          advertiser_id: advertiserId,
          ...options
        }
      });
      
      return response.data.data.list;
    } catch (error) {
      console.error('Error fetching integrated report:', error);
      throw error;
    }
  }
  
  /**
   * Lấy báo cáo views/clicks/conversions theo ngày
   * @param startDate Ngày bắt đầu (YYYY-MM-DD)
   * @param endDate Ngày kết thúc (YYYY-MM-DD)
   * @returns Báo cáo theo ngày
   */
  static async getDailyPerformanceReport(startDate: string, endDate: string): Promise<IntegratedReportData[]> {
    return this.getIntegratedReport({
      report_type: ReportTypeEnum.BASIC,
      data_level: DataLevelEnum.AUCTION_ADVERTISER,
      dimensions: ['stat_time_day'],
      metrics: [
        'spend', 
        'impressions', 
        'clicks', 
        'conversions', 
        'cost_per_conversion',
        'conversion_rate',
        'total_revenue',
        'click_through_rate',
        'cost_per_click',
        'cost_per_1000_reached',
        'reach'
      ],
      start_date: startDate,
      end_date: endDate,
      order_field: 'stat_time_day',
      order_type: 'ASC'
    });
  }
  
  /**
   * Lấy báo cáo phân tích nhân khẩu học (tuổi/giới tính)
   * @param startDate Ngày bắt đầu (YYYY-MM-DD)
   * @param endDate Ngày kết thúc (YYYY-MM-DD)
   * @returns Báo cáo nhân khẩu học
   */
  static async getDemographicReport(startDate: string, endDate: string): Promise<IntegratedReportData[]> {
    return this.getIntegratedReport({
      report_type: ReportTypeEnum.AUDIENCE,
      data_level: DataLevelEnum.AUCTION_ADVERTISER,
      dimensions: ['age', 'gender'],
      metrics: [
        'spend', 
        'impressions', 
        'clicks', 
        'conversions', 
        'click_through_rate',
        'conversion_rate'
      ],
      start_date: startDate,
      end_date: endDate
    });
  }
  
  /**
   * Lấy báo cáo phân tích địa lý (quốc gia/tỉnh/thành phố)
   * @param startDate Ngày bắt đầu (YYYY-MM-DD)
   * @param endDate Ngày kết thúc (YYYY-MM-DD)
   * @returns Báo cáo địa lý
   */
  static async getGeographicReport(startDate: string, endDate: string): Promise<IntegratedReportData[]> {
    return this.getIntegratedReport({
      report_type: ReportTypeEnum.BASIC,
      data_level: DataLevelEnum.AUCTION_ADVERTISER,
      dimensions: ['country_code', 'province_id', 'city_id'],
      metrics: [
        'spend', 
        'impressions', 
        'clicks', 
        'conversions', 
        'click_through_rate',
        'conversion_rate'
      ],
      start_date: startDate,
      end_date: endDate
    });
  }
  
  /**
   * Lấy performance của từng nội dung quảng cáo 
   * @param startDate Ngày bắt đầu (YYYY-MM-DD)
   * @param endDate Ngày kết thúc (YYYY-MM-DD)
   * @param limit Số lượng kết quả (mặc định 10)
   * @returns Performance của từng ad
   */
  static async getTopPerformingContent(
    startDate: string, 
    endDate: string, 
    limit: number = 10
  ): Promise<IntegratedReportData[]> {
    const response = await this.getIntegratedReport({
      report_type: ReportTypeEnum.BASIC,
      data_level: DataLevelEnum.AUCTION_AD,
      dimensions: ['ad_id'],
      metrics: [
        'spend', 
        'total_revenue', 
        'impressions', 
        'clicks', 
        'conversions', 
        'cost_per_conversion',
        'click_through_rate',
        'conversion_rate',
        'cost_per_1000_reached'
      ],
      start_date: startDate,
      end_date: endDate,
      order_field: 'total_revenue',
      order_type: 'DESC',
      page: 1,
      page_size: limit
    });
    
    return response;
  }
  
  /**
   * Lấy dữ liệu theo giờ trong ngày 
   * @param date Ngày (YYYY-MM-DD)
   * @returns Dữ liệu theo giờ
   */
  static async getHourlyTrendReport(date: string): Promise<IntegratedReportData[]> {
    return this.getIntegratedReport({
      report_type: ReportTypeEnum.BASIC,
      data_level: DataLevelEnum.AUCTION_ADVERTISER,
      dimensions: ['stat_time_hour'],
      metrics: [
        'impressions', 
        'clicks', 
        'conversions', 
        'click_through_rate',
        'conversion_rate'
      ],
      start_date: date,
      end_date: date,
      order_field: 'stat_time_hour',
      order_type: 'ASC'
    });
  }
}
