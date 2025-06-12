import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, BarChart } from "lucide-react";
import { Campaign } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { CampaignControlModal } from "./CampaignControlModal";
import { TurtleProgressIndicator } from "./TurtleProgressIndicator";

interface CampaignCardProps {
  campaign: Campaign;
  onCampaignUpdate?: () => void;
}

export const CampaignCard = ({ campaign, onCampaignUpdate }: CampaignCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "sending":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "draft":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDuplicate = () => {
    toast.success("Campaign duplicated");
    // Implement duplication logic when needed
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatRate = (rate: number) => {
    return rate ? `${rate.toFixed(1)}%` : "-";
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  {/* Add turtle mode indicator */}
                  {campaign.sendingMode === 'turtle' && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      🐢 {campaign.emailsPerMinute}/min
                    </span>
                  )}
                </div>
                <CampaignControlModal 
                  campaign={campaign} 
                  onSuccess={onCampaignUpdate}
                />
              </div>
              <h3 className="text-xl font-semibold text-brand-accent mb-2">{campaign.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
              <div className="text-sm text-gray-500 mb-4">
                {campaign.status === "draft" || campaign.status === "scheduled" ? (
                  <>Not sent yet • {campaign.totalRecipients.toLocaleString()} recipients</>
                ) : (
                  <>Sent on {formatDate(campaign.sentAt)} • {campaign.totalRecipients.toLocaleString()} recipients</>
                )}
                {campaign.scheduledFor && campaign.status === "scheduled" && (
                  <> • Scheduled for {formatDate(campaign.scheduledFor)}</>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={handleDuplicate}>
                  <Copy className="h-3 w-3 mr-1" /> Duplicate
                </Button>
                {campaign.status === "completed" && (
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={`/campaigns/${campaign.id}/stats`}>
                      <BarChart className="h-3 w-3 mr-1" /> Reports
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 md:col-span-1 lg:col-span-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Recipients</p>
                  <p className="text-xl font-semibold text-brand-accent">{campaign.totalRecipients.toLocaleString()}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Template</p>
                  <p className="text-sm font-medium text-brand-accent truncate">{campaign.template?.name || "N/A"}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Open Rate</p>
                  <p className="text-xl font-semibold text-brand-accent">{formatRate(campaign.openRate)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Click Rate</p>
                  <p className="text-xl font-semibold text-brand-accent">{formatRate(campaign.clickRate)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show turtle progress indicator for active turtle campaigns */}
      {campaign.sendingMode === 'turtle' && 
       (campaign.status === 'sending' || campaign.status === 'processing' || campaign.status === 'stopped') && (
        <div className="mt-4">
          <TurtleProgressIndicator 
            campaign={campaign} 
            onUpdate={onCampaignUpdate}
          />
        </div>
      )}
    </>
  );
};
