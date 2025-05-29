import api from '../api';
import { 
  ApiResponse, 
  DashboardStats, 
  CampaignPerformanceStats, 
  ContactGrowthStats 
} from '../types';

/**
 * Service for handling statistics-related API requests
 */
export const statsService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<ApiResponse<{ stats: DashboardStats }>>(
        '/stats/dashboard'
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  
  /**
   * Get campaign performance statistics
   */
  getCampaignPerformanceStats: async (): Promise<CampaignPerformanceStats> => {
    try {
      const response = await api.get<ApiResponse<CampaignPerformanceStats>>(
        '/stats/campaigns'
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch campaign performance statistics');
      }
      
      return {
        campaigns: response.data.campaigns || [],
        overall: response.data.overall || {
          totalSent: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        }
      };
    } catch (error) {
      console.error('Error fetching campaign performance stats:', error);
      throw error;
    }
  },
  
  /**
   * Get contact growth statistics
   */
  getContactGrowthStats: async (): Promise<ContactGrowthStats> => {
    try {
      const response = await api.get<ApiResponse<ContactGrowthStats>>(
        '/stats/contacts'
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch contact growth statistics');
      }
      
      return {
        growth: response.data.growth || [],
        status: response.data.status || []
      };
    } catch (error) {
      console.error('Error fetching contact growth stats:', error);
      throw error;
    }
  }
}; 