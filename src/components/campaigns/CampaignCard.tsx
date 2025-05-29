import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, BarChart, Trash } from "lucide-react";
import { Campaign } from "@/lib/types";
import { format } from "date-fns";
import { useDeleteCampaign } from "@/hooks";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
  
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

  const handleDelete = () => {
    deleteCampaign(campaign.id);
    setShowDeleteDialog(false);
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
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-brand-accent mb-2">{campaign.name}</h3>
              <div className="text-sm text-gray-500 mb-4">
                {campaign.status === "draft" || campaign.status === "scheduled" ? (
                  <>Not sent yet • {campaign.totalRecipients.toLocaleString()} recipients</>
                ) : (
                  <>Sent on {formatDate(campaign.sentAt)} • {campaign.totalRecipients.toLocaleString()} recipients</>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href={`/campaigns/${campaign.id}/edit`}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </a>
                </Button>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={campaign.status === "sending" || isDeleting}
                >
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
                  <p className="text-xl font-semibold text-brand-accent capitalize">{campaign.status}</p>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign "{campaign.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
