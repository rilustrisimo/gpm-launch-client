
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, BarChart, Trash } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  sentDate: string;
  totalRecipients: number;
  openRate: string;
  clickRate: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Sending":
        return "bg-blue-100 text-blue-800";
      case "Scheduled":
        return "bg-purple-100 text-purple-800";
      case "Draft":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          <div className="p-6 md:col-span-2">
            <div className="mb-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-brand-accent mb-2">{campaign.name}</h3>
            <div className="text-sm text-gray-500 mb-4">
              {campaign.status === "Draft" || campaign.status === "Scheduled" ? (
                <>Not sent yet • {campaign.totalRecipients.toLocaleString()} recipients</>
              ) : (
                <>Sent on {campaign.sentDate} • {campaign.totalRecipients.toLocaleString()} recipients</>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Copy className="h-3 w-3 mr-1" /> Duplicate
              </Button>
              {campaign.status === "Completed" && (
                <Button variant="outline" size="sm" className="text-xs">
                  <BarChart className="h-3 w-3 mr-1" /> Reports
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 md:col-span-1 lg:col-span-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Recipients</p>
                <p className="text-xl font-semibold text-brand-accent">{campaign.totalRecipients.toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-xl font-semibold text-brand-accent">{campaign.status}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Open Rate</p>
                <p className="text-xl font-semibold text-brand-accent">{campaign.openRate}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Click Rate</p>
                <p className="text-xl font-semibold text-brand-accent">{campaign.clickRate}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
