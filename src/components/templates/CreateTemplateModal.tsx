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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTemplate } from "@/hooks/use-templates";

export function CreateTemplateModal() {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const { mutate: createTemplate, isPending } = useCreateTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createTemplate(
      {
        name: templateName,
        description,
        category,
        subject,
        content,
      },
      {
        onSuccess: () => {
          toast({
            title: "Template created",
            description: "Your email template has been created successfully.",
          });
          setOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create template",
            variant: "destructive",
          });
        },
      }
    );
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
      <DialogContent className="sm:max-w-[700px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl text-brand-accent">Create Email Template</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new email template for your campaigns. Templates can include personalization tokens.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-6">
            {/* Template Name */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="templateName" className="md:text-right font-medium text-brand-accent">
                Name
              </Label>
              <div className="md:col-span-3">
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Monthly Newsletter"
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            
            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="md:text-right font-medium text-brand-accent">
                Category
              </Label>
              <div className="md:col-span-3">
                <Select value={category} onValueChange={setCategory} disabled={isPending}>
                  <SelectTrigger>
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
            </div>
            
            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="md:text-right font-medium text-brand-accent">
                Description
              </Label>
              <div className="md:col-span-3">
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Template for monthly updates and news"
                  disabled={isPending}
                />
              </div>
            </div>
            
            {/* Subject Line */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="md:text-right font-medium text-brand-accent">
                Subject Line
              </Label>
              <div className="md:col-span-3">
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your Monthly Newsletter"
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="md:text-right pt-2 font-medium text-brand-accent">
                Content
              </Label>
              <div className="md:col-span-3">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Hello {{first_name}}, welcome to our newsletter..."
                  rows={10}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            
            {/* Personalization Tokens */}
            <div className="mt-6 bg-muted/20 p-5 rounded-md">
              <p className="text-sm font-medium text-brand-accent mb-3">Available Personalization Tokens:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <code className="bg-muted p-2 rounded text-xs">{"{{first_name}}"}</code>
                <code className="bg-muted p-2 rounded text-xs">{"{{last_name}}"}</code>
                <code className="bg-muted p-2 rounded text-xs">{"{{email}}"}</code>
                <code className="bg-muted p-2 rounded text-xs">{"{{company}}"}</code>
                <code className="bg-muted p-2 rounded text-xs">{"{{unsubscribe_link}}"}</code>
                <code className="bg-muted p-2 rounded text-xs">{"{{current_date}}"}</code>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 bg-muted/10 flex items-center justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-highlight text-white hover:bg-brand-highlight/90"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Template'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
