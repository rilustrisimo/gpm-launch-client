import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Template } from "@/lib/types";

// Get all templates
export const useTemplates = (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["templates", params],
    queryFn: async () => {
      const { data } = await api.get("/templates", { params });
      return data;
    },
  });
};

// Get template by ID
export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const { data } = await api.get(`/templates/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Partial<Template>) => {
      const { data } = await api.post("/templates", template);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

// Update template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, template }: { id: string; template: Partial<Template> }) => {
      const { data } = await api.put(`/templates/${id}`, template);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", id] });
    },
  });
};

// Delete template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/templates/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

// Preview template
export const usePreviewTemplate = (id: string) => {
  return useQuery({
    queryKey: ["template-preview", id],
    queryFn: async () => {
      const { data } = await api.get(`/templates/${id}/preview`);
      return data;
    },
    enabled: !!id,
  });
};

// Copy template
export const useCopyTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch the template
      const { data } = await api.get(`/templates/${id}`);
      const template: Template = data.template;
      // Post a new template with copied data
      const { data: newData } = await api.post("/templates", {
        ...template,
        name: `Copy of ${template.name}`,
      });
      return newData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}; 