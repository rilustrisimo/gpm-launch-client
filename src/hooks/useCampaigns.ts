import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/lib/services';
import { Campaign } from '@/lib/types';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// Query keys
const CAMPAIGNS_KEY = 'campaigns';
const CAMPAIGN_STATS_KEY = 'campaignStats';

/**
 * Hook to fetch all campaigns
 */
export const useCampaigns = (status?: string, search?: string) => {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, { status, search }],
    queryFn: () => campaignService.getAll(status, search),
  });
};

/**
 * Hook to fetch a single campaign by ID
 */
export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, id],
    queryFn: () => campaignService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch campaign statistics
 */
export const useCampaignStats = (id: string) => {
  return useQuery({
    queryKey: [CAMPAIGN_STATS_KEY, id],
    queryFn: () => campaignService.getStats(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new campaign
 */
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaign: Partial<Campaign>) => campaignService.create(campaign),
    onSuccess: () => {
      toast.success('Campaign created successfully');
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing campaign
 */
export const useUpdateCampaign = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaign: Partial<Campaign>) => campaignService.update(id, campaign),
    onSuccess: () => {
      toast.success('Campaign updated successfully');
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a campaign
 */
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignService.delete(id),
    onSuccess: () => {
      toast.success('Campaign deleted successfully');
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });
};

/**
 * Hook to schedule a campaign
 */
export const useScheduleCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ campaignId, scheduledFor }: { campaignId: string; scheduledFor: string }) => {
      const response = await api.post(`/campaigns/${campaignId}/schedule`, { scheduledFor });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule campaign: ${error.message}`);
    },
  });
};

/**
 * Hook to cancel a scheduled campaign
 */
export const useCancelSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.post(`/campaigns/${campaignId}/cancel-schedule`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel schedule: ${error.message}`);
    },
  });
};

/**
 * Hook to send a campaign immediately
 */
export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.post(`/campaigns/${campaignId}/send-now`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send campaign: ${error.message}`);
    },
  });
};

/**
 * Hook to stop a sending campaign
 */
export const useStopCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await api.post(`/campaigns/${campaignId}/stop`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to stop campaign: ${error.message}`);
    },
  });
}; 