import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService, CreateContactDto, UpdateContactDto, ImportContactsDto } from '@/services/contact';
import { toast } from 'sonner';

// Keys for React Query
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: string, page: number, limit: number) => [...contactKeys.lists(), { filters, page, limit }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: number) => [...contactKeys.details(), id] as const,
};

// Get all contacts with optional search and pagination
export const useContacts = (search?: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: contactKeys.list(search || 'all', page, limit),
    queryFn: () => contactService.getContacts(search, page, limit),
  });
};

// Get a single contact by ID
export const useContact = (id: number) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactService.getContact(id),
    enabled: !!id,
  });
};

// Create a new contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contactData: CreateContactDto) => contactService.createContact(contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success('Contact created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create contact');
    }
  });
};

// Update a contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, contactData }: { id: number; contactData: UpdateContactDto }) => 
      contactService.updateContact(id, contactData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success('Contact updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update contact');
    }
  });
};

// Delete a contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => contactService.deleteContact(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success('Contact deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete contact');
    }
  });
};

// Import contacts
export const useImportContacts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ImportContactsDto) => contactService.importContacts(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      
      // Use detailed import summary for toast message
      const { importSummary } = data;
      toast.success(
        `Import completed: ${importSummary.successful} of ${importSummary.total} contacts imported successfully`,
        {
          description: importSummary.failed > 0 
            ? `${importSummary.failed} contacts failed validation` 
            : undefined,
          duration: 5000
        }
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to import contacts');
    }
  });
};