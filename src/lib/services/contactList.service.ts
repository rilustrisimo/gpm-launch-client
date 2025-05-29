import api from '../api';
import { ContactList, Contact, ApiResponse } from '../types';

/**
 * Service for handling contact list-related API requests
 */
export const contactListService = {
  /**
   * Get all contact lists
   * @param search - Optional search term
   */
  getAll: async (search?: string): Promise<ContactList[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await api.get<ApiResponse<{ contactLists: ContactList[] }>>(
        `/contact-lists?${params.toString()}`
      );
      
      return response.data.contactLists || [];
    } catch (error) {
      console.error('Error fetching contact lists:', error);
      throw error;
    }
  },
  
  /**
   * Get a contact list by ID
   * @param id - Contact list ID
   */
  getById: async (id: number): Promise<ContactList> => {
    try {
      const response = await api.get<ApiResponse<{ contactList: ContactList }>>(
        `/contact-lists/${id}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch contact list');
      }
      
      return response.data.contactList;
    } catch (error) {
      console.error(`Error fetching contact list with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get contacts in a list
   * @param id - Contact list ID
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @param search - Optional search term
   * @param status - Optional status filter
   */
  getContacts: async (
    id: number, 
    page: number = 1, 
    limit: number = 50, 
    search?: string,
    status?: string
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
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await api.get<ApiResponse<{
        contactList: Pick<ContactList, 'id' | 'name' | 'description' | 'count'>;
        contacts: Contact[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      }>>(
        `/contact-lists/${id}/contacts?${params.toString()}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch contacts in list');
      }
      
      return {
        contactList: response.data.contactList,
        contacts: response.data.contacts || [],
        pagination: response.data.pagination || {
          total: 0,
          page,
          limit,
          pages: 0
        }
      };
    } catch (error) {
      console.error(`Error fetching contacts for list with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new contact list
   * @param contactList - Contact list data
   */
  create: async (contactList: Pick<ContactList, 'name' | 'description'>): Promise<ContactList> => {
    try {
      const response = await api.post<ApiResponse<{ contactList: ContactList }>>(
        '/contact-lists',
        contactList
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to create contact list');
      }
      
      return response.data.contactList;
    } catch (error) {
      console.error('Error creating contact list:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing contact list
   * @param id - Contact list ID
   * @param contactList - Updated contact list data
   */
  update: async (
    id: number, 
    contactList: Pick<ContactList, 'name' | 'description'>
  ): Promise<ContactList> => {
    try {
      const response = await api.put<ApiResponse<{ contactList: ContactList }>>(
        `/contact-lists/${id}`,
        contactList
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to update contact list');
      }
      
      return response.data.contactList;
    } catch (error) {
      console.error(`Error updating contact list with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a contact list
   * @param id - Contact list ID
   */
  delete: async (id: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/contact-lists/${id}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to delete contact list');
      }
    } catch (error) {
      console.error(`Error deleting contact list with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Add contacts to a list
   * @param id - Contact list ID
   * @param contactIds - Array of contact IDs to add to the list
   */
  addContacts: async (id: number, contactIds: number[]): Promise<{
    id: number;
    name: string;
    count: number;
  }> => {
    try {
      const response = await api.post<ApiResponse<{
        contactList: {
          id: number;
          name: string;
          count: number;
        };
      }>>(
        `/contact-lists/${id}/contacts`,
        { contactIds }
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to add contacts to list');
      }
      
      return response.data.contactList;
    } catch (error) {
      console.error(`Error adding contacts to list with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Remove contacts from a list
   * @param id - Contact list ID
   * @param contactIds - Array of contact IDs to remove from the list
   */
  removeContacts: async (id: number, contactIds: number[]): Promise<{
    id: number;
    name: string;
    count: number;
  }> => {
    try {
      const response = await api.delete<ApiResponse<{
        contactList: {
          id: number;
          name: string;
          count: number;
        };
      }>>(
        `/contact-lists/${id}/contacts`,
        { data: { contactIds } }
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to remove contacts from list');
      }
      
      return response.data.contactList;
    } catch (error) {
      console.error(`Error removing contacts from list with ID ${id}:`, error);
      throw error;
    }
  }
}; 