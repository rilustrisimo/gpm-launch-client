import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactListService, CreateContactListDto, UpdateContactListDto } from '@/services/contactList';
import { toast } from 'sonner';
import { contactKeys } from './useContacts';

// Keys for React Query
export const contactListKeys = {
  all: ['contactLists'] as const,
  lists: () => [...contactListKeys.all, 'list'] as const,
  list: (filters: string, page: number, limit: number) => [...contactListKeys.lists(), { filters, page, limit }] as const,
  details: () => [...contactListKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactListKeys.details(), id] as const,
  contacts: (listId: string) => [...contactListKeys.detail(listId), 'contacts'] as const,
};

// Get all contact lists with optional search and pagination
export const useContactLists = (search?: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: contactListKeys.list(search || 'all', page, limit),
    queryFn: () => contactListService.getContactLists(search, page, limit),
  });
};

// Get a single contact list by ID
export const useContactList = (id: string) => {
  return useQuery({
    queryKey: contactListKeys.detail(id),
    queryFn: () => contactListService.getContactList(id),
    enabled: !!id,
  });
};

// Create a new contact list
export const useCreateContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listData: CreateContactListDto) => contactListService.createContactList(listData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactListKeys.lists() });
      toast.success('Contact list created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create contact list');
    }
  });
};

// Update a contact list
export const useUpdateContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, listData }: { id: string; listData: UpdateContactListDto }) => 
      contactListService.updateContactList(id, listData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactListKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: contactListKeys.lists() });
      toast.success('Contact list updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update contact list');
    }
  });
};

// Delete a contact list
export const useDeleteContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contactListService.deleteContactList(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: contactListKeys.lists() });
      toast.success('Contact list deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete contact list');
    }
  });
};

// Get contacts in a list with search and pagination
export const useContactsInList = (listId: string, page = 1, limit = 20, search?: string) => {
  return useQuery({
    queryKey: [...contactListKeys.contacts(listId), { page, limit, search }],
    queryFn: () => contactListService.getContacts(listId, page, limit, search),
    enabled: !!listId,
  });
};

// Add contacts to a list
export const useAddContactsToList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, contactIds }: { listId: string; contactIds: string[] }) => 
      contactListService.addContactsToList(listId, contactIds),
    onSuccess: (_, { listId }) => {
      queryClient.invalidateQueries({ queryKey: contactListKeys.contacts(listId) });
      queryClient.invalidateQueries({ queryKey: contactListKeys.detail(listId) });
      toast.success('Contacts added to list successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add contacts to list');
    }
  });
};

// Remove contacts from a list
export const useRemoveContactsFromList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, contactIds }: { listId: string; contactIds: string[] }) => 
      contactListService.removeContactsFromList(listId, contactIds),
    onSuccess: (_, { listId }) => {
      queryClient.invalidateQueries({ queryKey: contactListKeys.contacts(listId) });
      queryClient.invalidateQueries({ queryKey: contactListKeys.detail(listId) });
      toast.success('Contacts removed from list successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove contacts from list');
    }
  });
};