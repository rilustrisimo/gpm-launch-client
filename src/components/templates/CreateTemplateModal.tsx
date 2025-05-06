
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
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateTemplateModal() {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Template created",
      description: "Your email template has been created successfully.",
    });
    
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTemplateName("");
    setDescription("");
    setCategory("");
    setSubject("");
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl text-brand-accent">Create Email Template</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new email template for your campaigns. Templates can include personalization tokens.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-5">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="templateName" className="text-right font-medium text-brand-accent">
                Name
              </Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="col-span-4"
                placeholder="Monthly Newsletter"
                required
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="category" className="text-right font-medium text-brand-accent">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-4">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="description" className="text-right font-medium text-brand-accent">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-4"
                placeholder="Template for monthly updates and news"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="subject" className="text-right font-medium text-brand-accent">
                Subject Line
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="col-span-4"
                placeholder="Your Monthly Newsletter"
                required
              />
            </div>
            <div className="grid grid-cols-5 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2 font-medium text-brand-accent">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-4"
                placeholder="Hello {{first_name}}, welcome to our newsletter..."
                rows={12}
                required
              />
            </div>
            <div className="col-span-5 bg-muted/30 p-4 rounded-md mt-2">
              <p className="text-sm font-medium text-brand-accent mb-2">Available Personalization Tokens:</p>
              <div className="grid grid-cols-2 gap-2">
                <code className="bg-muted p-1 rounded text-xs">{"{{first_name}}"}</code>
                <code className="bg-muted p-1 rounded text-xs">{"{{last_name}}"}</code>
                <code className="bg-muted p-1 rounded text-xs">{"{{email}}"}</code>
                <code className="bg-muted p-1 rounded text-xs">{"{{company}}"}</code>
                <code className="bg-muted p-1 rounded text-xs">{"{{unsubscribe_link}}"}</code>
                <code className="bg-muted p-1 rounded text-xs">{"{{current_date}}"}</code>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-highlight text-white hover:bg-brand-highlight/90"
            >
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
