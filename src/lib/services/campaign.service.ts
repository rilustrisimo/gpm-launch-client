import api from '../api';
import { Campaign, ApiResponse, CampaignStat } from '../types';

/**
 * Service for handling campaign-related API requests
 */
export const campaignService = {
  /**
   * Get all campaigns
   * @param status - Optional status filter
   * @param search - Optional search term
   */
  getAll: async (status?: string, search?: string): Promise<Campaign[]> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      
      const response = await api.get<ApiResponse<{ campaigns: Campaign[] }>>(
        `/campaigns?${params.toString()}`
      );
      
      return response.data.campaigns || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },
  
  /**
   * Get a campaign by ID
   * @param id - Campaign ID
   */
  getById: async (id: string): Promise<Campaign> => {
    try {
      const response = await api.get<ApiResponse<{ campaign: Campaign }>>(
        `/campaigns/${id}`
      );
      
      return response.data.campaign;
    } catch (error) {
      console.error(`Error fetching campaign with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new campaign
   * @param campaign - Campaign data
   */
  create: async (campaign: Partial<Campaign>): Promise<Campaign> => {
    try {
      const response = await api.post<ApiResponse<{ campaign: Campaign }>>(
        '/campaigns',
        campaign
      );
      
      return response.data.campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing campaign
   * @param id - Campaign ID
   * @param campaign - Updated campaign data
   */
  update: async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
    try {
      const response = await api.put<ApiResponse<{ campaign: Campaign }>>(
        `/campaigns/${id}`,
        campaign
      );
      
      return response.data.campaign;
    } catch (error) {
      console.error(`Error updating campaign with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a campaign
   * @param id - Campaign ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete<ApiResponse<{}>>(
        `/campaigns/${id}`
      );
    } catch (error) {
      console.error(`Error deleting campaign with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get campaign statistics
   * @param id - Campaign ID
   */
  getStats: async (id: string): Promise<{
    campaign: Pick<Campaign, 'id' | 'name' | 'status' | 'scheduledFor' | 'sentAt'>;
    stats: {
      totalRecipients: number;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
      openRate: number;
      clickRate: number;
    };
    recipients: CampaignStat[];
  }> => {
    try {
      const response = await api.get<ApiResponse<{
        campaign: Pick<Campaign, 'id' | 'name' | 'status' | 'scheduledFor' | 'sentAt'>;
        stats: {
          totalRecipients: number;
          sent: number;
          delivered: number;
          opened: number;
          clicked: number;
          bounced: number;
          openRate: number;
          clickRate: number;
        };
        recipients: CampaignStat[];
      }>>(
        `/campaigns/${id}/stats`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch campaign statistics');
      }
      
      return {
        campaign: response.data.campaign,
        stats: response.data.stats,
        recipients: response.data.recipients
      };
    } catch (error) {
      console.error(`Error fetching statistics for campaign with ID ${id}:`, error);
      throw error;
    }
  },

  scheduleCampaign: async (id: string, scheduledFor: string): Promise<Campaign> => {
    const response = await api.post<ApiResponse<{ campaign: Campaign }>>(
      `/campaigns/${id}/schedule`,
      { scheduledFor }
    );
    return response.data.campaign;
  },

  cancelSchedule: async (id: string): Promise<Campaign> => {
    const response = await api.post<ApiResponse<{ campaign: Campaign }>>(
      `/campaigns/${id}/cancel-schedule`
    );
    return response.data.campaign;
  },

  sendNow: async (id: string): Promise<Campaign> => {
    const response = await api.post<ApiResponse<{ campaign: Campaign }>>(
      `/campaigns/${id}/send-now`
    );
    return response.data.campaign;
  },

  stopCampaign: async (id: string): Promise<Campaign> => {
    const response = await api.post<ApiResponse<{ campaign: Campaign }>>(
      `/campaigns/${id}/stop`
    );
    return response.data.campaign;
  }
}; 