import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/lib/services';

// Query keys
const DASHBOARD_STATS_KEY = 'dashboardStats';
const CAMPAIGN_PERFORMANCE_STATS_KEY = 'campaignPerformanceStats';
const CONTACT_GROWTH_STATS_KEY = 'contactGrowthStats';

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: [DASHBOARD_STATS_KEY],
    queryFn: () => statsService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch campaign performance statistics
 */
export const useCampaignPerformanceStats = () => {
  return useQuery({
    queryKey: [CAMPAIGN_PERFORMANCE_STATS_KEY],
    queryFn: () => statsService.getCampaignPerformanceStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch contact growth statistics
 */
export const useContactGrowthStats = () => {
  return useQuery({
    queryKey: [CONTACT_GROWTH_STATS_KEY],
    queryFn: () => statsService.getContactGrowthStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 