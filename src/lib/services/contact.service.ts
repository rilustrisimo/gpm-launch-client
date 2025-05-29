import api from '../api';
import { Contact, ApiResponse } from '../types';

/**
 * Service for handling contact-related API requests
 */
export const contactService = {
  /**
   * Get all contacts
   * @param search - Optional search term
   * @param status - Optional status filter
   */
  getAll: async (search?: string, status?: string): Promise<Contact[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await api.get<ApiResponse<{ contacts: Contact[] }>>(
        `/contacts?${params.toString()}`
      );
      
      return response.data.contacts || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  /**
   * Get a contact by ID
   * @param id - Contact ID
   */
  getById: async (id: number): Promise<Contact> => {
    try {
      const response = await api.get<ApiResponse<{ contact: Contact }>>(
        `/contacts/${id}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch contact');
      }
      
      return response.data.contact;
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new contact
   * @param contact - Contact data
   */
  create: async (contact: Partial<Contact>): Promise<Contact> => {
    try {
      const response = await api.post<ApiResponse<{ contact: Contact }>>(
        '/contacts',
        contact
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to create contact');
      }
      
      return response.data.contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing contact
   * @param id - Contact ID
   * @param contact - Updated contact data
   */
  update: async (id: number, contact: Partial<Contact>): Promise<Contact> => {
    try {
      const response = await api.put<ApiResponse<{ contact: Contact }>>(
        `/contacts/${id}`,
        contact
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to update contact');
      }
      
      return response.data.contact;
    } catch (error) {
      console.error(`Error updating contact with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a contact
   * @param id - Contact ID
   */
  delete: async (id: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/contacts/${id}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to delete contact');
      }
    } catch (error) {
      console.error(`Error deleting contact with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Import contacts from CSV
   * @param file - CSV file containing contact data
   * @param listIds - Optional list IDs to add contacts to
   */
  importFromCsv: async (file: File, listIds?: number[]): Promise<{ 
    imported: number; 
    duplicates: number; 
    errors: number;
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (listIds && listIds.length > 0) {
        formData.append('listIds', JSON.stringify(listIds));
      }
      
      const response = await api.post<ApiResponse<{
        imported: number;
        duplicates: number;
        errors: number;
      }>>(
        '/contacts/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to import contacts');
      }
      
      return {
        imported: response.data.imported || 0,
        duplicates: response.data.duplicates || 0,
        errors: response.data.errors || 0
      };
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  },
  
  /**
   * Export contacts to CSV
   * @param listId - Optional list ID to filter contacts
   * @param status - Optional status to filter contacts
   */
  exportToCsv: async (listId?: number, status?: string): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      if (listId) params.append('listId', listId.toString());
      if (status) params.append('status', status);
      
      const response = await api.get(
        `/contacts/export?${params.toString()}`,
        {
          responseType: 'blob'
        }
      );
      
      return new Blob([response.data], { type: 'text/csv' });
    } catch (error) {
      console.error('Error exporting contacts:', error);
      throw error;
    }
  }
}; 