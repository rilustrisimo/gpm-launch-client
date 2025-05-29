import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, AlertCircle, Loader2 } from "lucide-react";
import { Contact } from "@/lib/types";
import { EditContactModal } from "./EditContactModal";
import { DeleteContactDialog } from "./DeleteContactDialog";
import { format } from "date-fns";
import { useContacts } from "@/hooks/useContacts";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactTableProps {
  searchTerm?: string;
}

export const ContactTable = ({ searchTerm = "" }: ContactTableProps) => {
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Use paginated API request
  const { 
    data, 
    isLoading,
    error
  } = useContacts(searchTerm, currentPage, itemsPerPage);
  
  // Get total pages from API response
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const contacts = data?.contacts || [];
  
  // Clear selected contacts when page changes
  const handlePageChange = (page: number) => {
    setSelectedContactIds([]);
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const handleSelectAll = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map(contact => contact.id));
    }
  };
  
  const handleSelectOne = (contactId: number) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'unsubscribed':
        return 'bg-gray-100 text-gray-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Generate page numbers to show (with ellipsis for large ranges)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent mr-2" />
        <span>Loading contacts...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading contacts. Please try again.
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedContactIds.includes(contact.id)}
                    onCheckedChange={() => handleSelectOne(contact.id)}
                  />
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  {contact.firstName} {contact.lastName}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(contact.status)}`}>
                    {contact.status}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(contact.createdAt), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setContactToEdit(contact)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setContactToDelete(contact)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} contacts
            </span>
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, i) => (
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {contactToEdit && (
        <EditContactModal
          contact={contactToEdit}
          open={!!contactToEdit}
          onOpenChange={() => setContactToEdit(null)}
        />
      )}
      
      {contactToDelete && (
        <DeleteContactDialog
          contact={contactToDelete}
          open={!!contactToDelete}
          onOpenChange={() => setContactToDelete(null)}
        />
      )}
    </>
  );
};