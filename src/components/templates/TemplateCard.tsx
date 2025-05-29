import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Mail, Trash, Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Template } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";
import { useDeleteTemplate, usePreviewTemplate, useCopyTemplate } from "@/hooks/use-templates";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard = ({ template }: TemplateCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();
  const { data: previewData, isLoading: isPreviewLoading } = usePreviewTemplate(template.id);
  const { mutate: copyTemplate, isPending: isCopying } = useCopyTemplate();

  const handleDelete = () => {
    deleteTemplate(template.id);
    setShowDeleteDialog(false);
  };

  const handleCopy = () => {
    copyTemplate(template.id, {
      onSuccess: () => {
        toast.success("Template copied");
      },
      onError: () => {
        toast.error("Failed to copy template");
      },
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <AspectRatio ratio={16 / 9} className="bg-white border-b">
          {isPreviewLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
            </div>
          ) : previewData?.preview?.content ? (
            <div
              className="w-full h-full overflow-auto p-2 text-xs bg-white"
              style={{ maxHeight: 180 }}
              dangerouslySetInnerHTML={{ __html: previewData.preview.content }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-400 text-sm">
              No Preview Available
            </div>
          )}
        </AspectRatio>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-brand-accent mb-2">{template.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description || "No description"}</p>
          
          <div className="grid grid-cols-2 text-xs text-gray-500 mb-4">
            <div>
              <p className="mb-1">Created: {formatDate(template.createdAt)}</p>
              <p>Last used: {formatDate(template.lastUsed)}</p>
            </div>
            <div className="text-right">
              <p className="mb-1">Used {template.usageCount} times</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs flex-1" asChild>
              <a href={`/templates/${template.id}/edit`}>
                <Edit className="h-3 w-3 mr-1" /> Edit
              </a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs flex-1" asChild>
              <a href={`/campaigns/new?templateId=${template.id}`}>
                <Mail className="h-3 w-3 mr-1" /> Use
              </a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs flex-1" onClick={handleCopy} disabled={isCopying}>
              <Copy className="h-3 w-3 mr-1" />
              {isCopying ? "Copying..." : "Copy"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 flex-1"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{template.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
