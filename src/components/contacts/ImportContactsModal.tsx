
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
import { CloudUpload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import contacts to a list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                CSV File
              </Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
                {file && <p className="text-sm text-muted-foreground mt-1">{file.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetList" className="text-right">
                Target List
              </Label>
              <Select value={targetList} onValueChange={setTargetList} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Subscribers</SelectItem>
                  <SelectItem value="electronics">Product Interest - Electronics</SelectItem>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hasHeaders" className="text-right">
                Has Headers
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="hasHeaders"
                  checked={hasHeaders}
                  onCheckedChange={setHasHeaders}
                />
                <Label htmlFor="hasHeaders" className="text-sm text-muted-foreground">
                  First row contains column headers
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skipDuplicates" className="text-right">
                Skip Duplicates
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="skipDuplicates"
                  checked={skipDuplicates}
                  onCheckedChange={setSkipDuplicates}
                />
                <Label htmlFor="skipDuplicates" className="text-sm text-muted-foreground">
                  Skip importing duplicate email addresses
                </Label>
              </div>
            </div>
            <div className="col-span-4 px-4 py-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-1">Expected CSV Format:</p>
              <p className="text-xs text-muted-foreground">
                email,first_name,last_name,company,phone
              </p>
            </div>
          </div>
          <DialogFooter>
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
