import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Campaign } from "@/lib/types";
import { campaignService } from "@/lib/services/campaign.service";

interface ScheduleCampaignModalProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled: () => void;
}

export const ScheduleCampaignModal = ({
  campaign,
  open,
  onOpenChange,
  onScheduled,
}: ScheduleCampaignModalProps) => {
  const [date, setDate] = useState<Date>();
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!date) return;

    setIsScheduling(true);
    try {
      await campaignService.scheduleCampaign(campaign.id, date.toISOString());
      onScheduled();
      onOpenChange(false);
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      alert("Failed to schedule campaign. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Campaign</DialogTitle>
          <DialogDescription>
            Choose when to send "{campaign.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule-date" className="text-right">
              Send Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!date || isScheduling}
          >
            {isScheduling ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 