
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
import { CloudUpload, FileText, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export function ImportContactsModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetList, setTargetList] = useState("");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Import started",
      description: "Your contacts are being imported. We'll notify you when it's complete.",
    });
    
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFile(null);
    setTargetList("");
    setHasHeaders(true);
    setSkipDuplicates(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <CloudUpload className="h-4 w-4 mr-2" /> Import Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl text-brand-accent">Import Contacts</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a CSV file to import contacts to a list. Make sure your file follows the expected format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-6">
            {/* File Upload Area */}
            <div className="bg-muted/10 rounded-lg overflow-hidden">
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-brand-highlight transition-colors">
                  <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-brand-highlight" />
                    <span className="text-base font-medium text-brand-accent">
                      Drag & drop or click to upload a CSV file
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {file ? file.name : "Maximum file size: 10MB"}
                    </span>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Target List */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 pt-2">
              <Label htmlFor="targetList" className="md:text-right font-medium text-brand-accent">
                Target List
              </Label>
              <div className="md:col-span-3">
                <Select value={targetList} onValueChange={setTargetList} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Subscribers</SelectItem>
                    <SelectItem value="electronics">Product Interest - Electronics</SelectItem>
                    <SelectItem value="vip">VIP Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            {/* Import Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="hasHeaders" className="md:text-right font-medium text-brand-accent">
                  File Headers
                </Label>
                <div className="flex items-center space-x-3 md:col-span-3">
                  <Switch
                    id="hasHeaders"
                    checked={hasHeaders}
                    onCheckedChange={setHasHeaders}
                  />
                  <Label htmlFor="hasHeaders" className="text-sm text-muted-foreground font-normal">
                    First row contains column headers
                  </Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="skipDuplicates" className="md:text-right font-medium text-brand-accent">
                  Duplicates
                </Label>
                <div className="flex items-center space-x-3 md:col-span-3">
                  <Switch
                    id="skipDuplicates"
                    checked={skipDuplicates}
                    onCheckedChange={setSkipDuplicates}
                  />
                  <Label htmlFor="skipDuplicates" className="text-sm text-muted-foreground font-normal">
                    Skip importing duplicate email addresses
                  </Label>
                </div>
              </div>
            </div>
            
            {/* CSV Format Info */}
            <div className="mt-6 bg-muted/20 p-5 rounded-md">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-brand-accent mb-2">Expected CSV Format:</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded mb-2">
                    email,first_name,last_name,company,phone
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The email field is required. All other fields are optional.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 bg-muted/10 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
              Import Contacts
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
