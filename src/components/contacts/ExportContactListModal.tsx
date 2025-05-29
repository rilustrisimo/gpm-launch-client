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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContactList } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { contactListService } from "@/lib/services/contactList.service";

type ContactListExport = Pick<ContactList, 'id' | 'name' | 'count'>;

interface ExportContactListModalProps {
  contactList: ContactListExport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportContactListModal = ({
  contactList,
  open,
  onOpenChange,
}: ExportContactListModalProps) => {
  const [contactsPerFile, setContactsPerFile] = useState("1000");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Calculate number of files needed
      const totalContacts = contactList.count;
      const contactsPerFileNum = parseInt(contactsPerFile);
      const numFiles = Math.ceil(totalContacts / contactsPerFileNum);

      // Create an array to store all CSV files
      const csvFiles: Blob[] = [];

      // Generate CSV files in chunks
      for (let i = 0; i < numFiles; i++) {
        const page = i + 1;
        const limit = contactsPerFileNum;

        // Fetch contacts for this chunk using the service
        const { contacts } = await contactListService.getContacts(
          contactList.id,
          page,
          limit
        );

        // Generate CSV content
        const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Status", "Last Engagement"];
        const csvContent = [
          headers.join(","),
          ...contacts.map((contact) => [
            contact.firstName || "",
            contact.lastName || "",
            contact.email || "",
            contact.phone || "",
            contact.company || "",
            contact.status || "",
            contact.lastEngagement ? new Date(contact.lastEngagement).toLocaleDateString() : "",
          ].map(field => `"${field.replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        // Create blob for this CSV file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        csvFiles.push(blob);
      }

      // If multiple files, create a zip
      if (csvFiles.length > 1) {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        // Add each CSV file to the zip
        csvFiles.forEach((blob, index) => {
          zip.file(`contacts_${index + 1}.csv`, blob);
        });

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${contactList.name}_contacts.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Download single CSV file
        const url = window.URL.createObjectURL(csvFiles[0]);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${contactList.name}_contacts.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting contacts:", error);
      alert("Failed to export contacts. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Contacts</DialogTitle>
          <DialogDescription>
            Export contacts from "{contactList.name}" to CSV files.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactsPerFile" className="text-right">
              Contacts per file
            </Label>
            <Select
              value={contactsPerFile}
              onValueChange={setContactsPerFile}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1,000</SelectItem>
                <SelectItem value="10000">10,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 