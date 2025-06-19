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
import { CloudUpload, FileText, Upload, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useImportContacts } from "@/hooks/useContacts";
import { useContactLists } from "@/hooks/useContactLists";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateContactDto } from "@/services/contact";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface ImportContactsModalProps {
  listId?: string;
}

export function ImportContactsModal({ listId }: ImportContactsModalProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>(listId || "");
  const [isUploading, setIsUploading] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [validationResults, setValidationResults] = useState<{
    valid: CreateContactDto[];
    invalid: Array<{ contact: CreateContactDto; reason: string }>;
    summary?: {
      total: number;
      successful: number;
      failed: number;
      failureReasons: Record<string, number>;
    };
  } | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  
  const { toast } = useToast();
  const { mutate: importContacts, isPending } = useImportContacts();
  const { data: listsData, isLoading: listsLoading } = useContactLists(undefined, 1, 100);
  const contactLists = listsData?.contactLists || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setValidationResults(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    
    if (!open) {
      setTimeout(() => {
        setFiles([]);
        setSelectedListId("");
        setValidationResults(null);
        setImportProgress(0);
        setHasHeaders(true);
        setSkipDuplicates(true);
      }, 300);
    } else {
      setFiles([]);
      setSelectedListId("");
      setValidationResults(null);
      setImportProgress(0);
      setHasHeaders(true);
      setSkipDuplicates(true);
    }
  };

  const consolidateFiles = async (files: File[]): Promise<CreateContactDto[]> => {
    const allContacts: CreateContactDto[] = [];
    let headers: string[] = [];

    // Helper function to parse CSV line properly handling quoted fields
    const parseCsvLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            current += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Add last field
      values.push(current.trim());
      return values;
    };

    // Helper function to clean field values
    const cleanField = (value: string): string => {
      if (!value) return '';
      
      // Trim whitespace
      let cleaned = value.trim();
      
      // Remove surrounding quotes (single or double)
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      
      // Remove any remaining quotes at the beginning or end
      cleaned = cleaned.replace(/^["']+|["']+$/g, '');
      
      // Final trim
      return cleaned.trim();
    };

    // Helper function to clean email specifically
    const cleanEmail = (email: string): string => {
      const cleaned = cleanField(email);
      // Additional email-specific cleaning
      return cleaned.toLowerCase().replace(/\s+/g, '');
    };

    for (const file of files) {
      const text = await file.text();
      const lines = text.split(/\r?\n/); // Handle both \n and \r\n line endings
      
      if (lines.length === 0) continue;
      
      // Get headers from first file only
      if (headers.length === 0) {
        if (hasHeaders) {
          headers = parseCsvLine(lines[0]).map(h => cleanField(h).toLowerCase());
        } else {
          headers = ["email", "firstname", "lastname", "phone"];
        }
      }
      
      const emailIndex = headers.findIndex(h => h === "email");
      const firstNameIndex = headers.findIndex(h => h === "firstname" || h === "first_name" || h === "first name");
      const lastNameIndex = headers.findIndex(h => h === "lastname" || h === "last_name" || h === "last name");
      const phoneIndex = headers.findIndex(h => h === "phone" || h === "phone_number" || h === "phone number");
      
      const dataStartLine = hasHeaders ? 1 : 0;
      
      const fileContacts = lines.slice(dataStartLine)
        .filter(line => line.trim() !== "")
        .map(line => {
          const values = parseCsvLine(line);
          const email = emailIndex >= 0 && emailIndex < values.length ? cleanEmail(values[emailIndex]) : "";
          
          // Skip if no valid email
          if (!email || !email.includes('@')) return null;
          
          const phoneValue = phoneIndex >= 0 && phoneIndex < values.length ? cleanField(values[phoneIndex]) : "";
          
          const contactData: CreateContactDto = {
            email,
            firstName: firstNameIndex >= 0 && firstNameIndex < values.length ? cleanField(values[firstNameIndex]) : "",
            lastName: lastNameIndex >= 0 && lastNameIndex < values.length ? cleanField(values[lastNameIndex]) : "",
            status: "active"
          };
          
          if (phoneValue) {
            contactData.phone = phoneValue;
          }
          
          return contactData;
        })
        .filter(contact => contact !== null);
      
      allContacts.push(...fileContacts);
    }

    return allContacts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    if (!selectedListId) {
      toast({
        title: "List Required",
        description: "Please select a contact list to import to.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setImportProgress(0);
      setValidationResults(null);
      
      // Consolidate all files into one array of contacts
      const contacts = await consolidateFiles(files);
      
      if (contacts.length === 0) {
        setIsUploading(false);
        toast({
          title: "No Valid Contacts",
          description: "No valid contacts found in the CSV files. Please check the file format.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Starting import with:', {
        listId: selectedListId,
        contactCount: contacts.length,
        firstContact: contacts[0]
      });
      
      toast({
        title: "Processing Import",
        description: `Starting to process ${contacts.length} contacts from ${files.length} files.`
      });
      
      importContacts(
        {
          contacts,
          listId: selectedListId,
          onProgress: (progress) => {
            setImportProgress(progress);
          }
        },
        {
          onSuccess: (result) => {
            console.log('Import result:', result);
            setValidationResults({
              valid: contacts.filter(c => !result.failed.find(f => f.contact.email === c.email)),
              invalid: result.failed,
              summary: result.importSummary
            });
            
            if (result.failed.length > 0) {
              toast({
                title: "Import Completed with Warnings",
                description: `Successfully imported ${result.count} contacts. ${result.failed.length} contacts failed validation.`,
                duration: 5000
              });
            } else {
              setOpen(false);
              setFiles([]);
              setSelectedListId("");
            }
          },
          onError: (error) => {
            console.error('Import error:', error);
            toast({
              title: "Import Failed",
              description: error.message,
              variant: "destructive"
            });
          },
          onSettled: () => {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred while processing the import.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <Upload className="h-4 w-4 mr-2" /> Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload CSV files containing contact information. The first row should contain headers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="list" className="md:text-right font-medium text-brand-accent">
                Add to List
              </Label>
              <div className="md:col-span-3">
                <Select
                  value={selectedListId}
                  onValueChange={setSelectedListId}
                  required
                >
                  <SelectTrigger id="list" className="col-span-3">
                    <SelectValue placeholder="Select a list (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {listsLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading lists...</span>
                      </div>
                    ) : contactLists?.length ? (
                      contactLists.map(list => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">No lists available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-muted/10 rounded-lg overflow-hidden">
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-brand-highlight transition-colors">
                  <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-brand-highlight" />
                    <span className="text-base font-medium text-brand-accent">
                      Drag & drop or click to upload CSV files
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {files.length > 0 ? `${files.length} file(s) selected` : "Maximum file size: 10MB per file"}
                    </span>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-brand-accent">Selected Files:</Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/20 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-accent" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Remove file</span>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
            
            <div className="mt-6 bg-muted/20 p-5 rounded-md">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-brand-accent mb-2">Expected CSV Format:</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded mb-2">
                    email,first_name,last_name,phone
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The email field is required. All other fields are optional.
                  </p>
                </div>
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing contacts from {files.length} files...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <DialogFooter className="px-6 py-4 bg-muted/10 flex items-center justify-end space-x-3 border-t mt-auto shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending || isUploading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-highlight text-white hover:bg-brand-highlight/90"
              disabled={files.length === 0 || isPending || isUploading}
            >
              {isPending || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
