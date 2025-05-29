import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useUpdateContactList } from "@/hooks/useContactLists";
import { ContactList } from "@/lib/types";

interface EditContactListModalProps {
  contactList: ContactList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactListModal({ contactList, open, onOpenChange }: EditContactListModalProps) {
  const [name, setName] = useState(contactList.name);
  const [description, setDescription] = useState(contactList.description || "");
  
  const { mutate: updateList, isPending } = useUpdateContactList();

  // Update form when contact list changes
  useEffect(() => {
    setName(contactList.name);
    setDescription(contactList.description || "");
  }, [contactList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateList(
      {
        id: contactList.id,
        listData: { name, description }
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Contact List</DialogTitle>
            <DialogDescription>
              Update the contact list's information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isPending}
              className="bg-brand-highlight text-white hover:bg-brand-highlight/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 