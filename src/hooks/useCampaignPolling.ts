import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaignStats } from '@/hooks/useCampaigns';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number;
  onStatusChange?: (newStatus: string) => void;
  onComplete?: () => void;
}

/**
 * Hook for polling campaign statistics in real-time
 * Automatically manages polling lifecycle based on campaign status
 */
export const useCampaignPolling = (
  campaignId: string,
  currentStatus: string,
  options: UsePollingOptions = {}
) => {
  const {
    enabled = true,
    interval = 5000, // 5 seconds default
    onStatusChange,
    onComplete,
  } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Fetch campaign stats
  const {
    data: statsData,
    refetch: refetchStats,
    isLoading,
    error,
  } = useCampaignStats(campaignId);

  // Determine if we should be polling based on campaign status
  const shouldPoll = enabled && (
    currentStatus === 'sending' ||
    currentStatus === 'processing' ||
    currentStatus === 'scheduled'
  );

  // Start/stop polling based on shouldPoll flag
  useEffect(() => {
    if (shouldPoll && !isPolling) {
      setIsPolling(true);
      setPollCount(0);
    } else if (!shouldPoll && isPolling) {
      setIsPolling(false);
    }
  }, [shouldPoll, isPolling]);

  // Handle the actual polling
  useEffect(() => {
    if (isPolling) {
      intervalRef.current = setInterval(async () => {
        try {
          const result = await refetchStats();
          setPollCount(prev => prev + 1);

          // Check if campaign status changed
          if (result.data?.campaign?.status && result.data.campaign.status !== currentStatus) {
            onStatusChange?.(result.data.campaign.status);
            
            // If campaign completed, stop polling
            if (result.data.campaign.status === 'completed') {
              setIsPolling(false);
              onComplete?.();
            }
          }
        } catch (error) {
          console.error('Error polling campaign stats:', error);
        }
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, interval, refetchStats, currentStatus, onStatusChange, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual controls
  const startPolling = () => {
    if (!isPolling) {
      setIsPolling(true);
    }
  };

  const stopPolling = () => {
    if (isPolling) {
      setIsPolling(false);
    }
  };

  const refreshNow = async () => {
    try {
      const result = await refetchStats();
      return result.data;
    } catch (error) {
      console.error('Error refreshing campaign stats:', error);
      throw error;
    }
  };

  // Invalidate related queries when polling updates
  useEffect(() => {
    if (pollCount > 0) {
      // Also refresh the main campaigns list to keep it in sync
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  }, [pollCount, queryClient]);

  return {
    // Data
    stats: statsData?.stats,
    campaign: statsData?.campaign,
    recipients: statsData?.recipients,
    
    // Status
    isPolling,
    isLoading,
    error,
    pollCount,
    
    // Controls
    startPolling,
    stopPolling,
    refreshNow,
    
    // Computed values
    progressPercentage: statsData?.stats 
      ? Math.round((statsData.stats.sent / statsData.stats.totalRecipients) * 100)
      : 0,
    remainingEmails: statsData?.stats 
      ? statsData.stats.totalRecipients - statsData.stats.sent 
      : 0,
  };
};
