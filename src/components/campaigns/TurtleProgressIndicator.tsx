import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pause, Play, StopCircle, Activity, AlertCircle } from 'lucide-react';
import { Campaign } from '@/lib/types';
import { useCampaignStats } from '@/hooks/useCampaigns';
import { useStopCampaign, useSendCampaign } from '@/hooks/useCampaigns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TurtleProgressIndicatorProps {
  campaign: Campaign;
  onUpdate?: () => void;
}

export const TurtleProgressIndicator: React.FC<TurtleProgressIndicatorProps> = ({
  campaign,
  onUpdate,
}) => {
  const [isPolling, setIsPolling] = useState(campaign.status === 'sending' || campaign.status === 'processing');
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  
  // Fetch campaign stats with adaptive polling for active campaigns
  const { 
    data: statsData, 
    refetch: refetchStats,
    isLoading,
    error
  } = useCampaignStats(campaign.id);

  const { mutate: stopCampaign, isPending: isStopping } = useStopCampaign();
  const { mutate: resumeCampaign, isPending: isResuming } = useSendCampaign();

  // Debug: Log the statsData to console to see what we're actually getting
  useEffect(() => {
    if (statsData) {
      console.log('TurtleProgressIndicator - statsData:', statsData);
      console.log('TurtleProgressIndicator - stats.delivered:', statsData.stats?.delivered);
      console.log('TurtleProgressIndicator - stats.sent:', statsData.stats?.sent);
      console.log('TurtleProgressIndicator - recipients count:', statsData.recipients?.length);
      
      // Debug: Count actual records from recipients array
      if (statsData.recipients && Array.isArray(statsData.recipients)) {
        const actualSent = statsData.recipients.filter(r => r.sent).length;
        const actualDelivered = statsData.recipients.filter(r => r.delivered).length;
        const actualOpened = statsData.recipients.filter(r => r.opened).length;
        const actualClicked = statsData.recipients.filter(r => r.clicked).length;
        const actualBounced = statsData.recipients.filter(r => r.bounced).length;
        
        console.log('TurtleProgressIndicator - Actual counts from DB records:', {
          sent: actualSent,
          delivered: actualDelivered,
          opened: actualOpened,
          clicked: actualClicked,
          bounced: actualBounced
        });
      }
    }
  }, [statsData]);

  // Enhanced polling logic with adaptive intervals and error handling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Only poll if campaign is actively sending/processing AND not complete
    const shouldContinuePolling = isPolling && 
      (campaign.status === 'sending' || campaign.status === 'processing') &&
      (!statsData?.progress || statsData.progress < 100);

    if (shouldContinuePolling) {
      // Adaptive polling: slower interval if there have been errors
      const pollingInterval = errorCount > 3 ? 15000 : (errorCount > 1 ? 10000 : 5000);
      
      console.log(`Starting polling for campaign ${campaign.id} with ${pollingInterval}ms interval`);
      
      intervalId = setInterval(async () => {
        try {
          const result = await refetchStats();
          
          // Reset error count on successful fetch
          if (errorCount > 0) {
            setErrorCount(0);
            setPollingError(null);
          }
          
          // Check if campaign is complete based on backend progress
          if (result.data?.progress && result.data.progress >= 100) {
            console.log(`Campaign ${campaign.id} complete (progress: ${result.data.progress}%), stopping polling`);
            setIsPolling(false);
          }
          
        } catch (err: any) {
          console.error('Polling error:', err);
          const newErrorCount = errorCount + 1;
          setErrorCount(newErrorCount);
          setPollingError(err.message || 'Failed to fetch campaign updates');
          
          // Stop polling after 5 consecutive errors
          if (newErrorCount >= 5) {
            setIsPolling(false);
            toast.error('Stopped polling due to repeated errors. Please refresh manually.');
          }
        }
      }, pollingInterval);
    } else if (statsData?.progress && statsData.progress >= 100) {
      console.log(`Campaign ${campaign.id} is complete (progress: ${statsData.progress}%), not polling`);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, campaign.status, campaign.id, refetchStats, errorCount, statsData?.progress]);

  // Update polling state when campaign status changes or progress reaches 100%
  useEffect(() => {
    const isActiveStatus = campaign.status === 'sending' || campaign.status === 'processing';
    const isComplete = statsData?.progress && statsData.progress >= 100;
    const shouldPoll = isActiveStatus && !isComplete;
    
    // Only change polling state if it's different from current state
    if (shouldPoll && !isPolling) {
      console.log(`Starting polling for campaign ${campaign.id} - Status: ${campaign.status}, Progress: ${statsData?.progress}%`);
      setIsPolling(true);
      setErrorCount(0);
      setPollingError(null);
    } else if (!shouldPoll && isPolling) {
      console.log(`Stopping polling for campaign ${campaign.id} - Status: ${campaign.status}, Progress: ${statsData?.progress}%`);
      setIsPolling(false);
    }
  }, [campaign.status, campaign.id, statsData?.progress, isPolling]);

  const handleStop = () => {
    stopCampaign(campaign.id, {
      onSuccess: () => {
        setIsPolling(false);
        toast.success('Campaign stopped successfully');
        onUpdate?.();
      },
      onError: (error: any) => {
        toast.error(`Failed to stop campaign: ${error.message}`);
      },
    });
  };

  const handleResume = () => {
    resumeCampaign(campaign.id, {
      onSuccess: () => {
        setIsPolling(true);
        setErrorCount(0); // Reset error count on successful resume
        setPollingError(null);
        toast.success('Campaign resumed successfully');
        onUpdate?.();
      },
      onError: (error: any) => {
        toast.error(`Failed to resume campaign: ${error.message}`);
      },
    });
  };

  const handleManualRefresh = async () => {
    try {
      await refetchStats();
      toast.success('Campaign data refreshed');
      setErrorCount(0);
      setPollingError(null);
    } catch (err: any) {
      toast.error(`Failed to refresh: ${err.message}`);
    }
  };

  if (!campaign.sendingMode || campaign.sendingMode !== 'turtle') {
    return null;
  }

  // Use actual database records instead of computed stats when available
  const stats = statsData?.stats;
  const recipients = statsData?.recipients;
  
  // Calculate progress from actual database records for accuracy
  let actualStats = null;
  if (recipients && Array.isArray(recipients) && recipients.length > 0) {
    actualStats = {
      totalRecipients: recipients.length,
      sent: recipients.filter(r => r.sent).length,
      delivered: recipients.filter(r => r.delivered).length,
      opened: recipients.filter(r => r.opened).length,
      clicked: recipients.filter(r => r.clicked).length,
      bounced: recipients.filter(r => r.bounced).length,
      openRate: recipients.length > 0 ? (recipients.filter(r => r.opened).length / recipients.length) * 100 : 0,
      clickRate: recipients.length > 0 ? (recipients.filter(r => r.clicked).length / recipients.length) * 100 : 0,
    };
    
    console.log('TurtleProgressIndicator - Using actual DB records for stats:', actualStats);
  } else {
    console.log('TurtleProgressIndicator - No database records available, using computed stats from API');
  }
  
  // Use actual stats if available and non-empty, otherwise fall back to API computed stats
  // Special case: if computed stats show completion but DB records are empty, use computed stats
  let effectiveStats = stats; // Default to computed stats
  
  if (actualStats && actualStats.totalRecipients > 0) {
    // Use database records when we have actual data
    effectiveStats = actualStats;
    console.log('TurtleProgressIndicator - Using database records (non-empty)');
  } else if (stats && stats.totalRecipients > 0) {
    // Use computed stats when database records are empty but computed stats have data
    effectiveStats = stats;
    console.log('TurtleProgressIndicator - Using computed stats (database records empty)');
  } else {
    // Fallback case
    effectiveStats = actualStats || stats;
    console.log('TurtleProgressIndicator - Using fallback stats');
  }
  
  // Calculate progress with proper NaN handling
  let progressPercentage = 0;
  if (effectiveStats && effectiveStats.totalRecipients > 0) {
    progressPercentage = Math.round((effectiveStats.sent / effectiveStats.totalRecipients) * 100);
  }
  
  // Ensure progress is within valid range
  progressPercentage = Math.min(100, Math.max(0, progressPercentage || 0));
  
  const remainingEmails = effectiveStats ? effectiveStats.totalRecipients - effectiveStats.sent : campaign.totalRecipients;
  const estimatedTimeMinutes = campaign.emailsPerMinute && remainingEmails > 0 ? Math.ceil(remainingEmails / campaign.emailsPerMinute) : 0;

  // Check for discrepancies between computed stats and actual records
  // Only check when we have meaningful data from both sources
  const hasDiscrepancy = actualStats && stats && 
    actualStats.totalRecipients > 0 && stats.totalRecipients > 0 && (
      actualStats.sent !== stats.sent || 
      actualStats.delivered !== stats.delivered ||
      actualStats.opened !== stats.opened ||
      actualStats.clicked !== stats.clicked
    );

  if (hasDiscrepancy) {
    console.warn('TurtleProgressIndicator - Discrepancy detected between computed stats and database records:', {
      computed: stats,
      actual: actualStats
    });
  }

  const getStatusColor = (status: string) => {
    // If backend reports 100% progress, treat as completed regardless of status
    const isComplete = statsData?.progress && statsData.progress >= 100;
    
    if (isComplete) {
      return 'bg-green-100 text-green-800';
    }
    
    switch (status) {
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🐢 Turtle Send Progress
            {isPolling && <Activity className="h-4 w-4 text-blue-600 animate-pulse" />}
            {pollingError && <AlertCircle className="h-4 w-4 text-red-500" />}
          </CardTitle>
          <Badge className={cn('text-xs', getStatusColor(campaign.status))}>
            {statsData?.progress && statsData.progress >= 100 ? 'completed' : campaign.status}
          </Badge>
        </div>
        
        {/* Error indicator */}
        {pollingError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span>Updates paused: {pollingError}</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="ml-auto h-auto p-1 text-xs"
              onClick={handleManualRefresh}
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Data source indicator */}
        {hasDiscrepancy && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span>Data mismatch detected - using most reliable source</span>
          </div>
        )}
        
        {/* Show when using computed stats due to empty database records */}
        {!actualStats && stats && stats.totalRecipients > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span>Using computed statistics (campaign records may be archived)</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {effectiveStats?.sent || 0} of {effectiveStats?.totalRecipients || campaign.totalRecipients} emails sent
            </span>
            <span className="text-blue-600 font-semibold">
              {progressPercentage}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-blue-100" 
          />
        </div>

        {/* Stats Grid - Mobile responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-sm">
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-gray-500 text-xs">Rate</p>
            <p className="font-semibold text-blue-600 text-sm sm:text-base">
              {campaign.emailsPerMinute}/min
            </p>
          </div>
          
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-gray-500 text-xs">Delivered</p>
            <p className="font-semibold text-green-600 text-sm sm:text-base">
              {effectiveStats?.delivered || 0}
            </p>
          </div>
          
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-gray-500 text-xs">Remaining</p>
            <p className="font-semibold text-orange-600 text-sm sm:text-base">
              {remainingEmails.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-gray-500 text-xs">Est. Time</p>
            <p className="font-semibold text-purple-600 text-sm sm:text-base">
              {(statsData?.progress && statsData.progress >= 100) || campaign.status === 'completed' ? 'Done' : formatTime(estimatedTimeMinutes)}
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        {effectiveStats && (
          <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Opened:</span>
              <span className="font-medium text-green-600">
                {effectiveStats.opened} ({effectiveStats.openRate.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clicked:</span>
              <span className="font-medium text-blue-600">
                {effectiveStats.clicked} ({effectiveStats.clickRate.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bounced:</span>
              <span className="font-medium text-red-600">
                {effectiveStats.bounced}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Delay:</span>
              <span className="font-medium text-gray-700">
                {campaign.emailsPerMinute ? (60 / campaign.emailsPerMinute).toFixed(1) : '0'}s
              </span>
            </div>
          </div>
        )}

        {/* Control Buttons - Mobile responsive */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          {campaign.status === 'sending' || campaign.status === 'processing' ? (
            <Button
              onClick={handleStop}
              disabled={isStopping}
              size="sm"
              variant="destructive"
              className="flex-1"
            >
              {isStopping ? (
                <>
                  <StopCircle className="h-4 w-4 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Campaign
                </>
              )}
            </Button>
          ) : campaign.status === 'stopped' ? (
            <Button
              onClick={handleResume}
              disabled={isResuming}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isResuming ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Resuming...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Campaign
                </>
              )}
            </Button>
          ) : null}
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (isPolling) {
                  setIsPolling(false);
                } else {
                  setIsPolling(true);
                  setErrorCount(0);
                  setPollingError(null);
                }
              }}
              size="sm"
              variant="outline"
              disabled={campaign.status === 'completed'}
              className="flex-1 sm:flex-initial"
            >
              {isPolling ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Pause Updates</span>
                  <span className="sm:hidden">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Resume Updates</span>
                  <span className="sm:hidden">Resume</span>
                </>
              )}
            </Button>
            
            {/* Manual refresh button */}
            <Button
              onClick={handleManualRefresh}
              size="sm"
              variant="ghost"
              disabled={isLoading}
              title="Refresh data manually"
              className="px-3"
            >
              {isLoading ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Live indicator */}
        {isPolling && campaign.status === 'sending' && !pollingError && (
          <div className="flex items-center justify-center text-xs text-blue-600 bg-blue-50 rounded p-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
            Live updates every {errorCount > 3 ? '15' : (errorCount > 1 ? '10' : '5')} seconds
          </div>
        )}
      </CardContent>
    </Card>
  );
};
