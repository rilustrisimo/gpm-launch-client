
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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreateCampaignModal() {
  const [open, setOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [contactList, setContactList] = useState("");
  const [template, setTemplate] = useState("");
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Campaign created",
      description: "Your campaign has been created successfully.",
    });
    
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCampaignName("");
    setSubject("");
    setContactList("");
    setTemplate("");
    setDate(undefined);
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
              <Select value={contactList} onValueChange={setContactList} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a contact list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Subscribers</SelectItem>
                  <SelectItem value="electronics">Product Interest - Electronics</SelectItem>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Email Template
              </Label>
              <Select value={template} onValueChange={setTemplate} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="newsletter">Monthly Newsletter</SelectItem>
                  <SelectItem value="product">Product Announcement</SelectItem>
                  <SelectItem value="promotion">Special Promotion</SelectItem>
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
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
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
            <Button type="submit" className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
              Create Campaign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
