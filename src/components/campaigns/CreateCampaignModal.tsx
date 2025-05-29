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

export function CreateCampaignModal() {
  const [open, setOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [contactListId, setContactListId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(undefined);

  // Fetch templates and contact lists
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: contactLists, isLoading: contactListsLoading } = useContactLists();
  
  // Create campaign mutation
  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCampaign: Partial<Campaign> = {
      name: campaignName,
      subject,
      templateId: parseInt(templateId),
      contactListId: parseInt(contactListId),
      scheduledFor: scheduledFor ? scheduledFor.toISOString() : null
    };
    
    createCampaign(newCampaign, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setCampaignName("");
    setSubject("");
    setContactListId("");
    setTemplateId("");
    setScheduledFor(undefined);
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
              <Input
                id="name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="col-span-3"
                placeholder="Monthly Newsletter - May 2025"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="col-span-3"
                placeholder="Your Monthly Newsletter"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactList" className="text-right">
                Contact List
              </Label>
              <Select value={contactListId} onValueChange={setContactListId} required>
                <SelectTrigger id="contactList" className="col-span-3">
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Email Template
              </Label>
              <Select value={templateId} onValueChange={setTemplateId} required>
                <SelectTrigger id="template" className="col-span-3">
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Schedule Date
              </Label>
              <div className="col-span-3">
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
