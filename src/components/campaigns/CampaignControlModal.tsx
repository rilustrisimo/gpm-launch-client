import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, MoreVertical, Edit, Trash2, Clock, AlertTriangle, Send, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useTemplates, useContactLists, useUpdateCampaign, useDeleteCampaign, useScheduleCampaign, useCancelSchedule, useSendCampaign, useStopCampaign } from "@/hooks";
import { Campaign } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CampaignControlModalProps {
  campaign: Campaign;
  onSuccess?: () => void;
}

export function CampaignControlModal({ campaign, onSuccess }: CampaignControlModalProps) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showSendAlert, setShowSendAlert] = useState(false);
  const [showStopAlert, setShowStopAlert] = useState(false);
  
  // Form states
  const [name, setName] = useState(campaign.name);
  const [subject, setSubject] = useState(campaign.subject);
  const [templateId, setTemplateId] = useState(campaign.templateId.toString());
  const [contactListId, setContactListId] = useState(campaign.contactListId.toString());
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(
    campaign.scheduledFor ? new Date(campaign.scheduledFor) : undefined
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch templates and contact lists
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: contactListsData, isLoading: contactListsLoading } = useContactLists("", 1, 1000);
  const contactLists = contactListsData?.contactLists || [];

  // Mutations
  const { mutate: updateCampaign, isPending: isUpdating } = useUpdateCampaign(campaign.id);
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
  const { mutate: scheduleCampaign, isPending: isScheduling } = useScheduleCampaign();
  const { mutate: cancelSchedule, isPending: isCancelling } = useCancelSchedule();
  const { mutate: sendCampaign, isPending: isSending } = useSendCampaign();
  const { mutate: stopCampaign, isPending: isStopping } = useStopCampaign();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Campaign name is required";
    }
    
    if (!subject.trim()) {
      newErrors.subject = "Subject line is required";
    }
    
    if (!templateId) {
      newErrors.templateId = "Template is required";
    }
    
    if (!contactListId) {
      newErrors.contactListId = "Contact list is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      return;
    }

    updateCampaign({
      name: name.trim(),
      subject: subject.trim(),
      templateId: parseInt(templateId, 10),
      contactListId: parseInt(contactListId, 10),
    }, {
      onSuccess: () => {
        setEditMode(false);
        toast.success("Campaign updated successfully");
        onSuccess?.();
      },
      onError: (error: any) => {
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          const newErrors: Record<string, string> = {};
          
          apiErrors.forEach((err: { path: string; msg: string }) => {
            newErrors[err.path] = err.msg;
          });
          
          setErrors(newErrors);
          toast.error("Please fix the validation errors");
        } else {
          toast.error(error.message || "Failed to update campaign");
        }
      }
    });
  };

  const handleDelete = () => {
    deleteCampaign(campaign.id, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Campaign deleted successfully");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete campaign");
      }
    });
  };

  const handleSchedule = () => {
    if (!scheduledFor) {
      toast.error("Please select a date to schedule the campaign");
      return;
    }

    scheduleCampaign({
      campaignId: campaign.id,
      scheduledFor: scheduledFor.toISOString()
    }, {
      onSuccess: () => {
        setShowScheduleModal(false);
        toast.success("Campaign scheduled successfully");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to schedule campaign");
      }
    });
  };

  const handleCancelSchedule = () => {
    cancelSchedule(campaign.id, {
      onSuccess: () => {
        setShowCancelAlert(false);
        toast.success("Campaign schedule cancelled");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to cancel schedule");
      }
    });
  };

  const handleSendNow = () => {
    sendCampaign(campaign.id, {
      onSuccess: () => {
        setShowSendAlert(false);
        toast.success(campaign.status === 'stopped' ? "Campaign resumed successfully" : "Campaign is being sent");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to send campaign");
      }
    });
  };

  const handleStop = () => {
    stopCampaign(campaign.id, {
      onSuccess: () => {
        setShowStopAlert(false);
        toast.success("Campaign stopped successfully");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to stop campaign");
      }
    });
  };

  const canEdit = campaign.status === 'draft';
  const canSchedule = campaign.status === 'draft';
  const canCancelSchedule = campaign.status === 'scheduled';
  const canSendNow = ['draft', 'scheduled', 'stopped'].includes(campaign.status);
  const canStop = ['sending', 'processing'].includes(campaign.status);
  const canDelete = !['sending', 'processing'].includes(campaign.status);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Campaign Control</DialogTitle>
            <DialogDescription>
              Manage your campaign settings and actions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campaign Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Status</h3>
                <p className={cn(
                  "text-sm capitalize",
                  campaign.status === 'stopped' && "text-red-600 font-medium",
                  campaign.status === 'sending' && "text-blue-600 font-medium",
                  campaign.status === 'completed' && "text-green-600 font-medium",
                  campaign.status === 'scheduled' && "text-orange-600 font-medium"
                )}>
                  {campaign.status}
                </p>
              </div>
              <div className="flex gap-2">
                {canSchedule && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                )}
                {canCancelSchedule && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelAlert(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Cancel Schedule
                  </Button>
                )}
                {canSendNow && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowSendAlert(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {campaign.status === 'stopped' ? 'Resume Sending' : 'Send Now'}
                  </Button>
                )}
                {canStop && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowStopAlert(true)}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Sending
                  </Button>
                )}
              </div>
            </div>

            {/* Campaign Details */}
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(errors.name && "border-red-500")}
                      placeholder="Campaign name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={cn(errors.subject && "border-red-500")}
                      placeholder="Email subject"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template" className="text-right">
                    Template
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={templateId}
                      onValueChange={setTemplateId}
                    >
                      <SelectTrigger
                        id="template"
                        className={cn(errors.templateId && "border-red-500")}
                      >
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.templateId && (
                      <p className="text-sm text-red-500 mt-1">{errors.templateId}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactList" className="text-right">
                    Contact List
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={contactListId}
                      onValueChange={setContactListId}
                    >
                      <SelectTrigger
                        id="contactList"
                        className={cn(errors.contactListId && "border-red-500")}
                      >
                        <SelectValue placeholder="Select contact list" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactLists.map((list) => (
                          <SelectItem key={list.id} value={list.id.toString()}>
                            {list.name} ({list.count} contacts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.contactListId && (
                      <p className="text-sm text-red-500 mt-1">{errors.contactListId}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <div className="col-span-3">{campaign.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Subject</Label>
                  <div className="col-span-3">{campaign.subject}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Template</Label>
                  <div className="col-span-3">{campaign.template?.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Contact List</Label>
                  <div className="col-span-3">
                    {campaign.contactList?.name} ({campaign.totalRecipients} contacts)
                  </div>
                </div>
                {campaign.scheduledFor && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Scheduled For</Label>
                    <div className="col-span-3">
                      {format(new Date(campaign.scheduledFor), "PPP p")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {editMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Campaign
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Campaign</DialogTitle>
            <DialogDescription>
              Choose when to send this campaign
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledFor && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledFor ? format(scheduledFor, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledFor}
                  onSelect={setScheduledFor}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSchedule}
              disabled={isScheduling || !scheduledFor}
            >
              {isScheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Campaign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Campaign"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Schedule Alert */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the scheduled sending of this campaign. You can reschedule it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSchedule}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Schedule"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Now Alert */}
      <AlertDialog open={showSendAlert} onOpenChange={setShowSendAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {campaign.status === 'stopped' ? 'Resume Campaign?' : 'Send Campaign Now?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {campaign.status === 'stopped' 
                ? 'This will resume sending this campaign to the remaining recipients. This action cannot be undone.'
                : 'This will immediately start sending this campaign to all recipients. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendNow}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {campaign.status === 'stopped' ? 'Resuming...' : 'Sending...'}
                </>
              ) : (
                campaign.status === 'stopped' ? 'Resume Campaign' : 'Send Now'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Campaign Alert */}
      <AlertDialog open={showStopAlert} onOpenChange={setShowStopAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately stop the sending process for this campaign. Any emails already in queue will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700"
              disabled={isStopping}
            >
              {isStopping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                "Stop Campaign"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 