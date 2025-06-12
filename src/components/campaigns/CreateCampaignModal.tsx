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
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTemplates, useContactLists, useCreateCampaign } from "@/hooks";
import { Campaign } from "@/lib/types";
import { RatePresetButtons } from "./RatePresetButtons";

export function CreateCampaignModal() {
  const [open, setOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [contactListId, setContactListId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(undefined);
  const [sendNow, setSendNow] = useState(true);
  const [sendingMode, setSendingMode] = useState<'normal' | 'turtle'>('normal');
  const [emailsPerMinute, setEmailsPerMinute] = useState(30);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch templates and contact lists
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: contactListsData, isLoading: contactListsLoading } = useContactLists("", 1, 1000);
  
  const contactLists = contactListsData?.contactLists || [];
  
  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!campaignName.trim()) {
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
    
    if (!sendNow && !scheduledFor) {
      newErrors.scheduledFor = "Please select a date for scheduling";
    }
    
    if (sendingMode === 'turtle') {
      if (!emailsPerMinute || emailsPerMinute < 1 || emailsPerMinute > 600) {
        newErrors.emailsPerMinute = "Emails per minute must be between 1 and 600";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const newCampaign: Partial<Campaign> = {
      name: campaignName.trim(),
      subject: subject.trim(),
      templateId: parseInt(templateId, 10),
      contactListId: parseInt(contactListId, 10),
      sendingMode,
      emailsPerMinute: sendingMode === 'turtle' ? emailsPerMinute : undefined,
      maxConcurrentBatches: sendingMode === 'turtle' ? 1 : undefined,
      scheduledFor: sendNow ? undefined : scheduledFor?.toISOString()
    };
    
    createCampaign(newCampaign, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
        toast.success("Campaign created successfully");
      },
      onError: (error: any) => {
        // Handle API validation errors
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          const newErrors: Record<string, string> = {};
          
          apiErrors.forEach((err: { path: string; msg: string }) => {
            newErrors[err.path] = err.msg;
          });
          
          setErrors(newErrors);
          toast.error("Please fix the validation errors");
        } else {
          toast.error(error.message || "Failed to create campaign");
        }
      }
    });
  };

  const resetForm = () => {
    setCampaignName("");
    setSubject("");
    setContactListId("");
    setTemplateId("");
    setScheduledFor(undefined);
    setSendNow(true);
    setSendingMode('normal');
    setEmailsPerMinute(30);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
          <Plus className="h-4 w-4 mr-2" /> Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign to send to your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className={cn(errors.name && "border-red-500")}
                  placeholder="Monthly Newsletter - May 2025"
                  required
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
                  placeholder="Your Monthly Newsletter"
                  required
                />
                {errors.subject && (
                  <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
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
                  required
                >
                  <SelectTrigger 
                    id="contactList" 
                    className={cn(errors.contactListId && "border-red-500")}
                  >
                    <SelectValue placeholder={contactListsLoading ? "Loading lists..." : "Select a contact list"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contactListsLoading ? (
                      <div className="p-2 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading contact lists...</span>
                      </div>
                    ) : contactLists && contactLists.length > 0 ? (
                      contactLists.map((list) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name} ({list.count} contacts)
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">No contact lists found</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.contactListId && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactListId}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Email Template
              </Label>
              <div className="col-span-3">
                <Select 
                  value={templateId} 
                  onValueChange={setTemplateId} 
                  required
                >
                  <SelectTrigger 
                    id="template" 
                    className={cn(errors.templateId && "border-red-500")}
                  >
                    <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select a template"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesLoading ? (
                      <div className="p-2 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading templates...</span>
                      </div>
                    ) : templates && templates.length > 0 ? (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">No templates found</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.templateId && (
                  <p className="text-sm text-red-500 mt-1">{errors.templateId}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                Sending Mode
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="normalMode"
                    name="sendingMode"
                    checked={sendingMode === 'normal'}
                    onChange={() => setSendingMode('normal')}
                    className="w-4 h-4 text-brand-highlight bg-gray-100 border-gray-300 focus:ring-brand-highlight"
                  />
                  <Label htmlFor="normalMode" className="text-sm font-normal">
                    Normal Send (Fast bulk sending)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="turtleMode"
                    name="sendingMode"
                    checked={sendingMode === 'turtle'}
                    onChange={() => setSendingMode('turtle')}
                    className="w-4 h-4 text-brand-highlight bg-gray-100 border-gray-300 focus:ring-brand-highlight"
                  />
                  <Label htmlFor="turtleMode" className="text-sm font-normal">
                    Turtle Send (Rate-limited sending)
                  </Label>
                </div>
                
                {/* Turtle Mode Configuration */}
                {sendingMode === 'turtle' && (
                  <div className="ml-6 mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-4">
                      {/* Rate Preset Buttons */}
                      <RatePresetButtons
                        currentRate={emailsPerMinute}
                        onRateChange={setEmailsPerMinute}
                        disabled={isCreating}
                      />
                      
                      {/* Custom Rate Slider */}
                      <div>
                        <Label htmlFor="emailsPerMinute" className="text-sm font-medium">
                          Custom Rate: {emailsPerMinute} emails/minute
                        </Label>
                        <input
                          type="range"
                          id="emailsPerMinute"
                          min="1"
                          max="600"
                          value={emailsPerMinute}
                          onChange={(e) => setEmailsPerMinute(parseInt(e.target.value))}
                          className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1/min (Slowest)</span>
                          <span>600/min (Fastest)</span>
                        </div>
                        {errors.emailsPerMinute && (
                          <p className="text-sm text-red-500 mt-1">{errors.emailsPerMinute}</p>
                        )}
                      </div>
                      
                      {/* Rate Information */}
                      <div className="text-sm text-blue-700">
                        <p><strong>Rate:</strong> {emailsPerMinute} emails/minute</p>
                        <p><strong>Delay:</strong> {((60 * 1000) / emailsPerMinute / 1000).toFixed(1)}s between emails</p>
                        {contactListId && (
                          <p><strong>Est. Time:</strong> ~{Math.ceil((contactLists.find(list => list.id.toString() === contactListId)?.count || 0) / emailsPerMinute)} minutes</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                Send Options
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sendNow"
                    name="sendOption"
                    checked={sendNow}
                    onChange={() => {
                      setSendNow(true);
                      setScheduledFor(undefined);
                    }}
                    className="w-4 h-4 text-brand-highlight bg-gray-100 border-gray-300 focus:ring-brand-highlight"
                  />
                  <Label htmlFor="sendNow" className="text-sm font-normal">
                    Send Now
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="schedule"
                    name="sendOption"
                    checked={!sendNow}
                    onChange={() => setSendNow(false)}
                    className="w-4 h-4 text-brand-highlight bg-gray-100 border-gray-300 focus:ring-brand-highlight"
                  />
                  <Label htmlFor="schedule" className="text-sm font-normal">
                    Schedule for Later
                  </Label>
                </div>
                {!sendNow && (
                  <div className="ml-6 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
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
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-highlight text-white hover:bg-brand-highlight/90"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
