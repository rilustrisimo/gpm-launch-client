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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, ExternalLink, Loader2, Download } from "lucide-react";
import { ContactList } from "@/lib/types";
import { EditContactListModal } from "./EditContactListModal";
import { DeleteContactListDialog } from "./DeleteContactListDialog";
import { ExportContactListModal } from "./ExportContactListModal";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
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
import { useContactLists } from "@/hooks/useContactLists";

interface ContactListTableProps {
  searchTerm?: string;
}

export const ContactListTable = ({ searchTerm = "" }: ContactListTableProps) => {
  const [listToEdit, setListToEdit] = useState<ContactList | null>(null);
  const [listToDelete, setListToDelete] = useState<ContactList | null>(null);
  const [listToExport, setListToExport] = useState<ContactList | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Use paginated API request
  const { 
    data, 
    isLoading,
    error
  } = useContactLists(searchTerm, currentPage, itemsPerPage);
  
  // Get total pages from API response
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const contactLists = data?.contactLists || [];
  
  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
  
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent mr-2" />
        <span>Loading contact lists...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading contact lists. Please try again.
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactLists.map((list) => (
              <TableRow 
                key={list.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={(e) => {
                  // Prevent navigation if clicking on the dropdown menu
                  if ((e.target as HTMLElement).closest('[role="menuitem"]')) {
                    return;
                  }
                  navigate(`/contact-lists/${list.id}`);
                }}
              >
                <TableCell className="font-medium">{list.name}</TableCell>
                <TableCell>{list.description || "-"}</TableCell>
                <TableCell>{list.count.toLocaleString()}</TableCell>
                <TableCell>{format(new Date(list.createdAt), "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(list.updatedAt), "MMM dd, yyyy")}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                      <DropdownMenuItem asChild>
                        <Link to={`/contact-lists/${list.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View Contacts</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setListToExport(list)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Export Contacts</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setListToEdit(list)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setListToDelete(list)}
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
            
            {contactLists.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No contact lists found.
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
              Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} lists
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
                  onClick={() => goToPage(currentPage - 1)}
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
                      onClick={() => goToPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {listToEdit && (
        <EditContactListModal
          contactList={listToEdit}
          open={!!listToEdit}
          onOpenChange={() => setListToEdit(null)}
        />
      )}
      
      {listToDelete && (
        <DeleteContactListDialog
          contactList={listToDelete}
          open={!!listToDelete}
          onOpenChange={() => setListToDelete(null)}
        />
      )}

      {listToExport && (
        <ExportContactListModal
          contactList={listToExport}
          open={!!listToExport}
          onOpenChange={() => setListToExport(null)}
        />
      )}
    </>
  );
};