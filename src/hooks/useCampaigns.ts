import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/lib/services';
import { Campaign } from '@/lib/types';
import { toast } from 'sonner';

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
export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, id],
    queryFn: () => campaignService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch campaign statistics
 */
export const useCampaignStats = (id: number) => {
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
export const useUpdateCampaign = (id: number) => {
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
    mutationFn: (id: number) => campaignService.delete(id),
    onSuccess: () => {
      toast.success('Campaign deleted successfully');
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });
}; 