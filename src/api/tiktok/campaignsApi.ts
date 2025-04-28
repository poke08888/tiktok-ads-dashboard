import createTikTokApiClient from './apiClient';
import { STORAGE_KEYS } from '../config';

/**
 * Cấu trúc của một chiến dịch TikTok
 */
export interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  advertiser_id: string;
  campaign_type: string;
  budget: number;
  budget_mode: string;
  status: string;
  objective: string;
  objective_type: string;
  create_time: string;
  modify_time: string;
  is_new_structure: boolean;
}

/**
 * Kết quả trả về khi lấy danh sách chiến dịch
 */
export interface CampaignListResponse {
  code: number;
  message: string;
  data: {
    page_info: {
      total_number: number;
      page: number;
      page_size: number;
      total_page: number;
    };
    list: TikTokCampaign[];
  };
  request_id: string;
}

/**
 * Service để lấy thông tin về các chiến dịch quảng cáo
 */
export class TikTokCampaignService {
  /**
   * Lấy danh sách tất cả chiến dịch
   * @param page Số trang
   * @param pageSize Số lượng trên mỗi trang
   * @returns Danh sách chiến dịch
   */
  static async getCampaigns(page: number = 1, pageSize: number = 20): Promise<TikTokCampaign[]> {
    try {
      const apiClient = await createTikTokApiClient();
      const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
      
      if (!advertiserId) {
        throw new Error('No advertiser ID found. Please authenticate first.');
      }
      
      const response = await apiClient.get<CampaignListResponse>('/campaign/get/', {
        params: {
          advertiser_id: advertiserId,
          page,
          page_size: pageSize,
          filtering: {
            status: ['CAMPAIGN_STATUS_ALL'] // Lấy tất cả chiến dịch bất kể trạng thái
          }
        }
      });
      
      return response.data.data.list;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }
  
  /**
   * Lấy thông tin chi tiết của một chiến dịch
   * @param campaignId ID của chiến dịch
   * @returns Thông tin chi tiết chiến dịch
   */
  static async getCampaignDetails(campaignId: string): Promise<TikTokCampaign> {
    try {
      const apiClient = await createTikTokApiClient();
      const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
      
      if (!advertiserId) {
        throw new Error('No advertiser ID found. Please authenticate first.');
      }
      
      const response = await apiClient.get<CampaignListResponse>('/campaign/get/', {
        params: {
          advertiser_id: advertiserId,
          filtering: {
            campaign_ids: [campaignId]
          }
        }
      });
      
      if (response.data.data.list.length === 0) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
      
      return response.data.data.list[0];
    } catch (error) {
      console.error(`Error fetching campaign details for ID ${campaignId}:`, error);
      throw error;
    }
  }
}
