import createTikTokApiClient from './apiClient';
import { STORAGE_KEYS } from '../config';

/**
 * Cấu trúc của một creative/ad TikTok
 */
export interface TikTokCreative {
  ad_id: string;
  ad_name: string;
  advertiser_id: string;
  campaign_id: string;
  adgroup_id: string;
  status: string;
  opt_status: string;
  app_name: string;
  landing_page_url: string;
  image_ids: string[];
  video_id: string;
  thumbnail_url: string;
  create_time: string;
  modify_time: string;
  call_to_action: string;
  identity_id: string;
  identity_type: string;
  is_creative_authorized: boolean;
}

/**
 * Kết quả trả về khi lấy danh sách creative/ad
 */
export interface CreativeListResponse {
  code: number;
  message: string;
  data: {
    page_info: {
      total_number: number;
      page: number;
      page_size: number;
      total_page: number;
    };
    list: TikTokCreative[];
  };
  request_id: string;
}

/**
 * Service để lấy thông tin về creative/ad (nội dung quảng cáo)
 */
export class TikTokCreativeService {
  /**
   * Lấy danh sách tất cả creative/ad
   * @param page Số trang
   * @param pageSize Số lượng trên mỗi trang
   * @returns Danh sách creative/ad
   */
  static async getCreatives(page: number = 1, pageSize: number = 20): Promise<TikTokCreative[]> {
    try {
      const apiClient = await createTikTokApiClient();
      const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
      
      if (!advertiserId) {
        throw new Error('No advertiser ID found. Please authenticate first.');
      }
      
      const response = await apiClient.get<CreativeListResponse>('/creative/ads/get/', {
        params: {
          advertiser_id: advertiserId,
          page,
          page_size: pageSize,
          filtering: {
            status: 'ALL' // Lấy tất cả creative bất kể trạng thái
          },
          fields: [
            'ad_id', 
            'ad_name', 
            'thumbnail_url', 
            'campaign_id', 
            'adgroup_id', 
            'status',
            'call_to_action',
            'landing_page_url',
            'video_id',
            'image_ids'
          ]
        }
      });
      
      return response.data.data.list;
    } catch (error) {
      console.error('Error fetching creatives:', error);
      throw error;
    }
  }
  
  /**
   * Lấy thông tin chi tiết của một creative/ad
   * @param adId ID của creative/ad
   * @returns Thông tin chi tiết creative/ad
   */
  static async getCreativeDetails(adId: string): Promise<TikTokCreative> {
    try {
      const apiClient = await createTikTokApiClient();
      const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
      
      if (!advertiserId) {
        throw new Error('No advertiser ID found. Please authenticate first.');
      }
      
      const response = await apiClient.get<CreativeListResponse>('/creative/ads/get/', {
        params: {
          advertiser_id: advertiserId,
          filtering: {
            ad_ids: [adId]
          },
          fields: [
            'ad_id', 
            'ad_name', 
            'thumbnail_url', 
            'campaign_id', 
            'adgroup_id', 
            'status',
            'call_to_action',
            'landing_page_url',
            'video_id',
            'image_ids',
            'create_time',
            'modify_time'
          ]
        }
      });
      
      if (response.data.data.list.length === 0) {
        throw new Error(`Creative with ID ${adId} not found`);
      }
      
      return response.data.data.list[0];
    } catch (error) {
      console.error(`Error fetching creative details for ID ${adId}:`, error);
      throw error;
    }
  }
  
  /**
   * Lấy chi tiết nội dung cho mảng ad IDs (thường để hiển thị thumbnails)
   * @param adIds Mảng các ID của ads
   * @returns Danh sách thông tin chi tiết
   */
  static async getCreativesForAds(adIds: string[]): Promise<TikTokCreative[]> {
    try {
      const apiClient = await createTikTokApiClient();
      const advertiserId = localStorage.getItem(STORAGE_KEYS.ADVERTISER_ID);
      
      if (!advertiserId) {
        throw new Error('No advertiser ID found. Please authenticate first.');
      }
      
      // Chia nhỏ mảng adIds thành các batch nếu số lượng lớn
      // TikTok thường giới hạn 100 IDs mỗi lần gọi API
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < adIds.length; i += batchSize) {
        batches.push(adIds.slice(i, i + batchSize));
      }
      
      // Gọi API cho từng batch và gộp kết quả
      const allCreatives: TikTokCreative[] = [];
      
      for (const batch of batches) {
        const response = await apiClient.get<CreativeListResponse>('/creative/ads/get/', {
          params: {
            advertiser_id: advertiserId,
            filtering: {
              ad_ids: batch
            },
            fields: [
              'ad_id', 
              'ad_name', 
              'thumbnail_url'
            ]
          }
        });
        
        allCreatives.push(...response.data.data.list);
      }
      
      return allCreatives;
    } catch (error) {
      console.error('Error fetching creatives for ads:', error);
      throw error;
    }
  }
}
