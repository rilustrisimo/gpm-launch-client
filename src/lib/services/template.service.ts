import api from '../api';
import { Template, ApiResponse } from '../types';

/**
 * Service for handling template-related API requests
 */
export const templateService = {
  /**
   * Get all templates
   * @param search - Optional search term
   * @param category - Optional category filter
   */
  getAll: async (search?: string, category?: string): Promise<Template[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await api.get<ApiResponse<{ templates: Template[] }>>(
        `/templates?${params.toString()}`
      );
      
      return response.data.templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },
  
  /**
   * Get a template by ID
   * @param id - Template ID
   */
  getById: async (id: number): Promise<Template> => {
    try {
      const response = await api.get<ApiResponse<{ template: Template }>>(
        `/templates/${id}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch template');
      }
      
      return response.data.template;
    } catch (error) {
      console.error(`Error fetching template with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new template
   * @param template - Template data
   */
  create: async (template: Partial<Template>): Promise<Template> => {
    try {
      const response = await api.post<ApiResponse<{ template: Template }>>(
        '/templates',
        template
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to create template');
      }
      
      return response.data.template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing template
   * @param id - Template ID
   * @param template - Updated template data
   */
  update: async (id: number, template: Partial<Template>): Promise<Template> => {
    try {
      const response = await api.put<ApiResponse<{ template: Template }>>(
        `/templates/${id}`,
        template
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to update template');
      }
      
      return response.data.template;
    } catch (error) {
      console.error(`Error updating template with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a template
   * @param id - Template ID
   */
  delete: async (id: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/templates/${id}`
      );
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error(`Error deleting template with ID ${id}:`, error);
      throw error;
    }
  }
}; 