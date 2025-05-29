import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templateService } from '@/lib/services';
import { Template } from '@/lib/types';
import { toast } from 'sonner';

// Query keys
const TEMPLATES_KEY = 'templates';

/**
 * Hook to fetch all templates
 */
export const useTemplates = (search?: string, category?: string) => {
  return useQuery({
    queryKey: [TEMPLATES_KEY, { search, category }],
    queryFn: () => templateService.getAll(search, category),
  });
};

/**
 * Hook to fetch a single template by ID
 */
export const useTemplate = (id: number) => {
  return useQuery({
    queryKey: [TEMPLATES_KEY, id],
    queryFn: () => templateService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new template
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: Partial<Template>) => templateService.create(template),
    onSuccess: () => {
      toast.success('Template created successfully');
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing template
 */
export const useUpdateTemplate = (id: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: Partial<Template>) => templateService.update(id, template),
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a template
 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => templateService.delete(id),
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}; 