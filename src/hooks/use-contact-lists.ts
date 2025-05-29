import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useContactLists = () => {
  return useQuery({
    queryKey: ["contactLists"],
    queryFn: async () => {
      const { data } = await api.get("/contact-lists");
      return data.contactLists;
    },
  });
}; 