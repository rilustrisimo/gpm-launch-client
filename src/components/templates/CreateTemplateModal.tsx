
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

export function CreateTemplateModal() {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
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
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template for your campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="templateName" className="text-right">
                Name
              </Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="col-span-3"
                placeholder="Monthly Newsletter"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Template for monthly updates and news"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject Line
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3"
                placeholder="Hello {{first_name}}, welcome to our newsletter..."
                rows={10}
                required
              />
            </div>
            <div className="col-span-4 text-sm text-muted-foreground">
              <p>Available tokens: {{first_name}}, {{last_name}}, {{email}}, {{unsubscribe}}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
