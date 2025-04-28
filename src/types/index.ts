export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spend: number;
  spendPercent: number;
  impressions: number;
  traffic: number;
  clicks: number;
  ctr: number;
  cvr: number;
  cpc: number;
  cpa: number;
  conversions: number;
  revenue: number;
  orders: number;
  aov: number;
  roas: number;
  cancelledOrders: number;
  cancelledRevenue: number;
  cancelledRevenuePercent: number;
  startDate: string;
  endDate: string;
  objective: 'traffic' | 'conversions' | 'app_install' | 'video_views';
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
}

export interface ChartData {
  date: string;
  spend: number;
  revenue: number;
  conversions: number;
  traffic: number;
  orders: number;
  cancelledOrders: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'budget' | 'bid' | 'creative' | 'targeting';
  campaignId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}
