import api from '@/lib/api';
import { ContactList, Contact } from '@/lib/types';

export interface CreateContactListDto {
  name: string;
  description?: string;
}

export interface UpdateContactListDto {
  name?: string;
  description?: string;
}

export interface ContactListsResponse {
  contactLists: ContactList[];
  total: number;
}

export interface ContactListResponse {
  contactList: ContactList;
}

export interface ContactsInListResponse {
  contactList: Pick<ContactList, 'id' | 'name' | 'description' | 'count'>;
  contacts: Contact[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const contactListService = {
  // Get all contact lists with pagination
  getContactLists: async (search?: string, page = 1, limit = 50): Promise<{ contactLists: ContactList[], total: number }> => {
    const params = { search, page, limit };
    const response = await api.get<ContactListsResponse>('/contact-lists', { params });
    return {
      contactLists: response.data.contactLists,
      total: response.data.total
    };
  },
  
  // Get a single contact list by ID
  getContactList: async (id: string): Promise<ContactList> => {
    const response = await api.get<ContactListResponse>(`/contact-lists/${id}`);
    return response.data.contactList;
  },
  
  // Create a new contact list
  createContactList: async (listData: CreateContactListDto): Promise<ContactList> => {
    const response = await api.post<ContactListResponse>('/contact-lists', listData);
    return response.data.contactList;
  },
  
  // Update a contact list
  updateContactList: async (id: string, listData: UpdateContactListDto): Promise<ContactList> => {
    const response = await api.put<ContactListResponse>(`/contact-lists/${id}`, listData);
    return response.data.contactList;
  },
  
  // Delete a contact list
  deleteContactList: async (id: string): Promise<void> => {
    await api.delete(`/contact-lists/${id}`);
  },
  
  // Get contacts in a list with search and pagination
  getContacts: async (
    listId: string,
    page = 1,
    limit = 20,
    search?: string
  ): Promise<{
    contactList: Pick<ContactList, 'id' | 'name' | 'description' | 'count'>;
    contacts: Contact[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> => {
    const params = { page, limit, search };
    const response = await api.get<ContactsInListResponse>(`/contact-lists/${listId}/contacts`, { params });
    return {
      contactList: response.data.contactList,
      contacts: response.data.contacts,
      pagination: response.data.pagination
    };
  },
  
  // Add contacts to a list
  addContactsToList: async (listId: string, contactIds: string[]): Promise<void> => {
    await api.post(`/contact-lists/${listId}/contacts`, { contactIds });
  },
  
  // Remove contacts from a list
  removeContactsFromList: async (listId: string, contactIds: string[]): Promise<void> => {
    await api.delete(`/contact-lists/${listId}/contacts`, { data: { contactIds } });
  }
};