import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Campaign } from "@/lib/types";

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: Partial<Campaign>) => {
      const { data } = await api.post("/campaigns", campaign);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}; 